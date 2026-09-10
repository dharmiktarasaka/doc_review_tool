import { waManager } from './whatsapp.js';
import { formatReviewMessage } from './templates.js';

export class CampaignQueue {
  constructor(sessionId = 'default', waService = null) {
    this.sessionId = sessionId;
    this.safeSessionId = String(sessionId).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64) || 'default';
    this.waService = waService || waManager.getSession(this.safeSessionId);

    this.io = null;
    this.isRunning = false;
    this.isPaused = false;
    this.isAborted = false;

    this.contacts = [];
    this.templates = [];
    this.clinicConfig = {
      clinic_name: '',
      doctor_name: '',
      review_link: '',
      default_country_code: '91'
    };
    this.settings = {
      minDelaySeconds: 15,
      maxDelaySeconds: 30,
      batchSize: 15,
      batchPauseSeconds: 90,
      simulateTyping: true,
      typingSeconds: 3
    };

    this.stats = {
      total: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      currentIndex: 0,
      currentContact: null,
      status: 'idle', // 'idle' | 'running' | 'paused' | 'cooling_down' | 'completed' | 'stopped'
      cooldownRemaining: 0
    };

    this.logs = [];
    this.pausePromiseResolve = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  emitUpdate() {
    if (this.io) {
      this.io.to(`session_${this.sessionId}`).emit('campaign_update', {
        sessionId: this.sessionId,
        stats: this.stats,
        isRunning: this.isRunning,
        isPaused: this.isPaused
      });
    }
  }

  log(type, message, details = {}) {
    const entry = {
      id: Date.now() + Math.random().toString(36).substring(2, 6),
      sessionId: this.sessionId,
      timestamp: new Date().toLocaleTimeString(),
      type, // 'info' | 'success' | 'warning' | 'error' | 'security'
      message,
      details
    };
    this.logs.unshift(entry);
    if (this.logs.length > 200) this.logs.pop();

    if (this.io) {
      this.io.to(`session_${this.sessionId}`).emit('campaign_log', entry);
    }
  }

  getStatus() {
    return {
      sessionId: this.sessionId,
      stats: this.stats,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      logs: this.logs.slice(0, 50)
    };
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async checkPauseOrAbort() {
    if (this.isAborted) {
      throw new Error('CAMPAIGN_ABORTED');
    }
    if (this.isPaused) {
      this.log('warning', 'Campaign paused. Waiting for resume signal...');
      this.stats.status = 'paused';
      this.emitUpdate();
      await new Promise((resolve) => {
        this.pausePromiseResolve = resolve;
      });
      this.stats.status = 'running';
      this.emitUpdate();
      this.log('info', 'Campaign resumed by user.');
    }
  }

  async start({ contacts, templates, clinicConfig, settings }) {
    if (this.isRunning) {
      throw new Error('A campaign is already currently running.');
    }

    if (!contacts || contacts.length === 0) {
      throw new Error('No contacts provided.');
    }

    if (!templates || templates.length === 0) {
      throw new Error('Please select at least 1 review template.');
    }

    if (this.waService.getStatus().status !== 'connected') {
      throw new Error('WhatsApp is not connected. Please connect in Step 1 first.');
    }

    this.isRunning = true;
    this.isPaused = false;
    this.isAborted = false;
    this.contacts = contacts;
    this.templates = templates;
    this.clinicConfig = { ...this.clinicConfig, ...clinicConfig };
    this.settings = { ...this.settings, ...settings };

    this.stats = {
      total: contacts.length,
      sent: 0,
      failed: 0,
      pending: contacts.length,
      currentIndex: 0,
      currentContact: null,
      status: 'running',
      cooldownRemaining: 0
    };

    this.logs = [];
    this.log('security', `🚀 Starting Anti-Ban Campaign for ${contacts.length} patients.`);
    this.log('info', `Security Profile: ${this.templates.length} templates active, ${this.settings.minDelaySeconds}-${this.settings.maxDelaySeconds}s delay jitter.`);
    this.emitUpdate();

    // Run execution in background loop
    this.runQueue().catch((err) => {
      console.error(`[CampaignQueue][${this.sessionId}] Execution error:`, err);
    });

    return this.getStatus();
  }

  async runQueue() {
    try {
      for (let i = 0; i < this.contacts.length; i++) {
        await this.checkPauseOrAbort();

        const contact = this.contacts[i];
        this.stats.currentIndex = i + 1;
        this.stats.currentContact = contact;
        this.emitUpdate();

        // 1. Format Phone Number JID
        const jid = this.waService.formatToJid(
          contact.phone || contact.mobile || contact.contact,
          this.clinicConfig.default_country_code || '91'
        );

        if (!jid) {
          this.stats.failed++;
          this.stats.pending--;
          this.log('error', `Invalid phone number for ${contact.name || 'patient'}: ${contact.phone}`);
          this.emitUpdate();
          continue;
        }

        // 2. Pick a random template from selected templates (Anti-Ban rotation)
        const chosenTemplate = this.templates[Math.floor(Math.random() * this.templates.length)];
        const personalizedMessage = formatReviewMessage(chosenTemplate.text, {
          patient_name: contact.name || 'Patient',
          doctor_name: this.clinicConfig.doctor_name,
          clinic_name: this.clinicConfig.clinic_name,
          review_link: this.clinicConfig.review_link
        });

        // 3. Human Typing Simulation (Presence update)
        if (this.settings.simulateTyping) {
          const typingDuration = (this.settings.typingSeconds || 3) * 1000;
          this.log('info', `Simulating typing for ${contact.name || contact.phone}... (${typingDuration / 1000}s)`);
          await this.waService.simulateTyping(jid, typingDuration);
        }

        await this.checkPauseOrAbort();

        // 4. Send Message via WhatsApp
        try {
          await this.waService.sendMessage(jid, personalizedMessage);
          this.stats.sent++;
          this.stats.pending--;
          this.log('success', `Sent review invitation to ${contact.name || contact.phone}`, {
            phone: contact.phone,
            templateId: chosenTemplate.id
          });
        } catch (sendErr) {
          this.stats.failed++;
          this.stats.pending--;
          this.log('error', `Failed to deliver message to ${contact.phone}: ${sendErr.message}`);
        }

        this.emitUpdate();

        // Check if finished
        if (i === this.contacts.length - 1) {
          break;
        }

        // 5. Batch Pause Cool-down (Anti-Ban check)
        const messagesSentSoFar = this.stats.sent + this.stats.failed;
        if (this.settings.batchSize > 0 && messagesSentSoFar % this.settings.batchSize === 0) {
          const pauseSec = this.settings.batchPauseSeconds || 90;
          this.log('security', `🛡️ Anti-ban Cool-down: Pausing for ${pauseSec}s after batch of ${this.settings.batchSize} messages...`);
          this.stats.status = 'cooling_down';

          for (let sec = pauseSec; sec > 0; sec--) {
            await this.checkPauseOrAbort();
            this.stats.cooldownRemaining = sec;
            this.emitUpdate();
            await this.sleep(1000);
          }
          this.stats.cooldownRemaining = 0;
          this.stats.status = 'running';
          this.log('info', 'Cool-down finished. Resuming delivery.');
        } else {
          // 6. Randomized Jitter Delay between individual messages
          const min = Number(this.settings.minDelaySeconds) || 12;
          const max = Number(this.settings.maxDelaySeconds) || 28;
          const randomDelay = Math.floor(Math.random() * (max - min + 1)) + min;

          this.log('info', `Anti-Ban safety jitter: waiting ${randomDelay}s before next message...`);
          for (let sec = randomDelay; sec > 0; sec--) {
            await this.checkPauseOrAbort();
            await this.sleep(1000);
          }
        }
      }

      this.stats.status = 'completed';
      this.isRunning = false;
      this.log('success', `🎉 Campaign Complete! Total Sent: ${this.stats.sent}, Failed: ${this.stats.failed}`);
      this.emitUpdate();
    } catch (err) {
      if (err.message === 'CAMPAIGN_ABORTED') {
        this.stats.status = 'stopped';
        this.log('warning', 'Campaign was stopped by the user.');
      } else {
        this.stats.status = 'error';
        this.log('error', `Campaign stopped unexpectedly: ${err.message}`);
      }
      this.isRunning = false;
      this.emitUpdate();
    }
  }

  pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this.stats.status = 'paused';
    this.emitUpdate();
  }

  resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this.stats.status = 'running';
    if (this.pausePromiseResolve) {
      this.pausePromiseResolve();
      this.pausePromiseResolve = null;
    }
    this.emitUpdate();
  }

  stop() {
    if (!this.isRunning) return;
    this.isAborted = true;
    this.isRunning = false;
    this.isPaused = false;
    this.stats.status = 'stopped';
    if (this.pausePromiseResolve) {
      this.pausePromiseResolve();
      this.pausePromiseResolve = null;
    }
    this.emitUpdate();
  }
}

export class CampaignManager {
  constructor() {
    this.queues = new Map();
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
    for (const queue of this.queues.values()) {
      queue.setSocketIO(io);
    }
  }

  getQueue(sessionId = 'default') {
    const safeId = String(sessionId || 'default').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64) || 'default';
    if (!this.queues.has(safeId)) {
      const wa = waManager.getSession(safeId);
      const queue = new CampaignQueue(safeId, wa);
      if (this.io) queue.setSocketIO(this.io);
      this.queues.set(safeId, queue);
    }
    return this.queues.get(safeId);
  }
}

export const campaignManager = new CampaignManager();
export const campaignQueue = campaignManager.getQueue('default');

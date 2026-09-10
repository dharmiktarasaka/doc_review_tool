import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_FOLDER = path.join(__dirname, 'session_auth');

class WhatsAppService {
  constructor() {
    this.sock = null;
    this.qrCode = null;
    this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'qrcode' | 'connected'
    this.user = null;
    this.io = null;
    this.logger = pino({ level: 'warn' });
    this.reconnectAttempts = 0;
    this.lastDisconnectReason = null;
    this.lastInitError = null;
    this.debugLogs = [];
  }

  logDebug(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}`;
    console.log(entry);
    this.debugLogs.push(entry);
    if (this.debugLogs.length > 50) this.debugLogs.shift();
  }

  setSocketIO(io) {
    this.io = io;
  }

  emitState() {
    if (this.io) {
      this.io.emit('wa_status', {
        status: this.status,
        qrCode: this.qrCode,
        user: this.user
      });
    }
  }

  getStatus() {
    return {
      status: this.status,
      qrCode: this.qrCode,
      user: this.user,
      lastDisconnectReason: this.lastDisconnectReason,
      lastInitError: this.lastInitError,
      debugLogs: this.debugLogs
    };
  }

  async init(forceNew = false) {
    if (this.status === 'connected' && this.sock && !forceNew) {
      this.logDebug('init skipped: already connected');
      return this.getStatus();
    }

    if (this.status === 'qrcode' && this.qrCode && !forceNew) {
      this.logDebug('init skipped: qr already waiting');
      return this.getStatus();
    }

    try {
      this.logDebug(`Starting init(forceNew=${forceNew})...`);
      this.status = 'connecting';
      this.lastInitError = null;
      this.emitState();

      // Safely close existing socket before re-creating
      if (this.sock) {
        try {
          this.sock.ev.removeAllListeners();
          this.sock.end(undefined);
          this.logDebug('Closed previous socket instance');
        } catch (_) {}
        this.sock = null;
      }

      // If forceNew, wipe previous stale session files so Baileys generates a fresh QR code
      if (forceNew && fs.existsSync(AUTH_FOLDER)) {
        try {
          fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
          this.logDebug('Cleared auth folder for fresh session');
        } catch (e) {
          this.logDebug('Error clearing auth folder: ' + e.message);
        }
      }

      if (!fs.existsSync(AUTH_FOLDER)) {
        fs.mkdirSync(AUTH_FOLDER, { recursive: true });
      }

      this.logDebug('Loading multiFileAuthState...');
      const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
      this.logDebug('multiFileAuthState loaded successfully');
      
      // Resilient version fetch with latest WhatsApp Web protocol fallback
      let version = [2, 3000, 1043857760];
      try {
        const vInfo = await Promise.race([
          fetchLatestBaileysVersion(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
        ]).catch(() => null);
        if (vInfo?.version) {
          version = vInfo.version;
        }
      } catch (_) {}

      this.logDebug('Starting WhatsApp Baileys with version: ' + JSON.stringify(version));

      this.sock = makeWASocket({
        version,
        auth: state,
        logger: this.logger,
        browser: Browsers.macOS('Chrome'),
        syncFullHistory: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        retryRequestDelayMs: 2000
      });

      this.logDebug('Socket instance created, attaching event listeners...');
      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        try {
          const { connection, lastDisconnect, qr } = update;
          this.logDebug(`connection.update: conn=${connection}, hasQR=${!!qr}, errCode=${lastDisconnect?.error?.output?.statusCode}`);

          if (qr) {
            try {
              this.qrCode = await QRCode.toDataURL(qr);
              this.status = 'qrcode';
              this.reconnectAttempts = 0;
              this.logDebug('✅ QR Code rendered to dataURL successfully');
              this.emitState();
            } catch (err) {
              this.logDebug('Error rendering QR code: ' + err.message);
            }
          }

          if (connection === 'open') {
            this.status = 'connected';
            this.qrCode = null;
            this.reconnectAttempts = 0;
            const rawId = this.sock.user?.id || '';
            const cleanPhone = rawId.split(':')[0] || rawId.split('@')[0];
            this.user = {
              id: rawId,
              phone: cleanPhone,
              name: this.sock.user?.name || 'Clinic WhatsApp'
            };
            this.logDebug(`✅ WhatsApp Connected as: +${cleanPhone}`);
            this.emitState();
          }

          if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;

            this.logDebug(`WhatsApp connection closed (statusCode: ${statusCode}, reason: ${lastDisconnect?.error?.message || 'unknown'})`);
            this.lastDisconnectReason = {
              statusCode,
              message: lastDisconnect?.error?.message,
              time: new Date().toISOString()
            };

            if (isLoggedOut) {
              this.logDebug('⚠️ Session logged out or expired. Clearing invalid session credentials...');
              this.status = 'disconnected';
              this.qrCode = null;
              this.user = null;
              this.reconnectAttempts = 0;
              try {
                if (fs.existsSync(AUTH_FOLDER)) {
                  fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                }
              } catch (_) {}
              this.emitState();
            } else {
              // Auto reconnect on non-logout close reasons
              this.reconnectAttempts = (this.reconnectAttempts || 0) + 1;
              if (this.reconnectAttempts <= 5) {
                this.logDebug(`🔄 Re-establishing WhatsApp connection in 2s (attempt ${this.reconnectAttempts}/5, statusCode: ${statusCode})...`);
                this.status = 'connecting';
                this.emitState();
                setTimeout(() => {
                  this.init(false).catch((e) => this.logDebug('Reconnect retry failed: ' + e.message));
                }, 2000);
              } else {
                this.logDebug('⚠️ Max reconnect attempts reached. Resetting status to disconnected.');
                this.status = 'disconnected';
                this.reconnectAttempts = 0;
                this.emitState();
              }
            }
          }
        } catch (eventErr) {
          this.logDebug('Error in connection.update handler: ' + eventErr.message);
        }
      });

      return this.getStatus();
    } catch (err) {
      this.logDebug('WhatsApp init fatal error: ' + err.message + '\n' + err.stack);
      this.lastInitError = {
        message: err.message,
        stack: err.stack
      };
      this.status = 'disconnected';
      this.emitState();
      throw err;
    }
  }

  async logout() {
    try {
      if (this.sock) {
        await this.sock.logout().catch(() => {});
        this.sock.end(undefined);
        this.sock = null;
      }
    } catch (e) {
      console.warn('Error during socket logout:', e.message);
    }

    this.status = 'disconnected';
    this.user = null;
    this.qrCode = null;

    // Delete session files
    try {
      if (fs.existsSync(AUTH_FOLDER)) {
        fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn('Could not remove auth folder:', e.message);
    }

    this.emitState();
    return { success: true };
  }

  /**
   * Sanitizes phone number string to WhatsApp JID format
   * Supports 10-digit Indian numbers (defaulting to 91), or numbers with country code
   */
  formatToJid(rawNumber, defaultCountryCode = '91') {
    if (!rawNumber) return null;
    let digits = String(rawNumber).replace(/\D/g, '');

    // If starts with 00, remove it
    if (digits.startsWith('00')) {
      digits = digits.substring(2);
    }
    // If starts with single 0 (local trunk prefix), remove it
    if (digits.startsWith('0') && digits.length === 11) {
      digits = digits.substring(1);
    }

    // If 10 digits (common for India / US etc), prepend default country code
    if (digits.length === 10) {
      digits = defaultCountryCode + digits;
    }

    if (digits.length < 10) {
      return null;
    }

    return `${digits}@s.whatsapp.net`;
  }

  /**
   * Checks if number exists on WhatsApp and gets valid JID
   */
  async checkOnWhatsApp(jid) {
    if (!this.sock || this.status !== 'connected') {
      throw new Error('WhatsApp is not connected.');
    }
    const [result] = await this.sock.onWhatsApp(jid);
    return result?.exists ? result.jid : null;
  }

  /**
   * Simulates typing presence indicator for anti-ban
   */
  async simulateTyping(jid, durationMs = 2500) {
    if (!this.sock || this.status !== 'connected') return;
    try {
      await this.sock.sendPresenceUpdate('composing', jid);
      await new Promise((res) => setTimeout(res, durationMs));
      await this.sock.sendPresenceUpdate('paused', jid);
    } catch (e) {
      // Non-critical, continue
    }
  }

  /**
   * Send WhatsApp text message
   */
  async sendMessage(jid, text) {
    if (!this.sock || this.status !== 'connected') {
      throw new Error('WhatsApp is not connected.');
    }

    return await this.sock.sendMessage(jid, { text });
  }
}

export const waService = new WhatsAppService();

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
    this.logger = pino({ level: 'silent' });
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
      user: this.user
    };
  }

  async init() {
    if (this.status === 'connected' && this.sock) {
      return this.getStatus();
    }

    try {
      this.status = 'connecting';
      this.emitState();

      if (!fs.existsSync(AUTH_FOLDER)) {
        fs.mkdirSync(AUTH_FOLDER, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
      const { version } = await fetchLatestBaileysVersion();

      this.sock = makeWASocket({
        version,
        auth: state,
        logger: this.logger,
        printQRInTerminal: false,
        browser: Browsers.windows('Desktop'),
        syncFullHistory: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 120000,
        defaultQueryTimeoutMs: 120000,
        keepAliveIntervalMs: 25000,
        retryRequestDelayMs: 2000
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', async (update) => {
        try {
          const { connection, lastDisconnect, qr } = update;

          if (qr) {
            try {
              this.qrCode = await QRCode.toDataURL(qr);
              this.status = 'qrcode';
              this.emitState();
            } catch (err) {
              console.error('Error rendering QR code:', err);
            }
          }

          if (connection === 'open') {
            this.status = 'connected';
            this.qrCode = null;
            const rawId = this.sock.user?.id || '';
            const cleanPhone = rawId.split(':')[0] || rawId.split('@')[0];
            this.user = {
              id: rawId,
              phone: cleanPhone,
              name: this.sock.user?.name || 'Clinic WhatsApp'
            };
            console.log(`✅ WhatsApp Connected as: +${cleanPhone}`);
            this.emitState();
          }

          if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const isLoggedOut = statusCode === DisconnectReason.loggedOut;

            console.log(`WhatsApp connection closed (statusCode: ${statusCode}).`);
            this.status = 'disconnected';
            this.emitState();

            // Reconnect if credentials exist and user hasn't logged out
            if (!isLoggedOut && fs.existsSync(path.join(AUTH_FOLDER, 'creds.json'))) {
              console.log('🔄 Session credentials found. Re-establishing connection in 3s...');
              setTimeout(() => {
                this.init().catch((e) => console.warn('Reconnect retry failed:', e.message));
              }, 3000);
            }
          }
        } catch (eventErr) {
          console.error('Error in connection.update handler:', eventErr);
        }
      });

      return this.getStatus();
    } catch (err) {
      console.error('WhatsApp init error:', err);
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

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { waService } from './whatsapp.js';
import { campaignQueue } from './queue.js';
import { DEFAULT_DOCTOR_TEMPLATES } from './templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global crash guards to prevent WhatsApp WebSocket timeouts from killing the process
process.on('uncaughtException', (err) => {
  console.warn('🛡️ [Safety Guard] Caught uncaught exception:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.warn('🛡️ [Safety Guard] Caught unhandled rejection:', reason?.message || reason);
});

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Pass socket.io to WhatsApp service and queue
waService.setSocketIO(io);
campaignQueue.setSocketIO(io);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Set up Multer for memory upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Socket connection listener
io.on('connection', (socket) => {
  // Send current states immediately
  socket.emit('wa_status', waService.getStatus());
  socket.emit('campaign_update', campaignQueue.getStatus());
});

// --- API ROUTES ---

// 1. Get default doctor review templates
app.get('/api/templates', (req, res) => {
  res.json({ success: true, templates: DEFAULT_DOCTOR_TEMPLATES });
});

// 2. WhatsApp Status
app.get('/api/whatsapp/status', (req, res) => {
  res.json({ success: true, ...waService.getStatus() });
});

// 3. Initiate WhatsApp Connection (waits up to 10s for QR code so HTTP returns QR directly)
app.post('/api/whatsapp/connect', async (req, res) => {
  try {
    const force = req.body?.force === true;
    let currentStatus = waService.getStatus();
    if (currentStatus.status === 'connected' && !force) {
      return res.json({ success: true, ...currentStatus });
    }

    // Trigger WhatsApp connection with optional force wipe
    waService.init(force).catch((err) => console.error('Background init error:', err));

    // Wait up to 10 seconds for QR code or connected status
    let waited = 0;
    while (waited < 10000) {
      currentStatus = waService.getStatus();
      if (currentStatus.qrCode || currentStatus.status === 'connected') {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      waited += 400;
    }

    res.json({ success: true, ...currentStatus });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. WhatsApp Logout / Clear Auth
app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    await waService.logout();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Excel Upload & Normalization Endpoint
app.post('/api/upload-excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ success: false, error: 'The uploaded file contains no rows.' });
    }

    // Auto-detect columns for Phone and Name
    const parsedContacts = [];
    let detectedPhoneCol = null;
    let detectedNameCol = null;

    // Scan headers in first row
    const firstRowKeys = Object.keys(rawData[0]);
    for (const key of firstRowKeys) {
      const lower = key.toLowerCase().trim();
      if (!detectedPhoneCol && (lower.includes('phone') || lower.includes('mobile') || lower.includes('contact') || lower.includes('whatsapp') || lower.includes('number'))) {
        detectedPhoneCol = key;
      }
      if (!detectedNameCol && (lower.includes('name') || lower.includes('patient') || lower.includes('customer'))) {
        detectedNameCol = key;
      }
    }

    // Fallback if headers not named conventionally
    if (!detectedPhoneCol) {
      for (const key of firstRowKeys) {
        const val = String(rawData[0][key]).replace(/\D/g, '');
        if (val.length >= 10) {
          detectedPhoneCol = key;
          break;
        }
      }
    }

    if (!detectedPhoneCol) {
      return res.status(400).json({
        success: false,
        error: 'Could not detect a Phone or Mobile column in the Excel file. Please ensure there is a column named "Phone" or "Mobile".'
      });
    }

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rawPhone = String(row[detectedPhoneCol] || '').trim();
      const rawName = detectedNameCol ? String(row[detectedNameCol] || '').trim() : `Patient #${i + 1}`;

      // Clean phone
      const cleanDigits = rawPhone.replace(/\D/g, '');
      if (cleanDigits.length >= 10) {
        parsedContacts.push({
          id: i + 1,
          name: rawName || `Patient #${i + 1}`,
          phone: cleanDigits,
          originalPhone: rawPhone
        });
      }
    }

    if (parsedContacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid phone numbers with 10+ digits found in the Excel sheet.'
      });
    }

    res.json({
      success: true,
      totalFound: rawData.length,
      validContacts: parsedContacts.length,
      detectedColumns: {
        phone: detectedPhoneCol,
        name: detectedNameCol || '(Generated)'
      },
      contacts: parsedContacts
    });
  } catch (err) {
    console.error('Excel upload error:', err);
    res.status(500).json({ success: false, error: `Failed to parse Excel: ${err.message}` });
  }
});

// 6. Download Sample Excel template
app.get('/api/sample-excel', (req, res) => {
  try {
    const sampleData = [
      { 'Patient Name': 'Rahul Sharma', 'Phone': '9876543210', 'Visit Date': '2026-09-08' },
      { 'Patient Name': 'Priya Patel', 'Phone': '9123456780', 'Visit Date': '2026-09-08' },
      { 'Patient Name': 'Amit Verma', 'Phone': '9811223344', 'Visit Date': '2026-09-07' },
      { 'Patient Name': 'Sunita Gupta', 'Phone': '9988776655', 'Visit Date': '2026-09-07' },
      { 'Patient Name': 'Vikram Singh', 'Phone': '9871122334', 'Visit Date': '2026-09-06' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="Sample_Doctor_Patients.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Campaign Controls
app.post('/api/campaign/start', async (req, res) => {
  try {
    const { contacts, templates, clinicConfig, settings } = req.body;
    const status = await campaignQueue.start({ contacts, templates, clinicConfig, settings });
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/campaign/pause', (req, res) => {
  campaignQueue.pause();
  res.json({ success: true, message: 'Campaign paused' });
});

app.post('/api/campaign/resume', (req, res) => {
  campaignQueue.resume();
  res.json({ success: true, message: 'Campaign resumed' });
});

app.post('/api/campaign/stop', (req, res) => {
  campaignQueue.stop();
  res.json({ success: true, message: 'Campaign stopped' });
});

app.get('/api/campaign/status', (req, res) => {
  res.json({ success: true, ...campaignQueue.getStatus() });
});

// Serve static production build of client if available
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`🚀 DocReview Pro Backend Server listening on http://localhost:${PORT}`);
  // Attempt background auto-connect if auth session exists
  const authCreds = path.join(__dirname, 'session_auth', 'creds.json');
  if (fs.existsSync(authCreds)) {
    waService.init().catch(() => {});
  }
});

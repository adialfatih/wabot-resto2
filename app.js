const express = require('express');
const fs = require('fs');
const { Client, LocalAuth, MessageMedia  } = require('whatsapp-web.js');
//const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
//const ChartDataLabels = require('chartjs-plugin-datalabels');
const qrcode = require('qrcode');
const path = require('path');
const db = require('./db');
require('dotenv').config();
const puppeteer = require('puppeteer');
//const getRandomMotivation = require('./utils/getDailyMotivation');

const app = express();
const port = process.env.PORT || 3001;

// Express Setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let qrCodeImage = null;
let isAuthenticated = false;

const SESSION_DIR = './sessions/';
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR);

// WhatsApp Client
let client = new Client({
  authStrategy: new LocalAuth({ dataPath: SESSION_DIR }),
  puppeteer: {
    headless: true,
    executablePath: puppeteer.executablePath(), // Pakai browser bawaan Puppeteer
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', async (qr) => {
    console.log('📸 QR received');
    qrCodeImage = await qrcode.toDataURL(qr);
    isAuthenticated = false;
});

client.on('ready', () => {
  console.log('✅ WhatsApp Ready!');
  isAuthenticated = true;
  logToFile('WhatsApp Client is ready!');
});


client.on('disconnected', (reason) => {
    console.log('Client disconnected due to:', reason);
    client.initialize(); // Reconnect
});


client.on('authenticated', () => {
  console.log('🔐 Authenticated');
});

const userSession = {};
client.on('message', async msg => {
  //console.log('📩 Message Received:', msg.body);
  logToFile(`Received message: ${msg.body}`);
  // ⬇️ Tambahan: Simpan ke database
  require('./controllers/botController')(client, msg);

});

client.initialize();

// Routes
app.get('/', async (req, res) => {
  res.render('index', { qr: qrCodeImage, isAuthenticated });
  console.log('QR Image Data:', qrCodeImage);
});

app.post('/restart-session', (req, res) => {
  fs.rmdirSync(SESSION_DIR + 'Default', { recursive: true });
  qrCodeImage = null;
  isAuthenticated = false;
  client.destroy().then(() => {
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: SESSION_DIR }),
      puppeteer: { headless: true }
    });
    client.initialize();
    res.redirect('/');
  });
});

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.send('Error');
    res.json(results);
  });
});

app.get('/logs', (req, res) => {
  fs.readFile('./logs/system.log', 'utf8', (err, data) => {
    if (err) return res.send('Error');
    res.type('text/plain').send(data);
  });
});

// Helper log
function logToFile(msg) {
  fs.appendFileSync('./logs/system.log', `[${new Date().toISOString()}] ${msg}\n`);
}

app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));

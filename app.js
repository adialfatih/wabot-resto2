const express = require('express');
const fs = require('fs');
const { Client, LocalAuth, MessageMedia  } = require('whatsapp-web.js');
//const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
//const ChartDataLabels = require('chartjs-plugin-datalabels');
const qrcode = require('qrcode');
const path = require('path');

const cors = require('cors');
require('dotenv').config();
const puppeteer = require('puppeteer');
const pool = require('./db');
//const getRandomMotivation = require('./utils/getDailyMotivation');

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = [
  'http://localhost:3000',
  'https://dashboard.wabotresto.com',
  'https://admin.partner-resto.id'
];
const botController = require('./controllers/botController');
const closeOrderController = require('./controllers/closeOrderController');
// Express Setup
app.set('view engine', 'ejs');
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS Not Allowed'), false);
    }
  }
}));
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
// client.on('message', async msg => {
//   //console.log('📩 Message Received:', msg.body);
//   logToFile(`Received message: ${msg.body}`);
//   // ⬇️ Tambahan: Simpan ke database
//   require('./controllers/botController')(client, msg);

// });
client.on('message', async msg => {
  console.log('📩 Message Received:', msg.body);
  logToFile(`Received message: ${msg.body}`);

  // Abaikan pesan dari status broadcast
  if (msg.from === 'status@broadcast') {
    return;
  }

  let connection;
  try {
    connection = await pool.getConnection(); // Dapatkan koneksi dari pool

    // 1. Cek jam buka resto
    const now = new Date();
    const hariSekarang = now.toLocaleDateString('id-ID', { weekday: 'long' }); // Contoh: "Senin"
    const jamSekarang = now.toTimeString().slice(0, 5); // Format HH:MM

    // Ubah nama hari ke format yang sesuai dengan tabel Anda (contoh: "Senin" menjadi "Senin")
    // Pastikan konsisten antara database dan format toLocaleDateString
    const hariUntukQuery = hariSekarang.charAt(0).toUpperCase() + hariSekarang.slice(1);

    const [jamBukaRows] = await connection.execute(
      `SELECT jam_buka, jam_tutup FROM jam_buka_resto WHERE hari = ?`,
      [hariUntukQuery]
    );

    let isRestoOpen = false;
    if (jamBukaRows.length > 0) {
      const { jam_buka, jam_tutup } = jamBukaRows[0];
      // Bandingkan jam sekarang dengan jam buka dan jam tutup
      if (jamSekarang >= jam_buka && jamSekarang <= jam_tutup) {
        isRestoOpen = true;
      }
    } else {
      // Jika data hari tidak ditemukan di DB, asumsikan tutup atau ada kesalahan konfigurasi
      console.warn(`⚠️ Jam buka untuk hari ${hariUntukQuery} tidak ditemukan di database.`);
    }

    // 2. Arahkan pesan berdasarkan jam buka
    if (isRestoOpen) {
      // Jika resto buka, panggil botController
      await botController(client, msg);
      console.log('📩 Message forwarded to botController');
    } else {
      // Jika resto tutup, panggil closeOrderController
      await closeOrderController(client, msg);
      console.log('📩 Message forwarded to closeOrderController');
    }

  } catch (err) {
    console.error('❌ Error handling message in app.js:', err);
    // Jika ada error di sini (misal DB tidak bisa diakses), tetap berikan respons ke user
    // atau arahkan ke botController sebagai fallback
    try {
        await msg.reply("Terjadi kesalahan pada sistem pengecekan jam buka. Mohon coba beberapa saat lagi.");
    } catch (sendErr) {
        console.error("Failed to send error message:", sendErr);
    }
  } finally {
    if (connection) {
      connection.release(); // Pastikan koneksi dikembalikan ke pool
    }
  }
});
//add on message

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
// app.post('/restart-session', async (req, res) => {
//   try {
//     const sessionPath = path.join(SESSION_DIR, 'resto-bot');

//     // Hapus session jika ada
//     if (fs.existsSync(sessionPath)) {
//       fs.rmSync(sessionPath, { recursive: true, force: true });
//       console.log('🗑️ Session folder dihapus:', sessionPath);
//     }

//     // Destroy client jika aktif
//     if (client) {
//       await client.destroy();
//       console.log('❎ Client WhatsApp dihentikan.');
//     }

//     // Reset QR dan Auth flag
//     qrCodeImage = null;
//     isAuthenticated = false;

//     // Delay kecil agar proses destroy/clear selesai
//     setTimeout(() => {
//       // Buat ulang client
//       client = new Client({
//         authStrategy: new LocalAuth({
//           clientId: "resto-bot",
//           dataPath: SESSION_DIR,
//         }),
//         puppeteer: {
//           headless: true, // ubah jadi false untuk debug QR
//           args: ['--no-sandbox', '--disable-setuid-sandbox'],
//           executablePath: puppeteer.executablePath()
//         }
//       });

//       // Semua event listener WAJIB dipasang ulang
//       client.on('qr', async (qr) => {
//         console.log('📸 QR received');
//         qrCodeImage = await qrcode.toDataURL(qr);
//         isAuthenticated = false;
//       });

//       client.on('ready', () => {
//         console.log('✅ WhatsApp Ready!');
//         isAuthenticated = true;
//         logToFile('WhatsApp Client is ready!');
//       });

//       client.on('authenticated', () => {
//         console.log('🔐 Authenticated');
//       });

//       client.on('disconnected', (reason) => {
//         console.log('Client disconnected due to:', reason);
//         client.initialize();
//       });

//       client.on('message', async msg => {
//         logToFile(`Received message: ${msg.body}`);
//         require('./controllers/botController')(client, msg);
//       });

//       client.initialize();
//       console.log('🔄 Client di-reinitialize.');

//       res.redirect('/');
//     }, 1000); // delay 1 detik
//   } catch (err) {
//     console.error('❌ Gagal login ulang:', err);
//     res.status(500).send('Gagal login ulang.');
//   }
// });
app.post('/api/kirim-notifikasi', async (req, res) => {
  const { nomor_wa, kode_pesanan, status_baru, url_gambar } = req.body;

  if (!nomor_wa || !kode_pesanan || !status_baru) {
    return res.status(400).json({ error: "Harus ada nomor_wa, kode_pesanan, dan status_baru" });
  }

  try {
    const teks = {
      'dibayar': `✅ Pesanan *#${kode_pesanan}* telah *dibayar*. Kami segera memprosesnya!`,
      'sedang dibuat': `👨‍🍳 Pesanan *#${kode_pesanan}* sedang *dibuat* di dapur.`,
      'selesai': `🛎️ Pesanan *#${kode_pesanan}* sudah *siap disajikan* atau *diambil*.`,
      'dibatalkan': `❌ Pesanan *#${kode_pesanan}* telah *dibatalkan*.`
    }[status_baru.toLowerCase()] || 
    `📦 Status pesanan *#${kode_pesanan}* telah berubah menjadi *${status_baru}*.`

    if (url_gambar) {
      let media;

      if (url_gambar.startsWith('http')) {
        // Gambar dari URL eksternal (dashboard online)
        media = await MessageMedia.fromUrl(url_gambar);
      } else {
        // Gambar lokal di folder public/invoice/
        const filePath = path.join(__dirname, 'public', 'invoice', url_gambar);
        if (!fs.existsSync(filePath)) {
          console.warn('⚠️ Gambar tidak ditemukan:', filePath);
          await client.sendMessage(nomor_wa, teks); // fallback ke teks
          return res.json({ warning: true, message: 'Gambar tidak ditemukan, hanya teks dikirim.' });
        }
        media = MessageMedia.fromFilePath(filePath);
      }

      await client.sendMessage(nomor_wa, media, { caption: teks });
    } else {
      await client.sendMessage(nomor_wa, teks);
    }

    return res.json({ success: true, message: 'Notifikasi dikirim ke WhatsApp user.' });
  } catch (err) {
    console.error('❌ Gagal kirim:', err);
    return res.status(500).json({ error: "Gagal kirim ke WhatsApp." });
  }
});

app.post('/api/kirim-pesan', async (req, res) => {
  const { nomor_wa, isi_pesanan, urlmedia } = req.body;

  if (!nomor_wa || !isi_pesanan) {
    return res.status(400).json({ error: "Harus ada nomor_wa dan isi_pesanan" });
  }

  try {
    if (urlmedia) {
      let media;

      if (urlmedia.startsWith('http')) {
        // Gambar dari URL eksternal (dashboard online)
        media = await MessageMedia.fromUrl(urlmedia);
      } else {
        // Gambar lokal di folder public/invoice/
        const filePath = path.join(__dirname, 'public', 'folders', urlmedia);
        if (!fs.existsSync(filePath)) {
          console.warn('⚠️ Media tidak ditemukan:', filePath);
          await client.sendMessage(nomor_wa, isi_pesanan); // fallback ke teks
          return res.json({ warning: true, message: 'Gambar tidak ditemukan, hanya teks dikirim.' });
        }
        media = MessageMedia.fromFilePath(filePath);
      }

      await client.sendMessage(nomor_wa, media, { caption: isi_pesanan });
    } else {
      await client.sendMessage(nomor_wa, isi_pesanan);
    }

    return res.json({ success: true, message: 'Pesan dikirim ke WhatsApp user.' });
  } catch (err) {
    console.error('❌ Gagal kirim:', err);
    return res.status(500).json({ error: "Gagal kirim ke WhatsApp." });
  }
});


// app.get('/users', (req, res) => {
//   db.query('SELECT * FROM users', (err, results) => {
//     if (err) return res.send('Error');
//     res.json(results);
//   });
// });
app.get('/users', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection(); // Dapatkan koneksi dari pool
    const [results] = await connection.execute('SELECT * FROM user'); // Gunakan 'user' bukan 'users' jika nama tabel Anda memang 'user'
    res.json(results);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.status(500).send('Error fetching users from database.');
  } finally {
    if (connection) {
      connection.release(); // Pastikan koneksi dikembalikan ke pool
    }
  }
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

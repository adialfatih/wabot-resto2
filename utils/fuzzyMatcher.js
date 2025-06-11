const Fuse = require('fuse.js');
const pool = require('../db'); // Mengimpor pool dari db.js

async function cariMenuDenganNamaBebas(teksUser) {
  let connection; // Deklarasikan connection di scope yang lebih luas
  try {
    connection = await pool.getConnection(); // Dapatkan koneksi dari pool

    // Mengganti db.query dengan connection.execute dan menggunakan async/await
    const [rows] = await connection.execute(`SELECT kode_menu, nama_menu, alias, harga, tersedia FROM table_menu`);

    const fuse = new Fuse(rows, {
      keys: ['nama_menu', 'alias'],
      threshold: 0.3,              // 🔁 Disesuaikan lebih ketat dari 0.5 (misal: 0.3). 'cik' tidak akan cocok dengan 'chicken teriyaki'
      distance: 50,               // 🔁 Disesuaikan lebih kecil dari 100 untuk kecocokan yang lebih dekat
      minMatchCharLength: 3,     // 🔁 Minimal 3 karakter cocok
      ignoreLocation: true         // Tidak peduli urutan karakter
    });

    // Pisah kata per koma (contoh: "nasgor babat, es teh")
    const itemDicari = teksUser.split(',').map(t => t.trim()).filter(Boolean);
    const hasil = [];

    for (const item of itemDicari) {
      const cocok = fuse.search(item);
      if (cocok.length > 0) {
        hasil.push({
          kode_menu: cocok[0].item.kode_menu,
          nama_menu: cocok[0].item.nama_menu,
          harga: cocok[0].item.harga,
          tersedia: cocok[0].item.tersedia,
          input: item,
        });
      }
    }

    return hasil; // Langsung return hasil karena sudah async
  } catch (error) {
    console.error('❌ Error in cariMenuDenganNamaBebas:', error);
    throw error; // Lempar error agar bisa ditangkap di botController
  } finally {
    if (connection) {
      connection.release(); // Pastikan koneksi selalu dikembalikan ke pool
    }
  }
}

module.exports = { cariMenuDenganNamaBebas };

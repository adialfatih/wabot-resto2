const Fuse = require('fuse.js');
const db = require('../db');

async function cariMenuDenganNamaBebas(teksUser) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT kode_menu, nama_menu, alias, harga FROM table_menu`, (err, rows) => {
      if (err) return reject(err);

      const fuse = new Fuse(rows, {
        keys: ['nama_menu', 'alias'],
        threshold: 0.5,              // 🔁 lebih longgar dari 0.4 → biar typo masih lolos
        distance: 100,               // 🔁 biar cocokkan kata lebih jauh
        minMatchCharLength: 2,
        ignoreLocation: true         // 🔁 tidak peduli urutan karakter
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
            input: item,
          });
        }
      }

      resolve(hasil);
    });
  });
}

module.exports = { cariMenuDenganNamaBebas };

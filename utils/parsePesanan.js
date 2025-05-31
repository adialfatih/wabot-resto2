const { cariMenuDenganNamaBebas } = require('./fuzzyMatcher');

/**
 * Fungsi ini menerima input teks dari user seperti:
 * "pesan oxtail soup x2, es teh, #5x2 #8"
 * lalu mengembalikan object { kodeQtyMap, orderedKode }, misalnya:
 * {
 *   kodeQtyMap: { '12': 2, '3': 1, '5': 2, '8': 1 },
 *   orderedKode: ['12', '3', '5', '8']
 * }
 */
async function parsePesananDariTeks(isi) {
  let kodeQtyMap = {};
  let orderedKode = [];

  // Ambil semua pola #IDxQty dari input
  const regexKode = /#(\d+)(?:x(\d+))?/gi;
  let isiTanpaKode = isi;
  let match;

  while ((match = regexKode.exec(isi)) !== null) {
    const kode = match[1];
    const qty = parseInt(match[2]) || 1;
    if (!kodeQtyMap[kode]) {
      orderedKode.push(kode);
      kodeQtyMap[kode] = qty;
    } else {
      kodeQtyMap[kode] += qty;
    }
    // Hapus bagian #kode dari teks agar fuzzy tidak bingung
    isiTanpaKode = isiTanpaKode.replace(match[0], '');
  }

  // Hapus kata "pesan" atau "psn" dari awal
  const sisaTeks = isiTanpaKode.replace(/^(pesan|psn)/i, '').trim();

  if (sisaTeks) {
    const inputTeks = sisaTeks
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    for (const item of inputTeks) {
      const matchQty = item.match(/^(.+?)\s*x(\d+)$/i);
      const nama = matchQty ? matchQty[1].trim() : item;
      const qty = matchQty ? parseInt(matchQty[2]) : 1;

      const hasil = await cariMenuDenganNamaBebas(nama);
      if (hasil.length > 0) {
        const cocok = hasil[0];
        const kode = cocok.kode_menu;
        if (!kodeQtyMap[kode]) {
          orderedKode.push(kode);
          kodeQtyMap[kode] = qty;
        } else {
          kodeQtyMap[kode] += qty;
        }
      }
    }
  }

  return { kodeQtyMap, orderedKode };
}

module.exports = { parsePesananDariTeks };

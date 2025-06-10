const pool = require('../db'); // Mengimpor pool dari db.js
const { MessageMedia } = require('whatsapp-web.js');
const { getSession, setSession, clearSession } = require('./sessionManager');
const { cariMenuDenganNamaBebas } = require('../utils/fuzzyMatcher'); // Pastikan ini ada

module.exports = async function(client, message) {
  const isi = message.body.trim();
  const nomor = message.from;
  console.log('Menerima Pesan dari : ' + nomor);

  let connection; // Deklarasikan connection di scope yang lebih luas

  try {
    connection = await pool.getConnection(); // Dapatkan koneksi dari pool

    if (nomor != 'status@broadcast') {
      await connection.execute(`INSERT INTO pesan_masuk (nomor_wa, isi_pesan, tanggal_jam) VALUES (?, ?, NOW())`, [nomor, isi]);
    }

    // Cek apakah user terdaftar
    const [userRows] = await connection.execute(`SELECT * FROM user WHERE nomor_wa = ?`, [nomor]);
    const userTerdaftar = userRows.length > 0;
    const namaUser = userTerdaftar ? userRows[0].nama : null;
    const session = getSession(nomor);

    const sapaan = ["hi", "hai", "halo", "hello", "hallo"];
    if (sapaan.includes(isi.toLowerCase())) {
      const teksBalik = isi.charAt(0).toUpperCase() + isi.slice(1).toLowerCase();
      if (userTerdaftar) {
        await client.sendMessage(nomor, `${teksBalik} juga ${namaUser}, 👋 Aku adalah robot pintar dari *Wabot-Resto*, yang akan selalu setia menjadi asisten virtual untuk membantu kakak memesan makanan favorit. Ada yang bisa di bantu?\n\nKetik *MENU* untuk melihat daftar menu, ketik *HELP* untuk bantuan atau ketik *INFO* untuk informasi.`);
        return;
      }
      if (!userTerdaftar) {
        await client.sendMessage(nomor, `${teksBalik} juga!, 👋\n\nSelamat datang di *Wabot-Resto*, aku adalah asisten virtual yang siap membantu kakak pesan makanan favorit 🍜\n\nSebelum mulai, boleh kenalan dulu? 😊 \nSilakan ketik *DAFTAR* untuk mulai mendaftar ya.\nKalau kakak butuh bantuan, ketik saja *HELP*. Aku siap bantu!`);
        return;
      }
    }
    if (isi.toLowerCase() === "help" && !userTerdaftar) {
      await client.sendMessage(nomor, `Sepertinya kakak butuh bantuan, tapi aku belum bisa membantu kakak. Yuk kenalan dulu. Ketik *DAFTAR* untuk mulai mendaftar ya. 😊`);
      return;
    }
    // Handle jika user sudah terdaftar tapi ketik "daftar"
    if (userTerdaftar && isi.toLowerCase() === "daftar") {
      await client.sendMessage(nomor, `Kakak sudah terdaftar sebagai ${namaUser}.😊 \nKetik *MENU* untuk melihat menu ya kak.`);
      return;
    }
    if (!userTerdaftar) {
      if (isi.toLowerCase() === "daftar") {
        await client.sendMessage(nomor, "Silakan ketik nama kakak agar aku selalu mengingat kakak.😊");
        setSession(nomor, { step: "menunggu_nama" });
        return;
      }

      if (session?.step === "menunggu_nama") {
        var namaisi = isi.toUpperCase();
        await connection.execute(`INSERT INTO user (nomor_wa, nama, tanggal_daftar) VALUES (?, ?, NOW())`, [nomor, namaisi]);
        await client.sendMessage(nomor, `Hai 👋 Kak ${namaisi}\n✅ Pendaftaran berhasil. Ketik *MENU* untuk melihat menu.`);
        clearSession(nomor);
        return;
      }

      await client.sendMessage(nomor, "Selamat datang di *Wabot-Resto*, aku adalah asisten virtual yang siap membantu kakak pesan makanan favorit 🍜\n\nSebelum mulai, boleh kenalan dulu? 😊 \nSilakan ketik *DAFTAR* untuk mulai mendaftar ya.\nKalau kakak bantuan, ketik saja *HELP*. Aku siap bantu!");
      return;
    }

    // Help
    if (isi.toLowerCase() === "help" || isi.toLowerCase() === "bantuan" || isi.toLowerCase() === "bantu" || isi.toLowerCase() === "?") {
      await client.sendMessage(nomor, `📖 *Panduan:*
- *DAFTAR* untuk mendaftar
- *MENU* untuk melihat menu
- *PESAN* untuk memesan
- *STATUS* untuk melihat status pesanan`);
      return;
    }
    const modelPanduanPesan = [
      "cara pesan", "bagaimana cara memesan", "gimana cara pesan",
      "mau pesan gimana", "pesan gimana", "pesan bagaimana"
    ];
    if (modelPanduanPesan.includes(isi.toLowerCase())) {
      await client.sendMessage(nomor, `📖 *Cara Memesan di Wabot-Resto:*

1. Ketik *MENU* untuk melihat daftar makanan.
2. Ketik *PESAN* untuk mulai memesan.
3. Masukkan pesanan satu per satu, contoh:
  - *#1 x 2* (Kode menu #1 sebanyak 2 porsi)
  - *nasgor babat x 1* (Nama menu + jumlah)
4. Ketik *List* untuk melihat daftar pesanan.
5. Ketik *SELESAI* jika sudah selesai memilih menu.
6. Konfirmasi pesanan.
7. Pilih metode ambil: *Dine In*, *Take Away*, atau *Delivery*.
8. Masukkan alamat (jika Delivery) atau nomor meja (jika Dine In).
9. Pilih pembayaran: *Cash* atau *QRIS*.
10. Selesai! 🎉

Jika masih bingung, ketik *HELP* ya kak 😊`);
      return;
    }

    // Menu
    const modelMenu = ["menu", "meu", "men", "menuw", "menui", "meniu", "meni"];
    if (modelMenu.includes(isi.toLowerCase())) {
      await client.sendMessage(nomor, "Sebentar ya kak, 😊\nDaftar menu akan saya kirim sebentar lagi.");
      const [menuResults] = await connection.execute(`SELECT url_gambar FROM daftar_menu`);
      if (menuResults.length === 0) {
        return client.sendMessage(nomor, "Menu belum tersedia.");
      }

      for (const row of menuResults) {
        try {
          const media = await MessageMedia.fromUrl(row.url_gambar);
          await client.sendMessage(nomor, media);
        } catch (error) {
          console.error("Gagal kirim gambar:", error);
          await client.sendMessage(nomor, "Gagal menampilkan salah satu gambar menu.");
        }
      }
      return;
    }

    // Pesan
    const modelPesan = ["pesan", "psn", "pesen", "psan", "peszn", "saya ingin pesan", "saya pesan", "saya mau pesan"];
    if (modelPesan.includes(isi.toLowerCase())) {
      const [existingOrders] = await connection.execute(`SELECT kode_pesanan, nomor_wa, status FROM pesanan WHERE nomor_wa = ? AND status IN ('Menunggu Pembayaran','Dibayar','Sedang dibuat')`, [nomor]);
      if (existingOrders.length > 0) {
        const pesanExisting = `⚠️ Anda memiliki pesanan yang belum selesai.\n\n` +
          `Ketik *Status* untuk melihat status pesanan terakhir.\n` +
          `Ketik *Batal* untuk membatalkan pesanan terakhir.\n`;
        await client.sendMessage(nomor, pesanExisting);
      } else {
        clearSession(nomor);
        setSession(nomor, {
          step: "input_pesanan",
          pesanan: [] // array kosong untuk tampung item satu per satu
        });

        await client.sendMessage(nomor, `📝 Silahkan masukan pesanan Anda satu per satu.\n\nGunakan format :\n*#kode x jumlah* atau \n*Nama Menu x jumlah*.\n\nKetik *Selesai* jika sudah selesai memesan.`);
      }
      return;
    }
    //tangani pesanan
    if (session?.step === "input_pesanan") {
      const modelBatal = ["batal", "gak jadi", "rak sido", "btl", "btal", "batal pesan", "batal pesanan"];
      if (modelBatal.includes(isi.toLowerCase())) {
        clearSession(nomor);
      }
      const modelList = ["list", "lihat", "cek pesanan", "total", "totalnya", "lihat pesanan"];
      if (modelList.includes(isi.toLowerCase())) {
        if (session.pesanan.length === 0) {
          return client.sendMessage(nomor, "📝 Kamu belum menambahkan pesanan apapun.");
        }

        let total = 0;
        const list = session.pesanan.map((item, i) => {
          const subtotal = item.qty * item.harga;
          total += subtotal;
          return `${i + 1}. ${item.nama_menu} x${item.qty} = Rp. ${subtotal.toLocaleString('id-ID')}`;
        }).join('\n');

        return client.sendMessage(nomor,
          `🧾 *Pesanan Sementara Kamu:*\n${list}\n\n*Total Saat Ini:* Rp. ${total.toLocaleString('id-ID')}\n\nKetik *SELESAI* jika kamu sudah selesai.`);
      }
      const modelSelesai = ["selesai", "selsai", "sudah", "udah", "dah", "itu aja", "sudah itu aja"];
      if (modelSelesai.includes(isi.toLowerCase())) {
        if (session.pesanan.length === 0) {
          return client.sendMessage(nomor, "⚠️ Anda belum memasukkan pesanan.");
        }

        // Buat ringkasan & total
        let total = 0;
        const list = session.pesanan.map((item, i) => {
          const subtotal = item.qty * item.harga;
          total += subtotal;
          return `${i + 1}. ${item.nama_menu} x${item.qty} Rp. ${subtotal.toLocaleString('id-ID')}`;
        }).join('\n');

        await client.sendMessage(nomor,
          `🛒 *Anda akan memesan:*\n${list}\n\n*Total Pesanan:* Rp. ${total.toLocaleString('id-ID')}\n\nApakah pesanan sudah sesuai?`);

        // Simpan ke sesi baru
        setSession(nomor, {
          step: "konfirmasi_pesanan",
          pesanan: session.pesanan
        });

        return;
      }
      if (isi.toLowerCase().startsWith("coret ") || isi.toLowerCase().startsWith("hapus ")) {
        const namaDicoret = isi.slice(6).trim().toLowerCase();
        const index = session.pesanan.findIndex(item => item.nama_menu.toLowerCase().includes(namaDicoret));

        if (index !== -1) {
          const itemTerhapus = session.pesanan.splice(index, 1)[0];
          setSession(nomor, session);
          return client.sendMessage(nomor, `❌ *${itemTerhapus.nama_menu}* telah dibatalkan dari pesanan.`);
        } else {
          return client.sendMessage(nomor, `⚠️ Tidak ditemukan menu *${namaDicoret}* dalam daftar pesanan.`);
        }
      }
      // Deteksi input: #kode x qty atau nama x qty
      let matchKode = isi.match(/^#(\d+)(?:\s*x\s*(\d+))?$/i);
      if (matchKode) {
        const kode = matchKode[1];
        const qty = parseInt(matchKode[2]) || 1; // default qty = 1 jika tidak ditulis

        const [menuRows] = await connection.execute(`SELECT * FROM table_menu WHERE kode_menu = ?`, [kode]);
        if (menuRows.length === 0) {
          return client.sendMessage(nomor, `❌ Menu dengan kode #${kode} tidak ditemukan.`);
        }

        const item = menuRows[0];
        session.pesanan.push({
          kode_menu: item.kode_menu,
          nama_menu: item.nama_menu,
          harga: item.harga,
          qty
        });
        setSession(nomor, session);
        await client.sendMessage(nomor, `✅ *${item.nama_menu} x${qty}* telah ditambahkan.`);
        return;
      }

      // Deteksi nama menu + qty (fuzzy)
      const matchNamaQty = isi.match(/^(.+?)\s*x\s*(\d+)$/i);
      const nama = matchNamaQty ? matchNamaQty[1].trim() : isi.trim();
      const qty = matchNamaQty ? parseInt(matchNamaQty[2]) : 1;

      // Asumsi fuzzyMatcher.js ada dan sudah menggunakan Promise
      const hasil = await cariMenuDenganNamaBebas(nama);

      if (hasil.length === 0) {
        return client.sendMessage(nomor, `❌ Menu *${nama}* tidak ditemukan.`);
      }

      const item = hasil[0];
      session.pesanan.push({
        kode_menu: item.kode_menu,
        nama_menu: item.nama_menu,
        harga: item.harga,
        qty
      });
      setSession(nomor, session);
      await client.sendMessage(nomor, `✅ *${item.nama_menu} x${qty}* telah ditambahkan.`);
      return;
    }
    //block kode menangani pesanan

    // Konfirmasi pesanan
    if (session?.step === "konfirmasi_pesanan") {
      const modelKonfirmasi = ["sudah", "sesuai", "sudah sesuai", "y", "dah", "ya", "iya", "yes", "yoi"];
      if (modelKonfirmasi.includes(isi.toLowerCase())) {
        setSession(nomor, { step: "pilih_pengambilan" });
        client.sendMessage(nomor, "Silakan pilih: *Dine In* / *Take Away* / *Delivery*");
      } else {
        clearSession(nomor);
        client.sendMessage(nomor, 'Anda tidak mengkonfirmasi pesanan.Silahkan pesan kembali dengan mengetik *Pesan #kode*');
      }
      return;
    }

    // Pilih metode pengambilan
    if (session?.step === "pilih_pengambilan") {
      const pilihan = isi.toLowerCase();
      if (["delivery", "dine in", "take away"].includes(pilihan)) {
        setSession(nomor, { metode: pilihan });

        if (pilihan === "delivery") {
          setSession(nomor, { step: "alamat" });
          client.sendMessage(nomor, "Silakan masukkan alamat Anda.");
        } else if (pilihan === "dine in") {
          setSession(nomor, { step: "meja" });
          client.sendMessage(nomor, "Silakan masukan nomor meja.");
        } else {
          setSession(nomor, { step: "pembayaran" });
          client.sendMessage(nomor, "Silakan pilih metode pembayaran: *Cash* / *QRIS*");
        }
      } else {
        if (pilihan === "cancel" || pilihan === "batal") {
          clearSession(nomor);
          client.sendMessage(nomor, 'Silahkan pesan kembali dengan mengetik *Pesan #kode*');
        } else {
          client.sendMessage(nomor, "Pilihan tidak dikenali. Ketik: *Dine In*, *Take Away*, atau *Delivery*");
        }
      }
      return;
    }

    if (session?.step === "alamat") {
      setSession(nomor, { alamat: isi, step: "pembayaran" });
      client.sendMessage(nomor, "Silakan pilih metode pembayaran: *Cash* / *QRIS*");
      return;
    }

    if (session?.step === "meja") {
      setSession(nomor, { no_meja: isi, step: "pembayaran" });
      client.sendMessage(nomor, "Silakan pilih metode pembayaran: *Cash* / *QRIS*");
      return;
    }

    if (session?.step === "pembayaran") {
      const metode = isi.toLowerCase();
      if (!["cash", "qris"].includes(metode)) {
        client.sendMessage(nomor, "Silakan pilih metode pembayaran: *Cash* / *QRIS*");
        return;
      }

      // Generate kode pesanan
      const [countResult] = await connection.execute(`SELECT COUNT(*) AS total FROM pesanan`);
      const noUrut = countResult[0].total + 1;
      const kodePesanan = 'OR' + noUrut.toString().padStart(3, '0');

      const kodeList = session.pesanan.map(p => p.kode_menu);

      // Gunakan placeholder (?) untuk menghindari SQL Injection
      const [hargaRows] = await connection.execute(`SELECT kode_menu, harga FROM table_menu WHERE kode_menu IN (${kodeList.map(() => '?').join(',')})`, kodeList);

      if (hargaRows.length === 0) {
        return client.sendMessage(nomor, "⚠️ Terjadi kesalahan saat memverifikasi pesanan. Silakan coba lagi.");
      }
      const hargaMap = {};
      for (const row of hargaRows) {
        hargaMap[row.kode_menu] = row.harga;
      }

      let daftarMenuQty = [];
      let totalHarga = 0;

      for (const item of session.pesanan) {
        const hargaValid = hargaMap[item.kode_menu];
        if (!hargaValid) continue;

        daftarMenuQty.push(`${item.kode_menu}x${item.qty}`);
        totalHarga += hargaValid * item.qty;
      }

      // Simpan ke DB
      await connection.execute(`INSERT INTO pesanan
            (kode_pesanan, nomor_wa, daftar_kode_menu, total_harga, metode_pengambilan, alamat, no_meja, metode_pembayaran, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu Pembayaran')`, [
        kodePesanan, nomor, daftarMenuQty.join(','), totalHarga, session.metode, session.alamat || null, session.no_meja || null, metode
      ]);

      if (metode === "qris") {
        const kodeUnik = Math.floor(100 + Math.random() * 900);
        const totalBayar = totalHarga + kodeUnik;

        // Simpan ke tabel pembayaran_kodeunik
        await connection.execute(`INSERT INTO pembayaran_kodeunik
                (kode_pesanan, total_asli, kode_unik, total_tagihan, status)
                VALUES (?, ?, ?, ?, 'Menunggu Pembayaran')`,
          [kodePesanan, totalHarga, kodeUnik, totalBayar]);

        client.sendMessage(nomor, `✅ Pesanan berhasil dibuat :\nKode pesanan : *${kodePesanan}*\nStatus : *Menunggu Pembayaran*\nTagihan : Rp ${totalHarga.toLocaleString()}\nKode unik : *${kodeUnik}*\n\nSilahkan *SCAN* QRIS dibawah ini dan Bayar sesuai dengan total tagihan : *Rp ${totalBayar.toLocaleString()}*\n(Jangan lupa kode uniknya ya kak *${kodeUnik}*).`);

        const [qrisRows] = await connection.execute(`SELECT url_gambar FROM gambar_qris LIMIT 1`);
        if (qrisRows.length > 0) {
          const media = await MessageMedia.fromUrl(qrisRows[0].url_gambar);
          client.sendMessage(nomor, media);
        }
      }
      if (metode === "cash") {
        client.sendMessage(nomor, `✅ Pesanan berhasil dibuat :\nKode pesanan : *${kodePesanan}*\nStatus : *Menunggu Pembayaran*\nTotal: Rp ${totalHarga.toLocaleString()}\n\nSilahkan membayar ke kasir sesuai total tagihan ya kak 😊.`);
      }

      clearSession(nomor);
      return;
    }

    //tangani status pesanan
    if (isi.toLowerCase() === "status") {
      const [statusRows] = await connection.execute(`SELECT kode_pesanan, total_harga, metode_pengambilan, metode_pembayaran, status FROM pesanan WHERE nomor_wa = ? ORDER BY id DESC LIMIT 1`, [nomor]);
      if (statusRows.length === 0) {
        return client.sendMessage(nomor, "⚠️ Tidak ditemukan pesanan atas nama Anda.");
      }
      const pesanan = statusRows[0];
      const { kode_pesanan, total_harga, metode_pengambilan, metode_pembayaran, status } = pesanan;

      if (metode_pembayaran === "Cash") {
        const msgCash =
          `📦 *Status Pesanan Anda*\n` +
          `Kode Pesanan : *${kode_pesanan}*\n` +
          `Jenis : *${metode_pengambilan}*\n` +
          `Metode Bayar : *Cash*\n` +
          `Total : *Rp ${total_harga.toLocaleString()}*\n` +
          `Status: *${status.toUpperCase()}*`;
        return client.sendMessage(nomor, msgCash);
      }

      if (metode_pembayaran === "QRIS") {
        const [qrisPaymentRows] = await connection.execute(`SELECT total_asli, kode_unik, total_tagihan FROM pembayaran_kodeunik WHERE kode_pesanan = ? LIMIT 1`, [kode_pesanan]);
        if (qrisPaymentRows.length === 0) {
          const msgFallback =
            `📦 *Status Pesanan Anda:*\n` +
            `Kode Pesanan: *${kode_pesanan}*\n` +
            `Jenis: *${metode_pengambilan}*\n` +
            `Metode Bayar: *QRIS*\n` +
            `Total (asli): *Rp${total_harga.toLocaleString()}*\n` +
            `Status: *${status.toUpperCase()}*`;
          return client.sendMessage(nomor, msgFallback);
        }

        const { total_asli, kode_unik, total_tagihan } = qrisPaymentRows[0];
        const msgQRIS =
          `📦 *Status Pesanan Anda:*\n` +
          `Kode Pesanan: *${kode_pesanan}*\n` +
          `Jenis: *${metode_pengambilan}*\n` +
          `Metode Bayar: *QRIS*\n` +
          `Total : *Rp ${total_asli.toLocaleString()}*\n` +
          `Kode Unik: *${kode_unik}*\n` +
          `Total Tagihan: *Rp ${total_tagihan.toLocaleString()}*\n` +
          `Status: *${status.toUpperCase()}*`;

        return client.sendMessage(nomor, msgQRIS);
      }
      return; // Ensure this is not reached if QRIS/Cash is handled
    } //end of status

    if (isi.toLowerCase() === "batal") {
      const [cancelOrderRows] = await connection.execute(`SELECT id, status FROM pesanan WHERE nomor_wa = ? ORDER BY id DESC LIMIT 1`, [nomor]);
      if (cancelOrderRows.length === 0) {
        return client.sendMessage(nomor, "⚠️ Tidak ditemukan pesanan untuk dibatalkan.");
      }

      const pesananTerakhir = cancelOrderRows[0];
      if (pesananTerakhir.status === "Menunggu Pembayaran") {
        setSession(nomor, { step: "konfirmasi_batal", orderId: pesananTerakhir.id });
        return client.sendMessage(nomor, "❓ Apakah Anda yakin akan membatalkan pesanan Anda?");
      } else {
        return client.sendMessage(nomor, "❌ Pesanan Anda sudah diterima. Tidak bisa dibatalkan.");
      }
      return;
    }
    if (session?.step === "konfirmasi_batal") {
      const jawaban = isi.trim().toLowerCase();
      const affirmatif = ["y", "ya", "iya", "yes", "yoi", "iyes"];

      if (affirmatif.includes(jawaban)) {
        const orderId = session.orderId;
        await connection.execute(`UPDATE pesanan SET status = 'Dibatalkan' WHERE id = ?`, [orderId]);
        await client.sendMessage(nomor, "✅ Pesanan Anda telah dibatalkan.");
        clearSession(nomor);
      } else {
        await client.sendMessage(nomor, "ℹ️ Anda tidak membatalkan pesanan.");
        clearSession(nomor);
      }
      return;
    }

    // Handle pesan tidak dikenali
    const randomPrompt = Math.random() > 0.5
      ? "Apakah Anda ingin melihat *MENU*?"
      : "Apakah Anda butuh *BANTUAN*?";

    await client.sendMessage(nomor, `Hai! Saya siap bantu pesan makanan kamu 🍽️\n\nSilakan ketik *MENU* untuk melihat daftar makanan yang tersedia.\n\nKetik *PESAN* untuk memesan makanan.\n\nTanyakan *cara pesan* untuk detail.`);

    // Set session untuk menangkap jawaban YA
    setSession(nomor, {
      step: "menunggu_konfirmasi",
      promptType: randomPrompt.includes("MENU") ? "menu" : "help"
    });

  } catch (err) {
    console.error('❌ Error in botController:', err);
    await client.sendMessage(nomor, "Terjadi kesalahan pada sistem. Mohon coba beberapa saat lagi atau hubungi admin.");
  } finally {
    if (connection) {
      connection.release(); // Pastikan koneksi selalu dikembalikan ke pool
    }
  }
};
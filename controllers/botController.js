const db = require('../db');
const { MessageMedia  } = require('whatsapp-web.js');
const { getSession, setSession, clearSession } = require('./sessionManager');
//const { parsePesananDariTeks } = require('../utils/parsePesanan');

module.exports = async function(client, message) {
  const isi = message.body.trim();
  const nomor = message.from;
  console.log('Menerima Pesan dari : '+ nomor);
  if(nomor != 'status@broadcast'){
    db.query(`INSERT INTO pesan_masuk (nomor_wa, isi_pesan, tanggal_jam) VALUES (?, ?, NOW())`, [nomor, isi]);
  }
  // Cek apakah user terdaftar
  db.query(`SELECT * FROM user WHERE nomor_wa = ?`, [nomor], async (err, rows) => {
    if (err) return console.error(err);

    const userTerdaftar = rows.length > 0;
    const namaUser = userTerdaftar ? rows[0].nama : null;
    const session = getSession(nomor);

    const sapaan = ["hi", "hai", "halo", "hello", "hallo"];
    if (sapaan.includes(isi.toLowerCase())) {
        const teksBalik = isi.charAt(0).toUpperCase() + isi.slice(1).toLowerCase();
        //await client.sendMessage(nomor, `${teksBalik} juga! 👋 Aku adalah robot pintar dari *Wabot-Resto*. Ada yang bisa saya bantu?\n\nKetik *MENU* untuk melihat daftar menu, atau *HELP* untuk bantuan.`);
        //return;
        if(userTerdaftar){
            await client.sendMessage(nomor, `${teksBalik} juga ${namaUser}, 👋 Aku adalah robot pintar dari *Wabot-Resto*, yang akan selalu setia menjadi asisten virtual untuk membantu kakak memesan makanan favorit. Ada yang bisa di bantu?\n\nKetik *MENU* untuk melihat daftar menu, ketik *HELP* untuk bantuan atau ketik *INFO* untuk informasi.`);
            return;
        }
        if(!userTerdaftar){
            await client.sendMessage(nomor, `${teksBalik} juga!, 👋\n\nSelamat datang di *Wabot-Resto*, aku adalah asisten virtual yang siap membantu kakak pesan makanan favorit 🍜\n\nSebelum mulai, boleh kenalan dulu? 😊 \nSilakan ketik *DAFTAR* untuk mulai mendaftar ya.\nKalau kakak butuh bantuan, ketik saja *HELP*. Aku siap bantu!`);
            return;
        }
    }
    if(isi.toLowerCase() === "help" && !userTerdaftar){
        await client.sendMessage(nomor, `Sepertinya kakak butuh bantuan, tapi aku belum bisa membantu kakak. Yuk kenalan dulu. Ketik *DAFTAR* untuk mulai mendaftar ya. 😊`);
        return;
    }
    // Handle jika user sudah terdaftar tapi ketik "daftar"
    if (userTerdaftar && isi.toLowerCase() === "daftar") {
      await client.sendMessage(nomor, `Kakak sudah terdaftar sebagai ${namaUser}.😊 \nKetik *MENU* untuk melihat menu ya kak.`);
      return;
    }
    if (!userTerdaftar ) {
      if (isi.toLowerCase() === "daftar") {
        await client.sendMessage(nomor, "Silakan ketik nama kakak agar aku selalu mengingat kakak.😊");
        setSession(nomor, { step: "menunggu_nama" });
        return;
      }

      if (session?.step === "menunggu_nama") {
        var namaisi = isi.toUpperCase();
        db.query(`INSERT INTO user (nomor_wa, nama, tanggal_daftar) VALUES (?, ?, NOW())`, [nomor, namaisi]);
        await client.sendMessage(nomor, `Hai 👋 Kak ${namaisi}\n✅ Pendaftaran berhasil. Ketik *MENU* untuk melihat menu.`);
        clearSession(nomor);
        return;
      }

      //await client.sendMessage(nomor, "Selamat Datang, Saya adalah *Robot Pintar* dari *Wabot-Resto*.\nSilahkan daftar terlebih dahulu dengan mengetik *DAFTAR*");
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

    // Menu
    const modelMenu = ["menu", "meu", "men", "menuw", "menui", "meniu","meni"];
    if (modelMenu.includes(isi.toLowerCase())) {
    //if (isi.toLowerCase() === "menu") {
        await client.sendMessage(nomor, "Sebentar ya kak, 😊\nDaftar menu akan saya kirim sebentar lagi.");
        db.query(`SELECT url_gambar FROM daftar_menu`, async (err, result) => {
            if (err || result.length === 0) return client.sendMessage(nomor, "Menu belum tersedia.");

            for (const row of result) {
            try {
                const media = await MessageMedia.fromUrl(row.url_gambar);
                await client.sendMessage(nomor, media);
            } catch (error) {
                console.error("Gagal kirim gambar:", error);
                await client.sendMessage(nomor, "Gagal menampilkan salah satu gambar menu.");
            }
            }
        });
        return;
    }

    // Pesan
    const modelPesan = ["pesan", "psn", "pesen", "psan", "peszn", "saya ingin pesan","saya pesan","saya mau pesan"];
    if (modelPesan.includes(isi.toLowerCase())) {
    //if (isi.toLowerCase() === "pesan") {
      db.query(`SELECT kode_pesanan,nomor_wa,status FROM pesanan WHERE nomor_wa = ? AND status IN ('Menunggu Pembayaran','Dibayar','Sedang dibuat')`, [nomor],async (err, rows) => {
        if (err) {
          console.error("Error saat cek pesanan aktif:", err);
          // Jika terjadi kesalahan DB, kita bisa minta user coba lagi
          return client.sendMessage(nomor, "❌ Terjadi kesalahan pada server. Silakan coba lagi nanti.");
        }
        //console.error("Jumlah  : "+ rows.length);
        if (rows.length > 0) {
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

            await client.sendMessage(nomor,`📝 Silahkan masukan pesanan Anda satu per satu.\n\nGunakan format :\n*#kode x jumlah* atau \n*Nama Menu x jumlah*.\n\nKetik *Selesai* jika sudah selesai memesan.`);
            
        }
      });
      return;
    }
    //tangani pesanan
    if (session?.step === "input_pesanan") {
      const modelSelesai = ["selesai", "selsai", "sudah", "udah", "dah", "itu aja","sudah itu aja"];
      if (modelSelesai.includes(isi.toLowerCase())) {
      //if (isi.toLowerCase() === "selesai") {
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
      //const regexKode = /#(\d+)\s*x\s*(\d+)/i;
      //const matchKode = isi.match(regexKode);
      let matchKode = isi.match(/^#(\d+)(?:\s*x\s*(\d+))?$/i);
      if (matchKode) {
        const kode = matchKode[1];
        const qty = parseInt(matchKode[2]) || 1; // default qty = 1 jika tidak ditulis

        db.query(`SELECT * FROM table_menu WHERE kode_menu = ?`, [kode], async (err, rows) => {
          if (err || rows.length === 0) {
            return client.sendMessage(nomor, `❌ Menu dengan kode #${kode} tidak ditemukan.`);
          }

          const item = rows[0];
          session.pesanan.push({
            kode_menu: item.kode_menu,
            nama_menu: item.nama_menu,
            harga: item.harga,
            qty
          });
          setSession(nomor, session);
          await client.sendMessage(nomor, `✅ *${item.nama_menu} x${qty}* telah ditambahkan.`);
        });
        return;
      }

      // Deteksi nama menu + qty (fuzzy)
      const matchNamaQty = isi.match(/^(.+?)\s*x\s*(\d+)$/i);
      const nama = matchNamaQty ? matchNamaQty[1].trim() : isi.trim();
      const qty = matchNamaQty ? parseInt(matchNamaQty[2]) : 1;

      const { cariMenuDenganNamaBebas } = require('../utils/fuzzyMatcher');
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
      //return client.sendMessage(nomor, "❌ Format tidak dikenali. Gunakan *#kode x jumlah* atau *nama menu x jumlah*. Ketik *selesai* jika sudah selesai.");
    }
    //block kode menangani pesanan

    // Konfirmasi pesanan
    if (session?.step === "konfirmasi_pesanan") {
      const modelKonfirmasi = ["sudah", "sesuai", "sudah sesuai", "y", "dah", "ya","iya","yes","yoi"];
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
        if(pilihan === "cancel" || pilihan === "batal") {
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
      db.query(`SELECT COUNT(*) AS total FROM pesanan`, (err, result) => {
        const noUrut = result[0].total + 1;
        const kodePesanan = 'OR' + noUrut.toString().padStart(3, '0');

        const kodeList = session.pesanan.map(p => p.kode_menu);
        //const daftarMenuQty = session.pesanan.map(p => `${p.kode_menu}x${p.qty}`).join(',');
        //const totalHarga2 = session.pesanan.reduce((acc, p) => acc + (p.qty * p.harga), 0);
        
        db.query(`SELECT kode_menu, harga FROM table_menu WHERE kode_menu IN (${kodeList.map(() => '?').join(',')})`, kodeList, (err2, hargaRows) => {
          if (err2 || hargaRows.length === 0) {
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
            if (!hargaValid) continue; // abaikan item tidak valid

            daftarMenuQty.push(`${item.kode_menu}x${item.qty}`);
            totalHarga += hargaValid * item.qty;
          }

          // Simpan ke DB
          db.query(`INSERT INTO pesanan 
            (kode_pesanan, nomor_wa, daftar_kode_menu, total_harga, metode_pengambilan, alamat, no_meja, metode_pembayaran, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu Pembayaran')`, [
            kodePesanan, nomor, daftarMenuQty.join(','), totalHarga, session.metode, session.alamat || null, session.no_meja || null, metode
          ]);
          if (metode === "qris") {
                const kodeUnik = Math.floor(100 + Math.random() * 900);
                const totalBayar = totalHarga + kodeUnik;

                // Simpan ke tabel pembayaran_kodeunik
                db.query(`INSERT INTO pembayaran_kodeunik 
                (kode_pesanan, total_asli, kode_unik, total_tagihan, status) 
                VALUES (?, ?, ?, ?, 'Menunggu Pembayaran')`, 
                [kodePesanan, totalHarga, kodeUnik, totalBayar]);

                client.sendMessage(nomor, `✅ Pesanan berhasil dibuat :\nKode pesanan : *${kodePesanan}*\nStatus : *Menunggu Pembayaran*\nTagihan : Rp ${totalHarga.toLocaleString()}\nKode unik : *${kodeUnik}*\n\nSilahkan *SCAN* QRIS dibawah ini dan Bayar sesuai dengan total tagihan : *Rp ${totalBayar.toLocaleString()}*\n(Jangan lupa kode uniknya ya kak *${kodeUnik}*).`);

                db.query(`SELECT url_gambar FROM gambar_qris LIMIT 1`, async (err, rows) => {
                if (rows.length > 0) {
                    const media = await MessageMedia.fromUrl(rows[0].url_gambar);
                    client.sendMessage(nomor, media);
                }
                });
            }
          if (metode === "cash") {
                //client.sendMessage(nomor, media);
                client.sendMessage(nomor, `✅ Pesanan berhasil dibuat :\nKode pesanan : *${kodePesanan}*\nStatus : *Menunggu Pembayaran*\nTotal: Rp ${totalHarga.toLocaleString()}\n\nSilahkan membayar ke kasir sesuai total tagihan ya kak 😊.`);
          }
          
          clearSession(nomor);
        });
      });

      return;
    }

    //tangani status pesanan
    if (isi.toLowerCase() === "status") {
      
      db.query(`SELECT kode_pesanan, total_harga, metode_pengambilan, metode_pembayaran, status FROM pesanan WHERE nomor_wa = ? ORDER BY id DESC LIMIT 1`,[nomor], async (err, rows) => {
          if (err || rows.length === 0) {
            return client.sendMessage(nomor, "⚠️ Tidak ditemukan pesanan atas nama Anda.");
          }
          const pesanan = rows[0];
          const { kode_pesanan, total_harga, metode_pengambilan, metode_pembayaran, status } = pesanan;
          console.log('pesan nya adalah '+metode_pembayaran);
          if (metode_pembayaran === "Cash") {
            // Jika metode Cash, cukup tampilkan total_harga dari tabel pesanan
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
            // Jika metode QRIS, ambil data tagihan dari tabel pembayaran_kodeunik
            db.query(`SELECT total_asli, kode_unik, total_tagihan FROM pembayaran_kodeunik WHERE kode_pesanan = ? LIMIT 1`, [kode_pesanan],
              (err2, rows2) => {
                if (err2 || rows2.length === 0) {
                  // Jika data pembayaran_kodeunik tidak ditemukan, fallback ke tampilan sederhana
                  const msgFallback = 
                    `📦 *Status Pesanan Anda:*\n` +
                    `Kode Pesanan: *${kode_pesanan}*\n` +
                    `Jenis: *${metode_pengambilan}*\n` +
                    `Metode Bayar: *QRIS*\n` +
                    `Total (asli): *Rp${total_harga.toLocaleString()}*\n` +
                    `Status: *${status.toUpperCase()}*`;
                  return client.sendMessage(nomor, msgFallback);
                }

                const { total_asli, kode_unik, total_tagihan } = rows2[0];
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
            );
            return;
          }
        }
      );
      return;
    } //end of status


    // if (isi.toLowerCase() === "batal") {
    //   db.query(`SELECT id, status FROM pesanan WHERE nomor_wa = ? ORDER BY id DESC LIMIT 1`, [nomor], (err, rows) => {
    //     if (err || rows.length === 0) {
    //       return client.sendMessage(nomor, "⚠️ Tidak ditemukan pesanan untuk dibatalkan.");
    //     }
    //     const pesanan = rows[0];
    //     if (pesanan.status !== "Menunggu Pembayaran") {
    //       return client.sendMessage(nomor, "❌ Pesanan tidak dapat dibatalkan karena sudah dibayar atau sudah selesai.");
    //     } else {
    //       // Update jadi dibatalkan
    //       db.query(`UPDATE pesanan SET status = 'Dibatalkan' WHERE id = ?`, [pesanan.id]);
    //       client.sendMessage(nomor, "✅ Pesanan Anda telah *Dibatalkan*.");
    //     }
        
    //   });
    //   return;
    // }
    
    if (isi.toLowerCase() === "batal") {
      db.query(`SELECT id, status FROM pesanan WHERE nomor_wa = ? ORDER BY id DESC LIMIT 1`, [nomor], (err, rows) => {
        if (err) {
          console.error(err);
          return client.sendMessage(nomor, "⚠️ Terjadi kesalahan saat memeriksa pesanan.");
        }
        if (rows.length === 0) {
          return client.sendMessage(nomor, "⚠️ Tidak ditemukan pesanan untuk dibatalkan.");
        }

        const pesananTerakhir = rows[0];
        // Hanya boleh batalkan jika status = "menunggu pembayaran"
        if (pesananTerakhir.status === "Menunggu Pembayaran") {
          // Simpan context untuk konfirmasi batal
          setSession(nomor, { step: "konfirmasi_batal", orderId: pesananTerakhir.id });
          return client.sendMessage(nomor, "❓ Apakah Anda yakin akan membatalkan pesanan Anda?");
        } else {
          return client.sendMessage(nomor, "❌ Pesanan Anda sudah diterima. Tidak bisa dibatalkan.");
        }
      });
      return;
    }
    if (session?.step === "konfirmasi_batal") {
      const jawaban = isi.trim().toLowerCase();
      const affirmatif = ["y", "ya", "iya", "yes", "yoi", "iyes"];

      if (affirmatif.includes(jawaban)) {
        // Lanjutkan proses penghapusan (update status)
        const orderId = session.orderId;
        db.query(`UPDATE pesanan SET status = 'Dibatalkan' WHERE id = ?`, [orderId], (err) => {
          if (err) {
            console.error(err);
            client.sendMessage(nomor, "⚠️ Terjadi kesalahan saat membatalkan pesanan.");
          } else {
            client.sendMessage(nomor, "✅ Pesanan Anda telah dibatalkan.");
          }
          clearSession(nomor);
        });
      } else {
        // User menolak membatalkan
        client.sendMessage(nomor, "ℹ️ Anda tidak membatalkan pesanan.");
        clearSession(nomor);
      }
      return;
    }


    // Handle pesan tidak dikenali
    const randomPrompt = Math.random() > 0.5 
      ? "Apakah Anda ingin melihat *MENU*?" 
      : "Apakah Anda butuh *BANTUAN*?";
    
    //await client.sendMessage(nomor, `Pesan tidak dikenali. ${randomPrompt}\n\nKetik *YA* untuk melanjutkan atau ketik *MENU* / *HELP* langsung.`);
    await client.sendMessage(nomor, `Hai! Saya siap bantu pesan makanan kamu 🍽️\nSilakan ketik menu untuk melihat daftar makanan yang tersedia.`);
    
    // Set session untuk menangkap jawaban YA
    setSession(nomor, { 
      step: "menunggu_konfirmasi", 
      promptType: randomPrompt.includes("MENU") ? "menu" : "help" 
    });

  });
}
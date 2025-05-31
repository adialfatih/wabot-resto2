const db = require('../db');
const { MessageMedia  } = require('whatsapp-web.js');
const { getSession, setSession, clearSession } = require('./sessionManager');
const { parsePesananDariTeks } = require('../utils/parsePesanan');

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
- *PESAN #1 #2* untuk memesan`);
      return;
    }

    // Menu
    if (isi.toLowerCase() === "menu") {
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
    if (isi.toLowerCase().startsWith("pesan") || isi.toLowerCase().startsWith("psn")) {
        //const kodeQtyMap = await parsePesananDariTeks(isi);
        const { kodeQtyMap, orderedKode } = await parsePesananDariTeks(isi);
        const semuaKode = orderedKode; // pakai orderedKode agar urutan sesuai input
        //const semuaKode = Object.keys(kodeQtyMap);
        console.log('semuaKode', semuaKode);
        if (semuaKode.length === 0) {
            return client.sendMessage(nomor, "⚠️ Tidak ada menu yang cocok ditemukan.");
        }

        db.query(
            `SELECT kode_menu, nama_menu, alias, harga, kategori 
            FROM table_menu 
            WHERE kode_menu IN (${semuaKode.map(() => '?').join(',')})`,
            semuaKode,
            async (err, menuRows) => {
            if (err || menuRows.length === 0) {
                return client.sendMessage(nomor, "❌ Gagal mengambil data menu.");
            }

            //const kategoriUrutan = { food: 1, drink: 2, snack: 3 };
            //const menuTersusun = menuRows.sort((a, b) => (kategoriUrutan[a.kategori] || 99) - (kategoriUrutan[b.kategori] || 99));
            const menuTersusun = Object.keys(kodeQtyMap).map(kode => {
                return menuRows.find(row => row.kode_menu == kode);
            }).filter(Boolean);

            let totalHarga = 0;
            let listMenu = menuTersusun.map((item, i) => {
                const qty = kodeQtyMap[item.kode_menu] || 1;
                const subtotal = qty * item.harga;
                totalHarga += subtotal;
                return `${i + 1}. ${item.nama_menu} x${qty} Rp. ${subtotal.toLocaleString('id-ID')}`;
            }).join('\n');

            const pesanRingkasan = `🛒 *Apakah pesanan sudah sesuai?*\n${listMenu}\n\n*Total Pesanan:* Rp. ${totalHarga.toLocaleString('id-ID')}`;

            // Simpan ke session
            const pesananDetail = menuRows.map(menu => ({
                kode_menu: menu.kode_menu,
                qty: kodeQtyMap[menu.kode_menu] || 1
            }));

            setSession(nomor, { step: "konfirmasi_pesanan", pesanan: pesananDetail });
            await client.sendMessage(nomor, pesanRingkasan);
            }
        );

        return;
    } //end pesan


    // Konfirmasi pesanan
    if (session?.step === "konfirmasi_pesanan") {
      if (isi.toLowerCase() === "ya" || isi.toLowerCase() === "y" || isi.toLowerCase() === "iya" || isi.toLowerCase() === "yes") {
        setSession(nomor, { step: "pilih_pengambilan" });
        client.sendMessage(nomor, "Silakan pilih: *Dine In* / *Take Away* / *Delivery*");
      } else {
        clearSession(nomor);
        client.sendMessage(nomor, 'Silahkan pesan kembali dengan mengetik *Pesan #kode*');
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
        if(pilihan === "cancel") {
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
        // Hitung total harga
        //const kodeList = session.kode;
        db.query(`SELECT kode_menu, harga FROM table_menu WHERE kode_menu IN (${kodeList.map(() => '?').join(',')})`, kodeList, (err, hargaRows) => {
          const totalHarga = hargaRows.reduce((acc, row) => acc + row.harga, 0);

          // Simpan ke DB
          db.query(`INSERT INTO pesanan 
            (kode_pesanan, nomor_wa, daftar_kode_menu, total_harga, metode_pengambilan, alamat, no_meja, metode_pembayaran, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu Pembayaran')`, [
            kodePesanan, nomor, kodeList.join(','), totalHarga, session.metode, session.alamat || null, session.no_meja || null, metode
          ]);
          if (metode === "qris") {
                const kodeUnik = Math.floor(100 + Math.random() * 900);
                const totalBayar = totalHarga + kodeUnik;

                // Simpan ke tabel pembayaran_kodeunik
                db.query(`INSERT INTO pembayaran_kodeunik 
                (kode_pesanan, total_asli, kode_unik, total_tagihan, status) 
                VALUES (?, ?, ?, ?, 'Menunggu Pembayaran')`, 
                [kodePesanan, totalHarga, kodeUnik, totalBayar]);

                client.sendMessage(nomor, `✅ Pesanan berhasil dibuat :\nKode pesanan : *${kodePesanan}*\nStatus : *Menunggu Pembayaran*\nTagihan : Rp ${totalHarga.toLocaleString()}\nKode unik : *${kodeUnik}*\n\nSilahkan *SCAN* dan Bayar sesuai dengan total tagihan : *Rp ${totalBayar.toLocaleString()}* (Jangan lupa kode uniknya ya kak *${kodeUnik}*).`);

                db.query(`SELECT url_gambar FROM gambar_qris LIMIT 1`, async (err, rows) => {
                if (rows.length > 0) {
                    const media = await MessageMedia.fromUrl(rows[0].url_gambar);
                    client.sendMessage(nomor, media);
                }
                });
            }
          if (metode === "cash") {
                client.sendMessage(nomor, media);
                client.sendMessage(nomor, `✅ Pesanan berhasil dibuat :\nKode pesanan : *${kodePesanan}*\nStatus : *Menunggu Pembayaran*\nTotal: Rp ${totalHarga.toLocaleString()}\n\n Silahkan membayar ke kasir seusai total tagihan ya kak 😊.`);
          }
          
          clearSession(nomor);
        });
      });

      return;
    }

    if (isi.toLowerCase() === "status") {
          db.query(`
            SELECT kode_pesanan, total_harga, metode_pengambilan, status, created_at 
            FROM pesanan 
            WHERE nomor_wa = ? 
            ORDER BY id DESC 
            LIMIT 1
          `, [nomor], async (err, rows) => {
            if (err || rows.length === 0) {
              return client.sendMessage(nomor, "⚠️ Tidak ditemukan pesanan atas nama Anda.");
            }

            const pesanan = rows[0];
            await client.sendMessage(nomor, `📦 *Status Pesanan Anda:*\nKode Pesanan: *${pesanan.kode_pesanan}*\nJenis : *${pesanan.metode_pengambilan}*\nTotal: *Rp${pesanan.total_harga.toLocaleString()}*\nStatus: *${pesanan.status.toUpperCase()}*`);
          });
          return;
    }

    if (isi.toLowerCase() === "batal") {
      db.query(`
        SELECT id, status 
        FROM pesanan 
        WHERE nomor_wa = ? 
        ORDER BY id DESC 
        LIMIT 1
      `, [nomor], (err, rows) => {
        if (err || rows.length === 0) {
          return client.sendMessage(nomor, "⚠️ Tidak ditemukan pesanan untuk dibatalkan.");
        }

        const pesanan = rows[0];
        if (pesanan.status !== "selesai") {
          return client.sendMessage(nomor, "❌ Pesanan tidak dapat dibatalkan karena sudah dibayar atau sudah selesai.");
        }

        // Update jadi dibatalkan
        db.query(`UPDATE pesanan SET status = 'dibatalkan' WHERE id = ?`, [pesanan.id]);
        client.sendMessage(nomor, "✅ Pesanan Anda telah *dibatalkan*.");
      });
      return;
    }


    // Handle pesan tidak dikenali
    const randomPrompt = Math.random() > 0.5 
      ? "Apakah Anda ingin melihat *MENU*?" 
      : "Apakah Anda butuh *BANTUAN*?";
    
    await client.sendMessage(nomor, `Pesan tidak dikenali. ${randomPrompt}\n\nKetik *YA* untuk melanjutkan atau ketik *MENU* / *HELP* langsung.`);
    
    // Set session untuk menangkap jawaban YA
    setSession(nomor, { 
      step: "menunggu_konfirmasi", 
      promptType: randomPrompt.includes("MENU") ? "menu" : "help" 
    });

  });
}
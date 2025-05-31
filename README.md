# WhatsApp Bot Pemesanan Makanan Restoran

![WhatsApp Bot](https://img.shields.io/badge/WhatsApp-Bot-green) 
![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen) 
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)

Sebuah WhatsApp bot untuk memudahkan pelanggan memesan makanan dari restoran secara otomatis melalui WhatsApp.

## 📌 Fitur Utama

- **Pendaftaran Pelanggan**: Sistem registrasi via WhatsApp
- **Menu Digital**: Tampilan menu dengan gambar
- **Pemesanan**: Pesan menggunakan kode menu (contoh: #1 #5)
- **Metode Pengambilan**:
  - Dine In
  - Take Away
  - Delivery (dengan input alamat)
- **Pembayaran**:
  - Cash
  - QRIS (dengan tampilan gambar QR)
- **Konfirmasi Otomatis**: Notifikasi status pesanan

## 🛠 Teknologi

| Komponen       | Teknologi                  |
|----------------|----------------------------|
| WhatsApp API   | whatsapp-web.js            |
| Backend        | Node.js                    |
| Database       | MySQL                      |
| Session        | Custom Session Manager     |
| Server         | Express.js                 |

## 🚀 Cara Install

1. **Clone Repository**
   ```bash
   git clone https://github.com/adialfatih/wabot-resto2.git
   cd wabot-resto2

2. **Install Dependencies**
   ```bash
   npm install
   npm install express whatsapp-web.js mysql2 ejs express-session qrcode-terminal
   npm install -g pm2
   pm2 start app.js --name wa-resto
   pm2 save
   pm2 startup
   npm install qrcode



3. **Setup Database**
   - Import file database/schema.sql ke MySQL
   - Konfigurasi koneksi di config/db.js
  
4. **Konfigurasi Environment**
   - Buat file .env berdasarkan .env.example:
      ```bash
      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD=
      DB_NAME=resto_bot
5. **Jalankan Aplikasi**
   ```bash
   node server.js


## 📂 Struktur Projek
    ```bash
    wabot-resto2/
    ├── config/
    │   └── db.js
    ├── controllers/
    │   └── botController.js
    ├── database/
    │   └── schema.sql
    ├── models/
    ├── routes/
    ├── services/
    │   └── sessionManager.js
    ├── .env.example
    ├── package.json
    └── server.js

##📱 Cara Penggunaan
      Untuk Pelanggan:
      - Kirim DAFTAR ke nomor bot
      - Ikuti instruksi pendaftaran
      - Kirim MENU untuk melihat daftar menu
      - Kirim PESAN #1 #2 untuk memesan
      - Pilih metode pengambilan
      - Pilih metode pembayaran
      Untuk Admin:
      - Tambahkan menu ke tabel table_menu
      - Update gambar QRIS di gambar_qris
      - Pantau pesanan di tabel pesanan

##📸 Screenshot
Contoh Percakapan

🤝 Berkontribusi
Fork project ini

Buat branch fitur baru (git checkout -b fitur-baru)

Commit perubahan (git commit -m 'Tambahkan fitur')

Push ke branch (git push origin fitur-baru)

Buat Pull Request

📜 Lisensi
Distributed under MIT License. See LICENSE for more information.

Dibuat oleh adisubuh - GitHub - adisubuh@gmail.com



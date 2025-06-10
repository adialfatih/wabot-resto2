const mysql = require('mysql2/promise'); // Menggunakan versi Promise API dari mysql2
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true, // Akan menunggu jika semua koneksi di pool sedang digunakan
  connectionLimit: 20,     // Jumlah maksimum koneksi di pool (sesuaikan, 15-20 adalah titik awal yang baik)
  queueLimit: 0            // 0 berarti tidak ada batasan antrian, request akan menunggu
});

console.log('✅ MySQL Connection Pool Created');

module.exports = pool;
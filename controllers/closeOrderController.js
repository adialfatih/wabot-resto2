const pool = require('../db'); // Impor pool dari db.js
const { getSession, setSession, clearSession } = require('./sessionManager'); // Mungkin dibutuhkan jika ada sesi untuk info jam buka

// Helper function untuk mendapatkan sapaan berdasarkan waktu
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Pagi';
    if (hour < 15) return 'Siang';
    if (hour < 18) return 'Sore';
    return 'Malam';
}

// Helper function untuk memformat jam buka
function formatJamBuka(jamBuka, jamTutup) {
    if (jamBuka === '00:00' && jamTutup === '00:00') {
        return 'Kami Libur ya kak 😊'; 
    }
    return `Buka pukul ${jamBuka} - ${jamTutup} WIB`;
}

module.exports = async function(client, message) {
    const nomor = message.from;
    const isi = message.body.trim().toLowerCase();
    const hariIni = new Date();
    const hariSekarang = hariIni.toLocaleDateString('id-ID', { weekday: 'long' }); // Contoh: "Senin"
    const hariUntukQuery = hariSekarang.charAt(0).toUpperCase() + hariSekarang.slice(1);

    let connection;

    try {
        connection = await pool.getConnection();

        // Ambil jam buka hari ini
        const [jamBukaHariIniRows] = await connection.execute(
            `SELECT jam_buka, jam_tutup FROM jam_buka_resto WHERE hari = ?`,
            [hariUntukQuery]
        );

        let infoJamHariIni = "Informasi jam buka hari ini tidak tersedia.";
        if (jamBukaHariIniRows.length > 0) {
            infoJamHariIni = `Hari ini (${hariSekarang}): ${formatJamBuka(jamBukaHariIniRows[0].jam_buka, jamBukaHariIniRows[0].jam_tutup)}`;
        }

        // Cek apakah user meminta info jam buka spesifik
        const modelInfoJamBuka = ["info jam buka", "jam buka", "jam operasional", "buka jam berapa"];
        if (modelInfoJamBuka.includes(isi)) {
            // Ambil semua jam buka
            const [semuaJamBukaRows] = await connection.execute(
                `SELECT hari, jam_buka, jam_tutup FROM jam_buka_resto ORDER BY FIELD(hari, 'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu')`
            );

            let daftarJamBuka = `⏰ *Jam Operasional Wabot-Resto:*\n\n`;
            if (semuaJamBukaRows.length > 0) {
                semuaJamBukaRows.forEach(row => {
                    daftarJamBuka += `- ${row.hari}: \n-- ${formatJamBuka(row.jam_buka, row.jam_tutup)}\n`;
                });
            } else {
                daftarJamBuka += "Informasi jam buka tidak tersedia saat ini.";
            }

            await client.sendMessage(nomor, daftarJamBuka);
            return; // Hentikan eksekusi setelah mengirim info jam buka
        }

        // Respons default saat resto tutup (jika tidak ada permintaan info jam buka spesifik)
        const sapaan = getGreeting();
        await client.sendMessage(nomor,
            `Selamat ${sapaan}, Mohon maaf. 😔\n\n` +
            `*Wabot-Resto* sedang *tutup* saat ini.\n` +
            `${infoJamHariIni}.\n\n` +
            `Kami akan melayani Anda kembali sesuai jam operasional. Sampai jumpa!`
        );

    } catch (error) {
        console.error('❌ Error in closeOrderController:', error);
        await client.sendMessage(nomor, "Terjadi kesalahan pada sistem. Mohon coba beberapa saat lagi atau hubungi admin.");
    } finally {
        if (connection) {
            connection.release(); // Pastikan koneksi selalu dikembalikan ke pool
        }
    }
};
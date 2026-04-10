const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static'); // Import the ffmpeg path

const app = express();
app.use(cors());
app.use(express.json());

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

app.use('/downloads', express.static(downloadsDir));

app.post('/convert', (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.json({ error: "No URL provided" });
    }

    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(downloadsDir, filename);
    
    // Path to the yt-dlp binary we downloaded in render.yaml
    const ytdlpPath = path.join(__dirname, 'yt-dlp');

    // Updated command using local binaries
    const command = `"${ytdlpPath}" "${url}" -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 --ffmpeg-location "${ffmpegPath}" -o "${filepath}" --no-playlist`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error("DETAILED ERROR:", err);
            return res.json({ error: "Conversion failed. Check server logs." });
        }

        res.json({
            download: `https://yttomp3-wv9p.onrender.com/downloads/${filename}`
        });
    });
});

// Clean up old files (Recommended for Render's limited disk space)
setInterval(() => {
    fs.readdir(downloadsDir, (err, files) => {
        if (err) return;
        files.forEach(file => {
            const filePath = path.join(downloadsDir, file);
            const stats = fs.statSync(filePath);
            const now = new Date().getTime();
            const endTime = new Date(stats.ctime).getTime() + 300000; // 5 minutes
            if (now > endTime) fs.unlink(filePath, () => {});
        });
    });
}, 60000);

app.get('/', (req, res) => res.send("Backend running"));

app.listen(process.env.PORT || 3000);
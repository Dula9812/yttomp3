// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('downloads'));

// Ensure downloads folder exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// POST /convert - convert YouTube URL to MP3
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('downloads'));

// create downloads folder
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

app.post('/convert', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.json({ error: "No URL provided" });
    }

    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(downloadsDir, filename);

    try {
        await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: filepath
        });

        res.json({
            download: `https://yttomp3-wv9p.onrender.com/downloads/${filename}`
        });

    } catch (err) {
        console.error("Download error:", err);
        res.json({ error: "Conversion failed" });
    }
});

app.get('/', (req, res) => {
    res.send("Backend running");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});

// Simple GET route to check backend
app.get('/', (req, res) => {
    res.send("Backend running");
});

// Listen on Render’s port or 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
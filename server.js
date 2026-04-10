const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');

const app = express();
app.use(cors());
app.use(express.json());

// Create downloads folder
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// Serve downloads folder
app.use('/downloads', express.static(downloadsDir));

app.post('/convert', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.json({ error: "No URL provided" });
    }

    try {
        const outputTemplate = path.join(downloadsDir, '%(title)s.%(ext)s');

        const result = await youtubedl(url, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputTemplate,
            preferFreeFormats: true,
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
        });

        console.log("yt-dlp output:", result);

        // get latest file
        const files = fs.readdirSync(downloadsDir);

        const latestFile = files
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(downloadsDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time)[0].name;

        res.json({
            download: `https://yttomp3-wv9p.onrender.com/downloads/${encodeURIComponent(latestFile)}`
        });

    } catch (err) {
        console.error("FULL ERROR:", err);
        res.json({ error: "Conversion failed" });
    }
});

// Test route
app.get('/', (req, res) => {
    res.send("Backend running");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
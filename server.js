const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// create downloads folder
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

// serve files
app.use('/downloads', express.static(downloadsDir));

app.post('/convert', (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.json({ error: "No URL provided" });
    }

    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(downloadsDir, filename);

    // yt-dlp command (MOST STABLE)
    const command = `yt-dlp -x --audio-format mp3 -o "${filepath}" "${url}"`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.log("ERROR:", stderr);
            return res.json({ error: "Conversion failed" });
        }

        console.log("SUCCESS:", filename);

        res.json({
            download: `https://yttomp3-wv9p.onrender.com/downloads/${filename}`
        });
    });
});

app.get('/', (req, res) => {
    res.send("Backend running");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running");
});
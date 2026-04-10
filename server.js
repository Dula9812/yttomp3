const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

app.use('/downloads', express.static(downloadsDir));

app.post('/convert', (req, res) => {
    const url = req.body.url;
    if (!url) return res.json({ error: "No URL provided" });

    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(downloadsDir, filename);

    // Simplified command because tools are pre-installed in Docker
    // Inside server.js
	const command = `yt-dlp "${url}" -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 --cookies cookies.txt -o "${filepath}" --no-playlist`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error("LOGS:", stderr); // This will show up in Render's "Logs" tab
            return res.json({ error: "Conversion failed. The video might be age-restricted or YouTube is blocking the server." });
        }

        res.json({
            // Use a relative path or an environment variable for the domain
            download: `https://${req.get('host')}/downloads/${filename}`
        });
    });
});

app.listen(process.env.PORT || 3000, () => console.log("Server Ready"));
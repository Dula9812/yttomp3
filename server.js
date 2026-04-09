const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('downloads'));

app.post('/convert', (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.json({ error: "No URL provided" });
    }

    const filename = `audio_${Date.now()}.mp3`;

    const command = `yt-dlp -x --audio-format mp3 --ffmpeg-location /usr/bin/ffmpeg -o downloads/${filename} "${url}"`;

    exec(command, (err, stdout, stderr) => {
		if (err) {
		console.log("ERROR:", stderr);
		return res.json({ error: "Conversion failed" });
		}

        res.json({
            download: `https://YOUR-RENDER-URL/${filename}`
        });
    });
});

app.get('/', (req, res) => {
    res.send("Backend is running");
});

app.listen(3000, () => {
    console.log("Server running");
});
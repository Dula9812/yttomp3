// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure downloads folder exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// Serve downloads folder correctly
app.use('/downloads', express.static(downloadsDir));

// Convert YouTube to MP3
app.post('/convert', (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.json({ error: "No URL provided" });
    }

    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(downloadsDir, filename);

    // ✅ Use FULL PATH yt-dlp (important for Render)
    const command = `/opt/render/.local/bin/yt-dlp "${url}" -f bestaudio --extract-audio --audio-format mp3 -o "${filepath}" --no-playlist`;

	exec(command, (err, stdout, stderr) => {
		console.log("STDOUT:\n", stdout);
		console.log("STDERR:\n", stderr);

		if (err) {
			return res.json({ 
				error: "Conversion failed",
				details: stderr   // 👈 IMPORTANT
			});
		}

		res.json({
			download: `https://yttomp3-wv9p.onrender.com/downloads/${filename}`
		});
	});
});

// Health check route
app.get('/', (req, res) => {
    res.send("Backend running");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
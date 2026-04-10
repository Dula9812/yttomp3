const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();

app.use(cors());
app.use(express.json());

// Ensure downloads folder exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir);
}

// Serve static files from downloads directory with correct path
app.use('/downloads', express.static(downloadsDir));

// Convert YouTube to MP3 using yt-dlp (more reliable than youtube-dl-exec)
app.post('/convert', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.json({ error: "No URL provided" });
    }

    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(downloadsDir, filename);

    try {
        // Using yt-dlp command line (more reliable)
        const command = `yt-dlp -x --audio-format mp3 -o "${filepath}" "${url}"`;
        
        await execPromise(command);
        
        // Check if file was created
        if (fs.existsSync(filepath)) {
            // Get the base URL from the request
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            
            res.json({
                download: `${baseUrl}/downloads/${filename}`,
                filename: filename
            });
        } else {
            throw new Error("File not created");
        }

    } catch (err) {
        console.error("Download error:", err);
        res.json({ error: "Conversion failed: " + err.message });
    }
});

// Health check route
app.get('/', (req, res) => {
    res.send("Backend running");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Downloads directory: ${downloadsDir}`);
});
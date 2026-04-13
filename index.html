const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const youtubedl = require('youtube-dl-exec');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure downloads folder exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

// Serve static files from downloads directory
app.use('/downloads', express.static(downloadsDir));

// Convert YouTube to MP3
app.post('/convert', async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.json({ error: "No URL provided" });
    }

    // Clean URL (remove playlist and radio parameters)
    const cleanUrl = url.split('&')[0];
    
    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(downloadsDir, filename);

    try {
        console.log(`Converting: ${cleanUrl}`);
        
        await youtubedl(cleanUrl, {
            extractAudio: true,
            audioFormat: 'mp3',
            audioQuality: 0,
            output: filepath,
            noCheckCertificate: true,
            preferFreeFormats: true
        });

        // Check if file exists
        if (fs.existsSync(filepath)) {
            const fileStats = fs.statSync(filepath);
            console.log(`File created: ${filename}, Size: ${fileStats.size} bytes`);
            
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            res.json({
                download: `${baseUrl}/downloads/${filename}`,
                success: true
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
    res.send("YouTube to MP3 Backend Running");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
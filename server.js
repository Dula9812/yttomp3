const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

// Create downloads folder
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

// Clean old files every hour (prevents disk space issues)
setInterval(() => {
    const now = Date.now();
    fs.readdir(downloadsDir, (err, files) => {
        if (err) return;
        files.forEach(file => {
            const filePath = path.join(downloadsDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                // Delete files older than 1 hour
                if (now - stats.mtimeMs > 3600000) {
                    fs.unlink(filePath, () => {});
                }
            });
        });
    });
}, 3600000);

// Serve files
app.use('/downloads', express.static(downloadsDir));

app.post('/convert', (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.json({ error: "No URL provided" });
    }

    // Generate unique filename
    const filename = `${crypto.randomBytes(8).toString('hex')}_${Date.now()}.mp3`;
    const filepath = path.join(downloadsDir, filename);
    
    // Better yt-dlp command with error handling
    const command = `yt-dlp --no-check-certificate -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 0 --add-metadata --no-playlist -o "${filepath}" "${url}"`;

    console.log(`Processing: ${url}`);

    exec(command, { timeout: 120000 }, (err, stdout, stderr) => {
        if (err) {
            console.error("Error:", err.message);
            console.error("Stderr:", stderr);
            
            // Clean up failed file if exists
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
            
            // Check for specific errors
            if (stderr.includes("private video")) {
                return res.json({ error: "This video is private" });
            } else if (stderr.includes("video unavailable")) {
                return res.json({ error: "Video unavailable" });
            } else if (stderr.includes("copyright")) {
                return res.json({ error: "Copyright restricted content" });
            } else if (stderr.includes("age")) {
                return res.json({ error: "Age-restricted video" });
            }
            
            return res.json({ error: "Conversion failed. Please check the URL or try a different video." });
        }

        // Verify file was created
        if (!fs.existsSync(filepath) || fs.statSync(filepath).size === 0) {
            return res.json({ error: "File creation failed" });
        }

        console.log(`Success: ${filename}`);
        
        res.json({
            download: `https://yttomp3-wv9p.onrender.com/downloads/${filename}`,
            filename: filename
        });
    });
});

// Cleanup endpoint (optional, for frontend to delete files)
app.delete('/cleanup/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(downloadsDir, filename);
    
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.json({ success: true });
    } else {
        res.json({ success: false, error: "File not found" });
    }
});

app.get('/', (req, res) => {
    res.send("YT to MP3 Backend Running ✅");
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
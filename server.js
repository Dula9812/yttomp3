const fs = require('fs');
if (!fs.existsSync('downloads')) fs.mkdirSync('downloads');

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

// make sure 'downloads' folder exists
if (!fs.existsSync('downloads')) fs.mkdirSync('downloads');

app.post('/convert', async (req, res) => {
  const url = req.body.url;
  if (!url) return res.json({ error: "No URL provided" });

  const filename = `audio_${Date.now()}.mp3`;
  const filepath = path.join(__dirname, 'downloads', filename);

  try {
	const stream = ytdl(url, { quality: 'highestaudio' });
	ffmpeg(stream)
	  .audioBitrate(192)
	  .format('mp3')
	  .on('error', (err) => {
		console.error("FFmpeg error:", err);
		res.json({ error: "Conversion failed" });
	  })
	  .on('end', () => {
		res.json({ download: `https://YOUR-RENDER-URL/${filename}` });
	  })
	  .save(filepath);

  } catch (err) {
    console.error(err);
    res.json({ error: "Conversion failed" });
  }
});

app.get('/', (req, res) => res.send("Backend running"));
app.listen(process.env.PORT || 3000, () => console.log("Server running"));
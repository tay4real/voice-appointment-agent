require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { handleStream } = require('./assembly/streamHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('audio'), async (req, res) => {
  // const filePath = path.join(__dirname, req.file.path);
  const filePath = req.file.path;

  try {
    const result = await handleStream(filePath);
    res.json(result);
  } catch (error) {
    console.error('Error in /upload:', error);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlink(filePath, () => {}); // clean up uploaded file
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

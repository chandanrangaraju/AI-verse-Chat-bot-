const express = require("express");
const path = require("path");

const app = express();

// Serve all files in root (CSS, JS, etc.)
app.use(express.static(__dirname));

// Serve images folder explicitly
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve favicon at /favicon.ico
app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "images", "bot.png"));
});

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

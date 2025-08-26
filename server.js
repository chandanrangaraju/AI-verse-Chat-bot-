const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ API route for chatbot
app.post("/api/faq/ask", async (req, res) => {
  try {
    const { question, model } = req.body;

    const response = await axios.post(
      `${process.env.BASE_URL}/chat/completions`,
      {
        model: model || "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ answer: "⚠️ Error fetching response from AI API." });
  }
});

// Serve static files
app.use(express.static(__dirname));
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "images", "bot.png"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

import OpenAI from "openai";
import multer from "multer";
import XLSX from "xlsx";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is Working!.....");
});

/* 
🔥 IMPORTANT CHANGE: memory storage instead of disk
(Render safe)
*/
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Excel (FIXED)
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet);

    res.json(data);

  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    res.status(500).json({ error: "Excel processing failed" });
  }
});

// AI analysis
app.post("/analyze", async (req, res) => {
  try {
    const { data } = req.body;

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a supply chain analyst.",
        },
        {
          role: "user",
          content: `
Analyze this inventory data:

${JSON.stringify(data)}

Give short insights.
          `,
        },
      ],
    });

    res.json({
      answer: response.choices[0].message.content,
    });

  } catch (error) {
    console.log("AI ERROR:", error);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
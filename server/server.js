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



const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },

});

const upload = multer({ storage });



app.post(
  "/upload",
  upload.single("file"),

  (req, res) => {

    try {

      const workbook =
        XLSX.readFile(req.file.path);

      const sheetName =
        workbook.SheetNames[0];

      const sheet =
        workbook.Sheets[sheetName];

      const data =
        XLSX.utils.sheet_to_json(sheet);

      res.json(data);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        error: "Excel reading failed",
      });

    }

  }
);



app.post("/analyze", async (req, res) => {

  try {

    const { data } = req.body;

    const response =
      await client.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [

          {
            role: "system",
            content:
              "You are a supply chain analyst.",
          },

{
  role: "user",
  content: `
    Analyze this inventory data:

    ${JSON.stringify(data)}

    Give response in table format.

    Columns:
    Product | Risk Level | Recommendation

    Keep response short.
  `,
},

        ],
      });

    res.json({
      answer:
        response.choices[0].message.content,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "AI analysis failed",
    });

  }

});


// Start Server
app.listen(5000, () => {
  console.log("Server is Working!....");
});
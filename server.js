import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("AI Architectural Critic backend is running.");
});

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64 in request body."
      });
    }

    const prompt = `
You are an AI architectural critic.

Analyze the uploaded architectural image.

Return ONLY valid JSON with this exact structure:
{
  "calm": 0,
  "interest": 0,
  "admiration": 0,
  "enchantment": 0,
  "anxiety": 0,
  "summary": "short paragraph",
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ]
}

Rules:
- All emotion scores must be integers between 0 and 100.
- Base the analysis on architectural qualities only.
- Keep summary concise.
- Suggestions must be practical design improvements.
- Return raw JSON only.
`;

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt
            },
            {
              type: "input_image",
              image_url: imageBase64
            }
          ]
        }
      ]
    });

    const rawText = response.output_text;

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({
        error: "The AI response was not valid JSON.",
        raw: rawText
      });
    }

    res.json(parsed);
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({
      error: "Server error during analysis.",
      details: error?.message || "Unknown error"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
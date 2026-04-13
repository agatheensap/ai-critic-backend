import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

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

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY on server."
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
- Base the analysis on architectural qualities only:
  light, materiality, proportions, rhythm, openness, texture, color, scale, geometry, vegetation, human comfort, and visual tension.
- Keep summary concise.
- Suggestions must be practical design improvements.
- Return raw JSON only. No markdown. No explanation outside JSON.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: getMimeType(imageBase64),
                    data: getBase64Data(imageBase64)
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini API error",
        details: data?.error?.message || "Unknown Gemini error",
        raw: data
      });
    }

    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

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

function getMimeType(dataUrl) {
  const match = dataUrl.match(/^data:(.*?);base64,/);
  return match ? match[1] : "image/jpeg";
}

function getBase64Data(dataUrl) {
  return dataUrl.replace(/^data:.*;base64,/, "");
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
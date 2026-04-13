import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("AI Architectural Critic backend is running in demo mode.");
});

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64 in request body."
      });
    }

    const profile = pickProfileFromImage(imageBase64);
    const result = buildResponse(profile);

    res.json(result);
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({
      error: "Server error during demo analysis.",
      details: error?.message || "Unknown error"
    });
  }
});

function pickProfileFromImage(imageBase64) {
  const seed = createSeedFromString(imageBase64.slice(0, 500));

  const profiles = [
    "calm_minimal",
    "dramatic_monumental",
    "warm_human",
    "dense_tense",
    "poetic_enchanting"
  ];

  return profiles[seed % profiles.length];
}

function createSeedFromString(str) {
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    total += str.charCodeAt(i);
  }
  return total;
}

function vary(base, seed, amount = 6) {
  const offset = (seed % (amount * 2 + 1)) - amount;
  const value = base + offset;
  return Math.max(0, Math.min(100, value));
}

function buildResponse(profile) {
  const seed = Math.floor(Math.random() * 1000);

  switch (profile) {
    case "calm_minimal":
      return {
        calm: vary(82, seed, 8),
        interest: vary(58, seed + 1, 7),
        admiration: vary(67, seed + 2, 7),
        enchantment: vary(49, seed + 3, 6),
        anxiety: vary(14, seed + 4, 5),
        summary:
          "This design feels serene, controlled, and spatially clear. The composition suggests calm through openness, restraint, and visual simplicity.",
        suggestions: [
          "Add a stronger focal element to increase visual interest.",
          "Introduce warmer textures or materials to create more emotional connection.",
          "Layer natural light and shadow to enrich the spatial atmosphere."
        ]
      };

    case "dramatic_monumental":
      return {
        calm: vary(28, seed, 7),
        interest: vary(88, seed + 1, 6),
        admiration: vary(84, seed + 2, 6),
        enchantment: vary(66, seed + 3, 7),
        anxiety: vary(46, seed + 4, 7),
        summary:
          "This architecture creates intensity and grandeur through strong form, contrast, and monumentality. It is visually powerful, but may feel emotionally imposing.",
        suggestions: [
          "Soften transitions with warmer materials or softer lighting.",
          "Add human-scale details to improve comfort and accessibility.",
          "Introduce vegetation or softer edges to reduce emotional tension."
        ]
      };

    case "warm_human":
      return {
        calm: vary(71, seed, 7),
        interest: vary(64, seed + 1, 6),
        admiration: vary(69, seed + 2, 6),
        enchantment: vary(57, seed + 3, 6),
        anxiety: vary(18, seed + 4, 5),
        summary:
          "The design conveys warmth and usability, with a human-centered atmosphere. It feels accessible, pleasant, and emotionally balanced.",
        suggestions: [
          "Strengthen architectural rhythm to create more visual identity.",
          "Increase contrast in selected zones to raise admiration and focus.",
          "Use more dramatic lighting moments to enhance enchantment."
        ]
      };

    case "dense_tense":
      return {
        calm: vary(19, seed, 6),
        interest: vary(79, seed + 1, 7),
        admiration: vary(61, seed + 2, 7),
        enchantment: vary(42, seed + 3, 6),
        anxiety: vary(68, seed + 4, 8),
        summary:
          "This image suggests compression, complexity, and visual tension. The project is stimulating, but may feel crowded or psychologically intense.",
        suggestions: [
          "Open up circulation or visual breathing space where possible.",
          "Simplify material or formal complexity in key areas.",
          "Introduce clearer hierarchy and softer lighting to reduce anxiety."
        ]
      };

    case "poetic_enchanting":
      return {
        calm: vary(55, seed, 7),
        interest: vary(76, seed + 1, 6),
        admiration: vary(73, seed + 2, 6),
        enchantment: vary(89, seed + 3, 7),
        anxiety: vary(21, seed + 4, 5),
        summary:
          "This design evokes a poetic and immersive atmosphere. Its emotional strength comes from mood, mystery, and a strong sense of visual storytelling.",
        suggestions: [
          "Clarify circulation and functional readability to support the atmosphere.",
          "Reinforce one or two material themes for greater coherence.",
          "Balance the poetic mood with more human-scale cues where needed."
        ]
      };

    default:
      return {
        calm: 50,
        interest: 50,
        admiration: 50,
        enchantment: 50,
        anxiety: 20,
        summary:
          "This architectural proposal presents a balanced emotional reading with moderate calm, visual interest, and expressive potential.",
        suggestions: [
          "Develop a clearer emotional hierarchy in the design language.",
          "Use light, materiality, and scale more intentionally.",
          "Clarify the user experience through stronger spatial cues."
        ]
      };
  }
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
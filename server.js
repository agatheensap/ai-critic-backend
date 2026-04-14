import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("AI Architectural Critic backend is running in demo mode.");
});

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64, desiredOutcome } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64 in request body."
      });
    }

    const profile = pickProfileFromImage(imageBase64);
    const result = buildResponse(profile, desiredOutcome);

    res.json(result);
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({
      error: "Server error during demo analysis.",
      details: error?.message || "Unknown error"
    });
  }
});

app.post("/report", async (req, res) => {
  try {
    const {
      calm = 0,
      interest = 0,
      admiration = 0,
      enchantment = 0,
      anxiety = 0,
      summary = "",
      goalResponse = "",
      suggestions = [],
      desiredOutcome = ""
    } = req.body;

    const doc = new PDFDocument({
      size: "A4",
      margin: 50
    });

    const filename = "ai-architectural-critic-report.pdf";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc
      .fontSize(24)
      .fillColor("#111111")
      .text("AI Architectural Critic", { align: "left" });

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#666666")
      .text("Emotional Analysis Report", { align: "left" });

    doc.moveDown(1.2);

    doc
      .fontSize(14)
      .fillColor("#111111")
      .text("Desired Emotional Outcome");

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#333333")
      .text(
        desiredOutcome && desiredOutcome.trim().length > 0
          ? desiredOutcome
          : "No specific emotional goal provided."
      );

    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor("#111111")
      .text("Emotional Scores");

    doc.moveDown(0.5);

    const scores = [
      ["Calm", calm],
      ["Interest", interest],
      ["Admiration", admiration],
      ["Enchantment", enchantment],
      ["Anxiety", anxiety]
    ];

    scores.forEach(([label, value]) => {
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text(`${label}: ${value}%`);
    });

    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor("#111111")
      .text("Summary");

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#333333")
      .text(summary || "No summary available.", {
        align: "left",
        lineGap: 3
      });

    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor("#111111")
      .text("Goal-Oriented Interpretation");

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#333333")
      .text(goalResponse || "No goal-oriented interpretation available.", {
        align: "left",
        lineGap: 3
      });

    doc.moveDown(1);

    doc
      .fontSize(14)
      .fillColor("#111111")
      .text("Design Suggestions");

    doc.moveDown(0.4);

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      suggestions.forEach((item, index) => {
        doc
          .fontSize(11)
          .fillColor("#333333")
          .text(`${index + 1}. ${item}`, {
            align: "left",
            lineGap: 3
          });
        doc.moveDown(0.35);
      });
    } else {
      doc
        .fontSize(11)
        .fillColor("#333333")
        .text("No suggestions available.");
    }

    doc.moveDown(1.2);

    doc
      .fontSize(9)
      .fillColor("#777777")
      .text(
        "Prototype mode - report generated from the current demonstration version of AI Architectural Critic.",
        { align: "left" }
      );

    doc.end();
  } catch (error) {
    console.error("PDF report error:", error);
    res.status(500).json({
      error: "Server error during PDF generation.",
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

function buildResponse(profile, desiredOutcome = "") {
  const seed = Math.floor(Math.random() * 1000);
  const goal = parseDesiredOutcome(desiredOutcome);

  let response;

  switch (profile) {
    case "calm_minimal":
      response = {
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
      break;

    case "dramatic_monumental":
      response = {
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
      break;

    case "warm_human":
      response = {
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
      break;

    case "dense_tense":
      response = {
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
      break;

    case "poetic_enchanting":
      response = {
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
      break;

    default:
      response = {
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

  const goalResponse = buildGoalResponse(goal, response);
  const goalSuggestions = buildGoalSuggestions(goal);

  return {
    ...response,
    goalResponse,
    suggestions: [...response.suggestions, ...goalSuggestions]
  };
}

function parseDesiredOutcome(text = "") {
  const lower = text.toLowerCase();

  return {
    moreCalm: lower.includes("more calm") || lower.includes("plus de calme") || lower.includes("calmer"),
    lessAnxiety: lower.includes("less anxiety") || lower.includes("moins d'anxiété") || lower.includes("less stress"),
    moreAdmiration: lower.includes("more admiration") || lower.includes("plus d'admiration"),
    moreEnchantment: lower.includes("more enchantment") || lower.includes("plus d'enchantement") || lower.includes("more magic"),
    moreInterest: lower.includes("more interest") || lower.includes("plus d'intérêt") || lower.includes("more curiosity"),
    hasGoal: lower.trim().length > 0,
    raw: text
  };
}

function buildGoalResponse(goal, response) {
  if (!goal.hasGoal) {
    return "No specific emotional goal was provided. The suggestions above respond to the current emotional profile of the project.";
  }

  const messages = [];

  if (goal.moreCalm) {
    if (response.calm >= 65) {
      messages.push("The design already has a relatively calm base, so the next step is to reinforce softness, continuity, and visual breathing space.");
    } else {
      messages.push("To move toward more calm, the design should reduce visual tension and create a more legible, breathable spatial composition.");
    }
  }

  if (goal.lessAnxiety) {
    if (response.anxiety <= 25) {
      messages.push("Anxiety is already fairly low, so refinement should focus on preserving comfort while improving clarity and warmth.");
    } else {
      messages.push("To reduce anxiety, the project should soften contrast, simplify dense areas, and improve human-scale comfort cues.");
    }
  }

  if (goal.moreAdmiration) {
    messages.push("To increase admiration, the design needs a stronger sense of intention, hierarchy, and memorable architectural expression.");
  }

  if (goal.moreEnchantment) {
    messages.push("To create more enchantment, the project should develop atmosphere through light, material mood, and spatial storytelling.");
  }

  if (goal.moreInterest) {
    messages.push("To raise interest, the design should introduce richer focal points, rhythm changes, or moments of surprise.");
  }

  if (messages.length === 0) {
    return `The desired emotional outcome is "${goal.raw}". The platform suggests refining materiality, light, scale, and spatial hierarchy to better align the design with that intention.`;
  }

  return messages.join(" ");
}

function buildGoalSuggestions(goal) {
  const extra = [];

  if (goal.moreCalm) {
    extra.push("Use fewer competing visual elements and strengthen spatial clarity to increase calm.");
  }

  if (goal.lessAnxiety) {
    extra.push("Reduce harsh contrast and introduce more human-scale transitions to lower anxiety.");
  }

  if (goal.moreAdmiration) {
    extra.push("Create one or two signature architectural moments to increase admiration.");
  }

  if (goal.moreEnchantment) {
    extra.push("Use layered lighting, shadow, and material depth to increase enchantment.");
  }

  if (goal.moreInterest) {
    extra.push("Add contrast, rhythm shifts, or focal surprises to make the project more engaging.");
  }

  if (!goal.hasGoal) {
    return [];
  }

  if (extra.length === 0) {
    extra.push("Align the design language more clearly with the desired emotional direction stated by the user.");
  }

  return extra;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
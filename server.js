import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("AI Architectural Critic backend is running in advanced visual-analysis demo mode.");
});

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64, desiredOutcome, visualFeatures } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64 in request body."
      });
    }

    const features = sanitizeFeatures(visualFeatures);
    const result = buildResponseFromFeatures(features, desiredOutcome);

    res.json({
      ...result,
      visualFeatures: features
    });
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({
      error: "Server error during visual demo analysis.",
      details: error?.message || "Unknown error"
    });
  }
});

app.post("/report", async (req, res) => {
  try {
    const {
      calm = 0,
      joy = 0,
      inspiration = 0,
      security = 0,
      comfort = 0,
      enchantment = 0,
      serenity = 0,
      admiration = 0,
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

    doc.fontSize(24).fillColor("#111111").text("AI Architectural Critic");
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#666666").text("Emotional Analysis Report");

    doc.moveDown(1.2);
    doc.fontSize(14).fillColor("#111111").text("Desired Emotional Outcome");
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .fillColor("#333333")
      .text(
        desiredOutcome && desiredOutcome.trim().length > 0
          ? desiredOutcome
          : "No specific emotional goal provided."
      );

    doc.moveDown(1);
    doc.fontSize(14).fillColor("#111111").text("Emotional Scores");
    doc.moveDown(0.5);

    const scores = [
      ["Calm", calm],
      ["Joy", joy],
      ["Inspiration", inspiration],
      ["Security", security],
      ["Comfort", comfort],
      ["Enchantment", enchantment],
      ["Serenity", serenity],
      ["Admiration", admiration]
    ];

    scores.forEach(([label, value]) => {
      doc.fontSize(11).fillColor("#333333").text(`${label}: ${value}%`);
    });

    doc.moveDown(1);
    doc.fontSize(14).fillColor("#111111").text("Summary");
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#333333").text(summary || "No summary available.", {
      align: "left",
      lineGap: 3
    });

    doc.moveDown(1);
    doc.fontSize(14).fillColor("#111111").text("Goal-Oriented Interpretation");
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .fillColor("#333333")
      .text(goalResponse || "No goal-oriented interpretation available.", {
        align: "left",
        lineGap: 3
      });

    doc.moveDown(1);
    doc.fontSize(14).fillColor("#111111").text("Design Suggestions");
    doc.moveDown(0.4);

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      suggestions.forEach((item, index) => {
        doc.fontSize(11).fillColor("#333333").text(`${index + 1}. ${item}`, {
          align: "left",
          lineGap: 3
        });
        doc.moveDown(0.35);
      });
    } else {
      doc.fontSize(11).fillColor("#333333").text("No suggestions available.");
    }

    doc.moveDown(1.2);
    doc
      .fontSize(9)
      .fillColor("#777777")
      .text(
        "Prototype mode - emotional analysis is based on simple visual feature extraction and concept demonstration logic."
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

function sanitizeFeatures(features = {}) {
  return {
    brightness: clamp(features.brightness ?? 50, 0, 100),
    contrast: clamp(features.contrast ?? 50, 0, 100),
    warmth: clamp(features.warmth ?? 50, 0, 100),
    saturation: clamp(features.saturation ?? 50, 0, 100)
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function buildResponseFromFeatures(features, desiredOutcome = "") {
  const { brightness, contrast, warmth, saturation } = features;

  const calm = clamp(
    0.35 * brightness +
    0.30 * (100 - contrast) +
    0.20 * warmth +
    0.15 * (100 - saturation),
    0, 100
  );

  const joy = clamp(
    0.30 * brightness +
    0.30 * warmth +
    0.25 * saturation +
    0.15 * (100 - contrast),
    0, 100
  );

  const inspiration = clamp(
    0.20 * brightness +
    0.35 * contrast +
    0.20 * saturation +
    0.25 * warmth,
    0, 100
  );

  const security = clamp(
    0.30 * brightness +
    0.15 * warmth +
    0.35 * (100 - contrast) +
    0.20 * (100 - saturation),
    0, 100
  );

  const comfort = clamp(
    0.25 * brightness +
    0.30 * warmth +
    0.25 * (100 - contrast) +
    0.20 * (100 - saturation),
    0, 100
  );

  const enchantment = clamp(
    0.15 * brightness +
    0.30 * contrast +
    0.25 * saturation +
    0.30 * warmth,
    0, 100
  );

  const serenity = clamp(
    0.40 * brightness +
    0.35 * (100 - contrast) +
    0.15 * warmth +
    0.10 * (100 - saturation),
    0, 100
  );

  const admiration = clamp(
    0.20 * brightness +
    0.35 * contrast +
    0.20 * warmth +
    0.25 * saturation,
    0, 100
  );

  const emotions = {
    calm,
    joy,
    inspiration,
    security,
    comfort,
    enchantment,
    serenity,
    admiration
  };

  return {
    ...emotions,
    summary: buildSummary(features, emotions),
    goalResponse: buildGoalResponse(desiredOutcome, emotions),
    suggestions: buildSuggestions(features, emotions, desiredOutcome)
  };
}

function buildSummary(features, emotions) {
  const topEmotions = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  const brightnessText =
    features.brightness >= 70 ? "high light presence"
    : features.brightness <= 35 ? "a relatively dark atmosphere"
    : "a moderate light balance";

  const contrastText =
    features.contrast >= 70 ? "strong contrast and visual intensity"
    : features.contrast <= 35 ? "soft contrast and visual continuity"
    : "a measured contrast level";

  const warmthText =
    features.warmth >= 60 ? "a warm tonal atmosphere"
    : features.warmth <= 40 ? "a cooler chromatic feeling"
    : "a relatively neutral tonal balance";

  const saturationText =
    features.saturation >= 65 ? "a vivid visual expression"
    : features.saturation <= 35 ? "a restrained palette"
    : "a moderate level of color intensity";

  return `This image suggests ${brightnessText}, ${contrastText}, ${warmthText}, and ${saturationText}. As a result, the strongest emotional impressions are ${joinNatural(topEmotions)}.`;
}

function buildGoalResponse(desiredOutcome = "", emotions) {
  const goal = parseDesiredOutcome(desiredOutcome);

  if (!goal.hasGoal) {
    return "No specific emotional goal was provided. The recommendations therefore respond mainly to the current emotional profile of the project.";
  }

  const messages = [];

  if (goal.moreCalm) {
    messages.push(
      emotions.calm >= 70
        ? "The project already reads as relatively calm, so the next step is to preserve clarity while deepening refinement."
        : "To increase calm, the project should soften contrast, reduce visual competition, and strengthen spatial continuity."
    );
  }

  if (goal.moreJoy) {
    messages.push(
      "To increase joy, the design should feel brighter, warmer, and more open to uplifting spatial moments."
    );
  }

  if (goal.moreInspiration) {
    messages.push(
      "To increase inspiration, the project should create stronger moments of architectural ambition, contrast, and memorable form."
    );
  }

  if (goal.moreSecurity) {
    messages.push(
      "To reinforce security, the design should become more legible, stable, and visually reassuring."
    );
  }

  if (goal.moreComfort) {
    messages.push(
      "To create more comfort, the atmosphere should feel warmer, softer, and more human-centered."
    );
  }

  if (goal.moreEnchantment) {
    messages.push(
      "To increase enchantment, the project should develop more atmosphere, depth, and emotional staging."
    );
  }

  if (goal.moreSerenity) {
    messages.push(
      "To increase serenity, the project should reduce visual friction and create a quieter overall reading."
    );
  }

  if (goal.moreAdmiration) {
    messages.push(
      "To increase admiration, the architecture should feel more resolved, more distinctive, and more compositionally intentional."
    );
  }

  if (messages.length === 0) {
    return `The desired emotional outcome is "${goal.raw}". The design should align its light, materiality, contrast, and tonal atmosphere more clearly with that direction.`;
  }

  return messages.join(" ");
}

function buildSuggestions(features, emotions, desiredOutcome = "") {
  const suggestions = [];
  const goal = parseDesiredOutcome(desiredOutcome);

  if (features.brightness < 40) {
    suggestions.push("Increase daylight presence or perceived brightness to improve openness and emotional clarity.");
  }
  if (features.brightness > 75) {
    suggestions.push("Preserve the luminous quality while introducing selective depth to avoid emotional flatness.");
  }

  if (features.contrast > 70) {
    suggestions.push("Soften abrupt contrasts in key zones to create a more balanced and comfortable reading.");
  }
  if (features.contrast < 35) {
    suggestions.push("Introduce stronger focal contrast to give the project more visual hierarchy and memorability.");
  }

  if (features.warmth < 40) {
    suggestions.push("Introduce warmer materials or tonal accents to create more comfort, joy, and emotional accessibility.");
  }
  if (features.warmth > 70) {
    suggestions.push("Balance the warm tonal identity with clearer compositional anchors to maintain refinement.");
  }

  if (features.saturation < 35) {
    suggestions.push("A restrained palette is effective, but one or two richer accents could improve inspiration and admiration.");
  }
  if (features.saturation > 70) {
    suggestions.push("Reduce excess chromatic intensity in selected zones to preserve calm and serenity.");
  }

  const weakestEmotion = Object.entries(emotions).sort((a, b) => a[1] - b[1])[0][0];

  const weakestSuggestions = {
    calm: "Reduce visual competition and increase continuity across the spatial composition.",
    joy: "Introduce brighter or warmer experiential moments to make the atmosphere more uplifting.",
    inspiration: "Create one strong architectural gesture that elevates the conceptual ambition of the project.",
    security: "Clarify hierarchy and thresholds so the project feels more stable and reassuring.",
    comfort: "Use softer textures, warmer tones, and more human-scale transitions to improve comfort.",
    enchantment: "Stage more immersive moments through shadow, reflection, depth, or material atmosphere.",
    serenity: "Simplify the overall visual field to produce a quieter emotional experience.",
    admiration: "Refine proportion, composition, and focal hierarchy so the architecture feels more intentional."
  };

  suggestions.push(weakestSuggestions[weakestEmotion]);

  if (goal.moreCalm) suggestions.push("Strengthen visual breathing space and reduce unnecessary contrast to support calm.");
  if (goal.moreJoy) suggestions.push("Use warmer, brighter experiential cues to support a more joyful atmosphere.");
  if (goal.moreInspiration) suggestions.push("Increase architectural boldness through stronger contrast, rhythm, or signature form.");
  if (goal.moreSecurity) suggestions.push("Make circulation, hierarchy, and enclosure feel clearer and more reliable.");
  if (goal.moreComfort) suggestions.push("Introduce tactile softness and a more human-centered material language.");
  if (goal.moreEnchantment) suggestions.push("Use layered lighting, mystery, and material depth to increase enchantment.");
  if (goal.moreSerenity) suggestions.push("Reduce visual noise and create a more controlled, contemplative atmosphere.");
  if (goal.moreAdmiration) suggestions.push("Develop one or two memorable design moves that elevate architectural presence.");

  return uniqueList(suggestions).slice(0, 6);
}

function parseDesiredOutcome(text = "") {
  const lower = text.toLowerCase();

  return {
    moreCalm: lower.includes("more calm") || lower.includes("plus de calme") || lower.includes("calmer"),
    moreJoy: lower.includes("more joy") || lower.includes("plus de joie") || lower.includes("more joyful"),
    moreInspiration: lower.includes("more inspiration") || lower.includes("plus d'inspiration") || lower.includes("more inspiring"),
    moreSecurity: lower.includes("more security") || lower.includes("plus de sécurité") || lower.includes("safer"),
    moreComfort: lower.includes("more comfort") || lower.includes("plus de confort") || lower.includes("more comfortable"),
    moreEnchantment: lower.includes("more enchantment") || lower.includes("plus d'enchantement") || lower.includes("more poetic"),
    moreSerenity: lower.includes("more serenity") || lower.includes("plus de sérénité") || lower.includes("more serene"),
    moreAdmiration: lower.includes("more admiration") || lower.includes("plus d'admiration") || lower.includes("more impressive"),
    hasGoal: lower.trim().length > 0,
    raw: text
  };
}

function uniqueList(items) {
  return [...new Set(items)];
}

function joinNatural(items) {
  const pretty = items.map((item) => item.charAt(0).toUpperCase() + item.slice(1));
  if (pretty.length === 1) return pretty[0];
  if (pretty.length === 2) return `${pretty[0]} and ${pretty[1]}`;
  return `${pretty.slice(0, -1).join(", ")}, and ${pretty[pretty.length - 1]}`;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
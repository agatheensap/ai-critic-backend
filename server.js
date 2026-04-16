import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("AI Architectural Critic backend is running with render, plan, and section modes.");
});

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64, imageType = "render", desiredOutcome, visualFeatures } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64 in request body."
      });
    }

    const features = sanitizeFeatures(visualFeatures);

    let result;
    if (imageType === "plan") {
      result = buildPlanResponse(features, desiredOutcome);
    } else if (imageType === "section") {
      result = buildSectionResponse(features, desiredOutcome);
    } else {
      result = buildRenderResponse(features, desiredOutcome);
    }

    res.json({
      ...result,
      visualFeatures: features,
      imageType
    });
  } catch (error) {
    console.error("Analyze error:", error);
    res.status(500).json({
      error: "Server error during analysis.",
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
      desiredOutcome = "",
      imageType = "render"
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
    doc.fontSize(14).fillColor("#111111").text("Image Type");
    doc.moveDown(0.3);

    const imageTypeLabel =
      imageType === "plan"
        ? "Plan"
        : imageType === "section"
          ? "Section / Elevation"
          : "Render / Photo";

    doc.fontSize(11).fillColor("#333333").text(imageTypeLabel);

    doc.moveDown(1);
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
        "Prototype mode - emotional analysis is based on simple visual feature extraction and separate interpretation modes for renders, plans, and sections/elevations."
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

function buildRenderResponse(features, desiredOutcome = "") {
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

  const emotions = { calm, joy, inspiration, security, comfort, enchantment, serenity, admiration };

  return {
    ...emotions,
    summary: buildRenderSummary(emotions),
    goalResponse: buildGoalResponse(desiredOutcome, emotions),
    suggestions: buildRenderSuggestions(features, emotions, desiredOutcome)
  };
}

function buildPlanResponse(features, desiredOutcome = "") {
  const { brightness, contrast, warmth, saturation } = features;

  const calm = clamp(
    0.30 * brightness +
    0.40 * (100 - contrast) +
    0.10 * warmth +
    0.20 * (100 - saturation),
    0, 100
  );

  const joy = clamp(
    0.15 * brightness +
    0.15 * warmth +
    0.10 * saturation +
    0.20 * (100 - contrast) +
    20,
    0, 100
  );

  const inspiration = clamp(
    0.20 * brightness +
    0.40 * contrast +
    0.10 * warmth +
    0.10 * saturation +
    12,
    0, 100
  );

  const security = clamp(
    0.35 * brightness +
    0.35 * (100 - contrast) +
    0.10 * warmth +
    0.20 * (100 - saturation),
    0, 100
  );

  const comfort = clamp(
    0.25 * brightness +
    0.35 * (100 - contrast) +
    0.10 * warmth +
    0.30 * (100 - saturation),
    0, 100
  );

  const enchantment = clamp(
    0.10 * brightness +
    0.25 * contrast +
    0.05 * warmth +
    0.05 * saturation +
    18,
    0, 100
  );

  const serenity = clamp(
    0.40 * brightness +
    0.40 * (100 - contrast) +
    0.05 * warmth +
    0.15 * (100 - saturation),
    0, 100
  );

  const admiration = clamp(
    0.20 * brightness +
    0.40 * contrast +
    0.05 * warmth +
    0.05 * saturation +
    28,
    0, 100
  );

  const emotions = { calm, joy, inspiration, security, comfort, enchantment, serenity, admiration };

  return {
    ...emotions,
    summary: buildPlanSummary(features, emotions),
    goalResponse: buildGoalResponse(desiredOutcome, emotions),
    suggestions: buildPlanSuggestions(features, emotions, desiredOutcome)
  };
}

function buildSectionResponse(features, desiredOutcome = "") {
  const { brightness, contrast, warmth, saturation } = features;

  const calm = clamp(
    0.28 * brightness +
    0.22 * (100 - contrast) +
    0.10 * warmth +
    0.10 * (100 - saturation) +
    10,
    0, 100
  );

  const joy = clamp(
    0.18 * brightness +
    0.20 * warmth +
    0.12 * saturation +
    12,
    0, 100
  );

  const inspiration = clamp(
    0.18 * brightness +
    0.38 * contrast +
    0.08 * warmth +
    0.08 * saturation +
    22,
    0, 100
  );

  const security = clamp(
    0.25 * brightness +
    0.28 * (100 - contrast) +
    0.08 * warmth +
    0.10 * (100 - saturation) +
    18,
    0, 100
  );

  const comfort = clamp(
    0.18 * brightness +
    0.20 * warmth +
    0.20 * (100 - contrast) +
    0.10 * (100 - saturation) +
    18,
    0, 100
  );

  const enchantment = clamp(
    0.12 * brightness +
    0.30 * contrast +
    0.10 * warmth +
    0.08 * saturation +
    22,
    0, 100
  );

  const serenity = clamp(
    0.28 * brightness +
    0.25 * (100 - contrast) +
    0.06 * warmth +
    0.08 * (100 - saturation) +
    14,
    0, 100
  );

  const admiration = clamp(
    0.18 * brightness +
    0.42 * contrast +
    0.06 * warmth +
    0.06 * saturation +
    24,
    0, 100
  );

  const emotions = { calm, joy, inspiration, security, comfort, enchantment, serenity, admiration };

  return {
    ...emotions,
    summary: buildSectionSummary(features, emotions),
    goalResponse: buildGoalResponse(desiredOutcome, emotions),
    suggestions: buildSectionSuggestions(features, emotions, desiredOutcome)
  };
}

function buildRenderSummary(emotions) {
  const topEmotions = top3(emotions);
  return `This render or photograph is interpreted as an atmospheric image shaped by light, contrast, warmth, and color intensity. The strongest emotional impressions are ${joinNatural(topEmotions)}.`;
}

function buildPlanSummary(features, emotions) {
  const topEmotions = top3(emotions);
  const clarityText =
    features.contrast < 35 ? "a soft and highly legible graphic field"
    : features.contrast > 70 ? "a dense and strongly contrasted graphic composition"
    : "a relatively balanced level of graphic definition";

  return `This plan is interpreted primarily as a spatial diagram rather than an atmospheric scene. It suggests ${clarityText}, and the strongest emotional impressions are ${joinNatural(topEmotions)}.`;
}

function buildSectionSummary(features, emotions) {
  const topEmotions = top3(emotions);
  const verticalText =
    features.contrast > 65
      ? "a strong sense of section depth, hierarchy, and structural presence"
      : "a relatively measured sectional reading with controlled vertical rhythm";

  return `This section or elevation is interpreted as a composition of structure, proportion, rhythm, and vertical relationships. It suggests ${verticalText}, and the strongest emotional impressions are ${joinNatural(topEmotions)}.`;
}

function buildGoalResponse(desiredOutcome = "", emotions) {
  const goal = parseDesiredOutcome(desiredOutcome);

  if (!goal.hasGoal) {
    return "No specific emotional goal was provided. The recommendations therefore respond mainly to the current emotional profile of the project.";
  }

  const messages = [];

  if (goal.moreCalm) messages.push(emotions.calm >= 70 ? "The project already reads as relatively calm, so refinement should preserve clarity while deepening control." : "To increase calm, the design should reduce visual friction and simplify competing signals.");
  if (goal.moreJoy) messages.push("To increase joy, the design should feel brighter, warmer, and more open to positive experiential moments.");
  if (goal.moreInspiration) messages.push("To increase inspiration, the design should strengthen conceptual boldness, contrast, or memorable spatial ideas.");
  if (goal.moreSecurity) messages.push("To reinforce security, the design should become more legible, stable, and reassuring.");
  if (goal.moreComfort) messages.push("To create more comfort, the atmosphere should feel softer, clearer, and more human-centered.");
  if (goal.moreEnchantment) messages.push("To increase enchantment, the project should develop more atmosphere, depth, and emotional staging.");
  if (goal.moreSerenity) messages.push("To increase serenity, the project should reduce visual noise and create a quieter overall reading.");
  if (goal.moreAdmiration) messages.push("To increase admiration, the architecture should feel more resolved, more distinctive, and more compositionally intentional.");

  if (messages.length === 0) {
    return `The desired emotional outcome is "${goal.raw}". The design should align its visual language more clearly with that intention.`;
  }

  return messages.join(" ");
}

function buildRenderSuggestions(features, emotions, desiredOutcome = "") {
  const suggestions = [];
  const goal = parseDesiredOutcome(desiredOutcome);

  if (features.brightness < 40) suggestions.push("Increase daylight presence or perceived brightness to improve openness and emotional clarity.");
  if (features.brightness > 75) suggestions.push("Preserve the luminous quality while introducing selective depth to avoid emotional flatness.");
  if (features.contrast > 70) suggestions.push("Soften abrupt contrasts in key zones to create a more balanced and comfortable reading.");
  if (features.contrast < 35) suggestions.push("Introduce stronger focal contrast to give the project more visual hierarchy and memorability.");
  if (features.warmth < 40) suggestions.push("Introduce warmer materials or tonal accents to create more comfort, joy, and emotional accessibility.");
  if (features.warmth > 70) suggestions.push("Balance the warm tonal identity with clearer compositional anchors to maintain refinement.");
  if (features.saturation < 35) suggestions.push("A restrained palette is effective, but one or two richer accents could improve inspiration and admiration.");
  if (features.saturation > 70) suggestions.push("Reduce excess chromatic intensity in selected zones to preserve calm and serenity.");

  suggestions.push(weakestSuggestion(weakestEmotion(emotions)));
  addGoalSuggestions(suggestions, goal);

  return uniqueList(suggestions).slice(0, 6);
}

function buildPlanSuggestions(features, emotions, desiredOutcome = "") {
  const suggestions = [];
  const goal = parseDesiredOutcome(desiredOutcome);

  if (features.contrast > 70) suggestions.push("Reduce excessive graphic density or line competition to improve the readability of the plan.");
  if (features.contrast < 30) suggestions.push("Introduce clearer hierarchy between major and minor elements so the plan reads more decisively.");
  if (features.brightness < 45) suggestions.push("Lighten the graphic composition or clarify empty space to make the plan feel more open and understandable.");
  if (features.saturation > 20) suggestions.push("Use color more selectively so the plan remains clear and disciplined.");
  if (features.saturation < 10) suggestions.push("A fully neutral plan is clean, but small tonal distinctions could improve hierarchy and comprehension.");

  suggestions.push("Clarify the relationship between circulation, rooms, and thresholds so the plan feels more intentional.");
  suggestions.push("Strengthen the graphic hierarchy between structure, enclosure, and movement.");
  suggestions.push(weakestSuggestion(weakestEmotion(emotions)));
  addGoalSuggestions(suggestions, goal);

  return uniqueList(suggestions).slice(0, 6);
}

function buildSectionSuggestions(features, emotions, desiredOutcome = "") {
  const suggestions = [];
  const goal = parseDesiredOutcome(desiredOutcome);

  if (features.contrast > 70) suggestions.push("Reduce line competition and strengthen hierarchy so the section or elevation reads more clearly.");
  if (features.contrast < 30) suggestions.push("Introduce stronger graphic hierarchy to distinguish primary structure from secondary information.");
  if (features.brightness < 45) suggestions.push("Clarify poche, cut elements, or tonal depth so the sectional reading becomes more legible.");
  if (features.saturation > 20) suggestions.push("Use color sparingly so vertical relationships and structural rhythm remain dominant.");

  suggestions.push("Strengthen the relationship between structure, envelope, and spatial sequence so the drawing feels more resolved.");
  suggestions.push("Use hierarchy to distinguish what is cut, what is seen beyond, and what defines the main compositional rhythm.");
  suggestions.push("Clarify the vertical order of spaces so the section or elevation communicates proportion more confidently.");
  suggestions.push(weakestSuggestion(weakestEmotion(emotions)));
  addGoalSuggestions(suggestions, goal);

  return uniqueList(suggestions).slice(0, 6);
}

function weakestEmotion(emotions) {
  return Object.entries(emotions).sort((a, b) => a[1] - b[1])[0][0];
}

function weakestSuggestion(name) {
  const map = {
    calm: "Reduce visual competition and improve continuity across the composition.",
    joy: "Introduce lighter, more uplifting spatial cues or a more welcoming overall reading.",
    inspiration: "Strengthen the conceptual gesture or architectural idea so the design feels more ambitious.",
    security: "Clarify organization and hierarchy so the project feels more stable and reassuring.",
    comfort: "Use softer transitions and more human-centered cues to improve comfort.",
    enchantment: "Develop more atmosphere, depth, or memorable moments to increase enchantment.",
    serenity: "Simplify the overall visual field to produce a quieter emotional reading.",
    admiration: "Refine proportion, hierarchy, or signature moments so the design feels more intentional."
  };
  return map[name];
}

function addGoalSuggestions(suggestions, goal) {
  if (goal.moreCalm) suggestions.push("Strengthen visual breathing space and reduce unnecessary contrast to support calm.");
  if (goal.moreJoy) suggestions.push("Use brighter, warmer experiential cues to support a more joyful atmosphere.");
  if (goal.moreInspiration) suggestions.push("Increase conceptual boldness through stronger hierarchy, rhythm, or signature form.");
  if (goal.moreSecurity) suggestions.push("Make circulation, hierarchy, and enclosure feel clearer and more reliable.");
  if (goal.moreComfort) suggestions.push("Introduce softer transitions and a more human-centered language.");
  if (goal.moreEnchantment) suggestions.push("Use layered depth, atmosphere, and memorable moments to increase enchantment.");
  if (goal.moreSerenity) suggestions.push("Reduce visual noise and create a more controlled, contemplative reading.");
  if (goal.moreAdmiration) suggestions.push("Develop one or two memorable moves that elevate the architectural presence.");
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

function top3(emotions) {
  return Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
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
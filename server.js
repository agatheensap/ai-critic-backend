import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
  res.send("AI Architectural Critic backend is running in render analysis mode.");
});

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64, desiredOutcome = "", visualFeatures } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64 in request body."
      });
    }

    const features = sanitizeFeatures(visualFeatures);
    const result = buildRenderResponse(features, desiredOutcome);

    res.json({
      ...result,
      visualFeatures: features,
      desiredOutcome,
      imageType: "render"
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
      enchantment = 0,
      admiration = 0,
      summary = "",
      goalResponse = "",
      suggestions = [],
      desiredOutcome = "",
      individualAnalyses = [],
      images = [],
      reportImages = []
    } = req.body;
    const imageType = "render";
    const desiredOutcomeText = typeof desiredOutcome === "string" ? desiredOutcome.trim() : "";
    const reportGoalResponse = getGoalResponseOrFallback(goalResponse, desiredOutcomeText, {
      calm,
      joy,
      inspiration,
      security,
      enchantment,
      admiration
    });

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
    doc.fontSize(14).fillColor("#111111").text("Project Overview");
    doc.moveDown(0.3);

    const imageTypeLabel =
      imageType === "plan"
        ? "Plans"
        : imageType === "section"
          ? "Sections / Elevations"
          : "Renders / Photos";

    const embeddedImages = normalizeReportImages(reportImages.length > 0 ? reportImages : images);
    const numImages = individualAnalyses.length || embeddedImages.length || 1;
    doc.fontSize(11).fillColor("#333333").text(`${numImages} ${imageTypeLabel} analyzed`);

    drawProjectImagesSection(doc, embeddedImages);

    doc.moveDown(1);
    doc.fontSize(14).fillColor("#111111").text("Desired Emotional Outcome");
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .fillColor("#333333")
      .text(
        desiredOutcomeText.length > 0
          ? desiredOutcomeText
          : "No specific emotional goal provided."
      );

    doc.moveDown(1);
    doc.fontSize(14).fillColor("#111111").text("Aggregated Emotional Scores");
    doc.moveDown(0.5);

    const scores = [
      ["Calm", calm],
      ["Joy", joy],
      ["Inspiration", inspiration],
      ["Security", security],
      ["Enchantment", enchantment],
      ["Admiration", admiration]
    ];

    scores.forEach(([label, value]) => {
      doc.fontSize(11).fillColor("#333333").text(`${label}: ${value}%`);
    });

    doc.moveDown(1);
    doc.fontSize(14).fillColor("#111111").text("Project Summary");
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
      .text(reportGoalResponse, {
        align: "left",
        lineGap: 3
      });

    // Individual image analyses
    if (individualAnalyses.length > 1) {
      doc.moveDown(1);
      doc.fontSize(14).fillColor("#111111").text("Individual Image Analyses");
      doc.moveDown(0.5);

      individualAnalyses.forEach((analysis, index) => {
        const imageName =
          analysis.imageName ||
          embeddedImages[index]?.name ||
          images[index]?.file?.name ||
          images[index]?.name ||
          `Image ${index + 1}`;
        doc.fontSize(12).fillColor("#111111").text(`${imageName}`, { underline: true });
        doc.moveDown(0.3);

        const imgScores = [
          ["Calm", analysis.calm],
          ["Joy", analysis.joy],
          ["Inspiration", analysis.inspiration],
          ["Security", analysis.security],
          ["Enchantment", analysis.enchantment],
          ["Admiration", analysis.admiration]
        ];

        imgScores.forEach(([label, value]) => {
          doc.fontSize(10).fillColor("#555555").text(`${label}: ${value}%`);
        });

        doc.moveDown(0.5);
      });
    }

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
        "Prototype mode - emotional analysis is based on simple visual feature extraction for rendered and photographic architectural images."
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

function getGoalResponseOrFallback(goalResponse, desiredOutcome, emotions) {
  if (typeof goalResponse === "string" && goalResponse.trim().length > 0) {
    return goalResponse.trim();
  }

  if (typeof desiredOutcome === "string" && desiredOutcome.trim().length > 0) {
    return buildGoalResponse(desiredOutcome, emotions);
  }

  return "No specific emotional goal was provided. The recommendations therefore respond mainly to the current emotional profile of the project.";
}

function normalizeReportImages(images = []) {
  if (!Array.isArray(images)) return [];

  return images
    .map((image, index) => {
      const dataUrl = image?.base64 || image?.imageBase64 || image?.dataUrl || "";
      const match = /^data:image\/(png|jpe?g);base64,([a-z0-9+/=\s]+)$/i.exec(dataUrl);

      if (!match) return null;

      return {
        name: image?.name || image?.file?.name || `Image ${index + 1}`,
        buffer: Buffer.from(match[2].replace(/\s/g, ""), "base64")
      };
    })
    .filter(Boolean);
}

function drawProjectImagesSection(doc, images) {
  if (images.length === 0) return;

  const topSpacing = 28;
  const headingHeight = 24;
  const introSpacing = 12;
  const sectionStartHeight = topSpacing + headingHeight + introSpacing;

  if (!hasVerticalSpace(doc, sectionStartHeight + 180)) {
    doc.addPage();
  } else {
    doc.moveDown(1.4);
  }

  doc.fontSize(14).fillColor("#111111").text("Project Images");
  doc.moveDown(0.7);

  images.forEach((image, index) => {
    drawProjectImage(doc, image, index);
  });

  doc.moveDown(0.8);
}

function drawProjectImage(doc, image, index) {
  const margins = doc.page.margins;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - margins.left - margins.right;
  const contentBottom = pageHeight - margins.bottom;
  const captionHeight = 16;
  const imageGap = 8;
  const afterImageGap = 22;
  const maxImageHeight = Math.min(360, pageHeight - margins.top - margins.bottom - captionHeight - imageGap - afterImageGap);

  let imageInfo;
  try {
    imageInfo = doc.openImage(image.buffer);
  } catch (error) {
    ensureVerticalSpace(doc, captionHeight + 28);
    doc.fontSize(10).fillColor("#555555").text(image.name || `Image ${index + 1}`);
    doc.moveDown(0.25);
    doc.fontSize(10).fillColor("#777777").text("Image could not be embedded in the PDF report.");
    doc.moveDown(0.8);
    return;
  }

  const fitted = fitDimensions(imageInfo.width, imageInfo.height, contentWidth, maxImageHeight);
  const blockHeight = captionHeight + imageGap + fitted.height + afterImageGap;

  ensureVerticalSpace(doc, blockHeight);

  doc.fontSize(10).fillColor("#555555").text(image.name || `Image ${index + 1}`, {
    width: contentWidth,
    ellipsis: true
  });

  const imageX = margins.left + (contentWidth - fitted.width) / 2;
  const imageY = doc.y + imageGap;

  doc.image(image.buffer, imageX, imageY, {
    width: fitted.width,
    height: fitted.height
  });

  doc.x = margins.left;
  doc.y = Math.min(imageY + fitted.height + afterImageGap, contentBottom);
}

function fitDimensions(width, height, maxWidth, maxHeight) {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: width * scale,
    height: height * scale
  };
}

function ensureVerticalSpace(doc, requiredHeight) {
  if (!hasVerticalSpace(doc, requiredHeight)) {
    doc.addPage();
  }
}

function hasVerticalSpace(doc, requiredHeight) {
  const bottom = doc.page.height - doc.page.margins.bottom;
  return doc.y + requiredHeight <= bottom;
}

function sanitizeFeatures(features = {}) {
  return {
    brightness: clamp(features.brightness ?? 50, 0, 100),
    contrast: clamp(features.contrast ?? 50, 0, 100),
    warmth: clamp(features.warmth ?? 50, 0, 100),
    saturation: clamp(features.saturation ?? 50, 0, 100),
    hue: clamp(features.hue ?? 50, 0, 100),
    lightness: clamp(features.lightness ?? 50, 0, 100),
    sharpness: clamp(features.sharpness ?? 50, 0, 100),
    entropy: clamp(features.entropy ?? 50, 0, 100),
    uniqueColors: clamp(features.uniqueColors ?? 50, 0, 100)
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function hueProximity(hue, targetAngle, width = 40) {
  const angle = (hue % 100) * 3.6;
  const diff = Math.min(Math.abs(angle - targetAngle), 360 - Math.abs(angle - targetAngle));
  return Math.max(0, 1 - diff / width);
}

function buildRenderResponse(features, desiredOutcome = "") {
  const { brightness, contrast, warmth, saturation, hue, lightness, sharpness, entropy, uniqueColors } = features;
  const yellowBoost = hueProximity(hue, 50, 45) * 100;

  const calm = clamp(
    0.22 * brightness +
    0.24 * (100 - contrast) +
    0.12 * warmth +
    0.12 * (100 - saturation) +
    0.12 * lightness +
    0.10 * (100 - entropy) +
    0.08 * (100 - sharpness) +
    0.05 * (100 - uniqueColors),
    0, 100
  );

  const joy = clamp(
    0.18 * brightness +
    0.22 * warmth +
    0.14 * saturation +
    0.08 * lightness +
    0.10 * entropy +
    0.08 * uniqueColors +
    0.10 * yellowBoost +
    0.10 * (100 - contrast),
    0, 100
  );

  const inspiration = clamp(
    0.14 * brightness +
    0.26 * contrast +
    0.12 * saturation +
    0.12 * warmth +
    0.10 * sharpness +
    0.12 * entropy +
    0.10 * uniqueColors,
    0, 100
  );

  const security = clamp(
    0.18 * brightness +
    0.08 * warmth +
    0.22 * (100 - contrast) +
    0.14 * (100 - saturation) +
    0.10 * lightness +
    0.12 * (100 - entropy) +
    0.08 * (100 - sharpness) +
    0.08 * (100 - uniqueColors),
    0, 100
  );

  const enchantment = clamp(
    0.12 * brightness +
    0.24 * contrast +
    0.18 * saturation +
    0.16 * entropy +
    0.12 * uniqueColors +
    0.10 * sharpness +
    0.08 * warmth,
    0, 100
  );

  const admiration = clamp(
    0.16 * brightness +
    0.26 * contrast +
    0.12 * saturation +
    0.12 * sharpness +
    0.12 * entropy +
    0.10 * uniqueColors +
    0.10 * warmth,
    0, 100
  );

  const emotions = { calm, joy, inspiration, security, enchantment, admiration };

  return {
    ...emotions,
    summary: buildRenderSummary(emotions),
    goalResponse: buildGoalResponse(desiredOutcome, emotions),
    suggestions: buildRenderSuggestions(features, emotions, desiredOutcome)
  };
}

function buildRenderSummary(emotions) {
  const topEmotions = top3(emotions);
  return `This render or photograph is interpreted as an atmospheric image shaped by light, contrast, warmth, and color intensity. The strongest emotional impressions are ${joinNatural(topEmotions)}.`;
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
  if (goal.moreEnchantment) messages.push("To increase enchantment, the project should develop more atmosphere, depth, and emotional staging.");
  if (goal.moreAdmiration) messages.push("To increase admiration, the architecture should feel more resolved, more distinctive, and more compositionally intentional.");

  if (messages.length === 0) {
    return `The desired emotional outcome is "${goal.raw}". The design should align its visual language more clearly with that intention.`;
  }

  return messages.join(" ");
}

function buildRenderSuggestions(features, emotions, desiredOutcome = "") {
  const suggestions = [];
  const goal = parseDesiredOutcome(desiredOutcome);

  if (features.brightness < 40) suggestions.push("Introduce controlled daylight through lateral openings to soften spatial contrast and reinforce calm.");
  if (features.brightness > 75) suggestions.push("Preserve luminous atmosphere while anchoring the composition with deeper material tones to maintain depth.");
  if (features.contrast > 70) suggestions.push("Reduce abrupt tonal shifts and clarify the compositional rhythm so the atmosphere feels more cohesive.");
  if (features.contrast < 35) suggestions.push("Introduce stronger focal contrast and material hierarchy so the spatial reading feels more intentional.");
  if (features.warmth < 40) suggestions.push("Ground the image with warmer material articulation at human scale to strengthen security and accessibility.");
  if (features.warmth > 70) suggestions.push("Balance warm tonal expression with cooler accents and compositional anchors to avoid a singular mood.");
  if (features.saturation < 35) suggestions.push("Refine the palette with one or two purposeful accents to support inspiration while preserving calm.");
  if (features.saturation > 70) suggestions.push("Moderate chromatic intensity so the mood remains elegant and the material expression does not overwhelm.");
  if (features.hue >= 30 && features.hue <= 90) suggestions.push("Use warmer material and light relationships to support conviviality while preserving spatial clarity.");
  if (features.hue >= 180 && features.hue <= 260) suggestions.push("Reinforce the cool palette with clear spatial order and precise material definition.");
  if (features.lightness < 40) suggestions.push("Increase tonal clarity in the primary volumes so the architecture reads with more openness.");
  if (features.lightness > 75) suggestions.push("Introduce deeper tonal gradations or darker materials to preserve perceived mass and spatial depth.");
  if (features.sharpness < 40) suggestions.push("Define key edges and transitions so the spatial hierarchy is more legible.");
  if (features.sharpness > 70) suggestions.push("Soften selected edges or diffuse detail so the composition retains atmosphere without feeling too crisp.");
  if (features.entropy > 65) suggestions.push("Calibrate visual complexity with clearer hierarchy so the project feels richly layered yet readable.");
  if (features.entropy < 30) suggestions.push("Introduce one or two decisive compositional moves to lift the design without sacrificing calm.");
  if (features.uniqueColors > 20) suggestions.push("Keep color relationships intentional so the material story remains coherent and disciplined.");
  if (features.uniqueColors < 5) suggestions.push("Use a confident accent or material gesture to give the composition a stronger sense of character.");

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
    joy: "Introduce lighter, more uplifting spatial cues to create a more welcoming atmosphere.",
    inspiration: "Strengthen the conceptual gesture or architectural idea so the design feels more ambitious.",
    security: "Clarify organization, hierarchy, and enclosure so the project feels more stable and reassuring.",
    enchantment: "Develop layered atmosphere, depth, and memorable spatial moments.",
    admiration: "Refine proportion, hierarchy, and structural expression so the architecture feels more impressive."
  };
  return map[name];
}

function addGoalSuggestions(suggestions, goal) {
  if (goal.moreCalm) suggestions.push("Strengthen spatial breathing and soften material contrasts to cultivate calm.");
  if (goal.moreJoy) suggestions.push("Activate warmer light and material gestures to make the architecture feel more inviting.");
  if (goal.moreInspiration) suggestions.push("Clarify bold formal moves and compositional tension so the design feels more memorable.");
  if (goal.moreSecurity) suggestions.push("Reinforce hierarchy, enclosure, and circulation logic so the architecture feels more grounded.");
  if (goal.moreEnchantment) suggestions.push("Develop layered atmosphere, depth, and spatial richness to elevate the emotional narrative.");
  if (goal.moreAdmiration) suggestions.push("Refine proportion, hierarchy, and structural expression so the architecture feels more impressive.");
}


function parseDesiredOutcome(text = "") {
  const lower = text.toLowerCase();

  return {
    moreCalm: lower.includes("more calm") || lower.includes("plus de calme") || lower.includes("calmer"),
    moreJoy: lower.includes("more joy") || lower.includes("plus de joie") || lower.includes("more joyful"),
    moreInspiration: lower.includes("more inspiration") || lower.includes("plus d'inspiration") || lower.includes("more inspiring"),
    moreSecurity: lower.includes("more security") || lower.includes("plus de sécurité") || lower.includes("safer"),
    moreEnchantment: lower.includes("more enchantment") || lower.includes("plus d'enchantement") || lower.includes("more poetic"),
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

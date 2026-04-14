import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.send("AI Architectural Critic backend is running in advanced demo mode.");
});

app.post("/analyze", async (req, res) => {
  try {
    const { imageBase64, desiredOutcome } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Missing imageBase64 in request body."
      });
    }

    const seed = createSeedFromString(imageBase64.slice(0, 1200));
    const profile = pickProfileFromSeed(seed);
    const result = buildResponse(profile, desiredOutcome, seed);

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
      ["Interest", interest],
      ["Admiration", admiration],
      ["Enchantment", enchantment],
      ["Anxiety", anxiety]
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
        "Prototype mode - report generated from the advanced demonstration version of AI Architectural Critic."
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

function createSeedFromString(str) {
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    total = (total + str.charCodeAt(i) * (i + 1)) % 1000000;
  }
  return total;
}

function vary(base, seed, amount = 6) {
  const offset = (seed % (amount * 2 + 1)) - amount;
  const value = base + offset;
  return Math.max(0, Math.min(100, value));
}

function choice(arr, seed) {
  return arr[seed % arr.length];
}

function uniqueList(items) {
  return [...new Set(items)];
}

function pickProfileFromSeed(seed) {
  const profiles = [
    "calm_minimal",
    "dramatic_monumental",
    "warm_human",
    "dense_tense",
    "poetic_enchanting",
    "bright_civic",
    "luxury_refined",
    "experimental_dynamic"
  ];

  return profiles[seed % profiles.length];
}

function buildResponse(profile, desiredOutcome = "", seed = 0) {
  const goal = parseDesiredOutcome(desiredOutcome);
  const base = buildBaseProfile(profile, seed);
  const summary = buildDynamicSummary(profile, base, seed);
  const goalResponse = buildGoalResponse(goal, base, seed);
  const suggestions = buildDynamicSuggestions(profile, base, goal, seed);

  return {
    calm: base.calm,
    interest: base.interest,
    admiration: base.admiration,
    enchantment: base.enchantment,
    anxiety: base.anxiety,
    summary,
    goalResponse,
    suggestions
  };
}

function buildBaseProfile(profile, seed) {
  switch (profile) {
    case "calm_minimal":
      return {
        profile,
        calm: vary(82, seed + 1, 8),
        interest: vary(56, seed + 2, 8),
        admiration: vary(66, seed + 3, 7),
        enchantment: vary(44, seed + 4, 8),
        anxiety: vary(14, seed + 5, 5)
      };

    case "dramatic_monumental":
      return {
        profile,
        calm: vary(28, seed + 1, 7),
        interest: vary(89, seed + 2, 6),
        admiration: vary(84, seed + 3, 7),
        enchantment: vary(65, seed + 4, 8),
        anxiety: vary(48, seed + 5, 7)
      };

    case "warm_human":
      return {
        profile,
        calm: vary(71, seed + 1, 7),
        interest: vary(66, seed + 2, 7),
        admiration: vary(68, seed + 3, 6),
        enchantment: vary(55, seed + 4, 7),
        anxiety: vary(18, seed + 5, 5)
      };

    case "dense_tense":
      return {
        profile,
        calm: vary(18, seed + 1, 6),
        interest: vary(80, seed + 2, 7),
        admiration: vary(60, seed + 3, 8),
        enchantment: vary(40, seed + 4, 7),
        anxiety: vary(70, seed + 5, 8)
      };

    case "poetic_enchanting":
      return {
        profile,
        calm: vary(54, seed + 1, 7),
        interest: vary(76, seed + 2, 6),
        admiration: vary(73, seed + 3, 6),
        enchantment: vary(89, seed + 4, 7),
        anxiety: vary(22, seed + 5, 5)
      };

    case "bright_civic":
      return {
        profile,
        calm: vary(63, seed + 1, 7),
        interest: vary(72, seed + 2, 7),
        admiration: vary(78, seed + 3, 6),
        enchantment: vary(52, seed + 4, 7),
        anxiety: vary(16, seed + 5, 5)
      };

    case "luxury_refined":
      return {
        profile,
        calm: vary(67, seed + 1, 7),
        interest: vary(64, seed + 2, 6),
        admiration: vary(86, seed + 3, 6),
        enchantment: vary(70, seed + 4, 7),
        anxiety: vary(17, seed + 5, 5)
      };

    case "experimental_dynamic":
      return {
        profile,
        calm: vary(32, seed + 1, 8),
        interest: vary(91, seed + 2, 5),
        admiration: vary(74, seed + 3, 7),
        enchantment: vary(62, seed + 4, 8),
        anxiety: vary(43, seed + 5, 7)
      };

    default:
      return {
        profile: "balanced",
        calm: 50,
        interest: 50,
        admiration: 50,
        enchantment: 50,
        anxiety: 20
      };
  }
}

function buildDynamicSummary(profile, base, seed) {
  const openings = [
    "This project suggests",
    "The image communicates",
    "The spatial composition creates",
    "This architectural proposal conveys"
  ];

  const profileDescriptors = {
    calm_minimal: [
      "a quiet and disciplined atmosphere",
      "a restrained and spacious mood",
      "a clear sense of order and calm"
    ],
    dramatic_monumental: [
      "a powerful and monumental emotional register",
      "an intense and commanding spatial presence",
      "a visually dominant and dramatic atmosphere"
    ],
    warm_human: [
      "a welcoming and human-centered atmosphere",
      "a balanced and approachable emotional character",
      "a warm sense of comfort and usability"
    ],
    dense_tense: [
      "a compressed and psychologically intense spatial reading",
      "a dense atmosphere shaped by tension and complexity",
      "a stimulating but potentially overwhelming experience"
    ],
    poetic_enchanting: [
      "an immersive and poetic emotional atmosphere",
      "a strong sense of mood, mystery, and storytelling",
      "an evocative experience shaped by imagination and ambiance"
    ],
    bright_civic: [
      "a generous and uplifting civic quality",
      "an open and confident public-facing atmosphere",
      "a clear sense of dignity, light, and accessibility"
    ],
    luxury_refined: [
      "a refined and elevated spatial identity",
      "an atmosphere of sophistication and composure",
      "a polished emotional register rooted in material control"
    ],
    experimental_dynamic: [
      "a highly dynamic and exploratory architectural expression",
      "an energetic identity built on movement and contrast",
      "a bold and unconventional emotional language"
    ]
  };

  const strengths = [];
  if (base.calm >= 65) strengths.push("calm");
  if (base.interest >= 70) strengths.push("visual interest");
  if (base.admiration >= 75) strengths.push("admiration");
  if (base.enchantment >= 70) strengths.push("enchantment");
  if (base.anxiety >= 45) strengths.push("tension");

  const strengthText =
    strengths.length > 0
      ? `Its strongest qualities are ${joinNatural(strengths)}.`
      : "Its emotional profile remains relatively balanced.";

  const cautionPool = [];
  if (base.anxiety >= 45) cautionPool.push("At moments, the composition may feel emotionally demanding.");
  if (base.calm < 35) cautionPool.push("A clearer sense of visual breathing space could improve comfort.");
  if (base.enchantment < 45) cautionPool.push("The atmosphere could become more memorable through stronger mood and material depth.");
  if (base.interest < 50) cautionPool.push("The project may benefit from sharper focal moments or greater spatial contrast.");

  const opening = choice(openings, seed + 20);
  const descriptor = choice(profileDescriptors[profile] || ["a balanced architectural atmosphere"], seed + 21);
  const caution = cautionPool.length ? " " + choice(cautionPool, seed + 22) : "";

  return `${opening} ${descriptor}. ${strengthText}${caution}`;
}

function parseDesiredOutcome(text = "") {
  const lower = text.toLowerCase();

  return {
    moreCalm:
      lower.includes("more calm") ||
      lower.includes("plus de calme") ||
      lower.includes("calmer") ||
      lower.includes("more peaceful"),
    lessAnxiety:
      lower.includes("less anxiety") ||
      lower.includes("moins d'anxiété") ||
      lower.includes("less stress") ||
      lower.includes("less tension"),
    moreAdmiration:
      lower.includes("more admiration") ||
      lower.includes("plus d'admiration") ||
      lower.includes("more impressive"),
    moreEnchantment:
      lower.includes("more enchantment") ||
      lower.includes("plus d'enchantement") ||
      lower.includes("more magic") ||
      lower.includes("more poetic"),
    moreInterest:
      lower.includes("more interest") ||
      lower.includes("plus d'intérêt") ||
      lower.includes("more curiosity") ||
      lower.includes("more engaging"),
    moreWarmth:
      lower.includes("more warmth") ||
      lower.includes("plus de chaleur") ||
      lower.includes("warmer"),
    hasGoal: lower.trim().length > 0,
    raw: text
  };
}

function buildGoalResponse(goal, base, seed) {
  if (!goal.hasGoal) {
    return "No specific emotional goal was provided. The recommendations therefore respond mainly to the current emotional profile of the project.";
  }

  const messages = [];

  if (goal.moreCalm) {
    messages.push(
      base.calm >= 65
        ? "The project already leans toward calm, so the design strategy should reinforce continuity, softness, and visual restraint."
        : "To create more calm, the project should reduce tension, simplify competing elements, and create more visual breathing space."
    );
  }

  if (goal.lessAnxiety) {
    messages.push(
      base.anxiety <= 25
        ? "Anxiety is already limited, so refinement should focus on preserving comfort while improving clarity and warmth."
        : "To reduce anxiety, the project should soften abrupt contrasts, clarify hierarchy, and strengthen human-scale cues."
    );
  }

  if (goal.moreAdmiration) {
    messages.push(
      "To increase admiration, the design should sharpen its architectural identity through stronger hierarchy, proportion, and signature moments."
    );
  }

  if (goal.moreEnchantment) {
    messages.push(
      "To increase enchantment, the atmosphere should become more immersive through light, shadow, depth, and carefully staged material expression."
    );
  }

  if (goal.moreInterest) {
    messages.push(
      "To generate more interest, the project should introduce richer focal points, rhythm changes, or moments of visual surprise."
    );
  }

  if (goal.moreWarmth) {
    messages.push(
      "To create more warmth, the project should use softer materials, warmer tones, and more human-centered spatial transitions."
    );
  }

  if (messages.length === 0) {
    const generic = [
      `The desired emotional outcome is "${goal.raw}". The design should align its light, materiality, scale, and hierarchy more clearly with that direction.`,
      `The stated goal is "${goal.raw}". The most effective strategy is to tune atmosphere through material choices, spatial rhythm, and perceived comfort.`,
      `The target emotional direction is "${goal.raw}". The project should be adjusted through clearer mood-setting elements and more intentional spatial cues.`
    ];
    return choice(generic, seed + 50);
  }

  return messages.join(" ");
}

function buildDynamicSuggestions(profile, base, goal, seed) {
  const suggestionBank = {
    calm: [
      "Reduce competing visual elements to reinforce calm.",
      "Use a more consistent material palette to create a quieter reading.",
      "Open more visual breathing space between major architectural elements.",
      "Simplify formal transitions to produce a steadier emotional rhythm."
    ],
    interest: [
      "Introduce a stronger focal moment to increase visual interest.",
      "Use contrast in volume, light, or texture to create a more engaging sequence.",
      "Develop one unexpected spatial gesture to intensify curiosity.",
      "Create clearer moments of compression and release to keep attention alive."
    ],
    admiration: [
      "Strengthen proportion and hierarchy so the project feels more resolved and intentional.",
      "Develop one signature architectural move that elevates the identity of the design.",
      "Refine the composition so the project reads as more coherent and memorable.",
      "Use materials and detailing more deliberately to increase perceived quality."
    ],
    enchantment: [
      "Layer light and shadow to create a more atmospheric experience.",
      "Use material depth and tonal nuance to increase enchantment.",
      "Design for mood, not only function, by staging moments of discovery.",
      "Introduce spatial sequences that feel immersive rather than purely efficient."
    ],
    anxiety: [
      "Reduce abrupt contrast and visual congestion to lower anxiety.",
      "Clarify circulation and hierarchy so the project feels easier to read.",
      "Introduce softer edges, warmer materials, or vegetation to reduce tension.",
      "Balance expressive gestures with calmer background surfaces."
    ],
    warmth: [
      "Use warmer materials such as timber, textured stone, or softer finishes.",
      "Increase human-scale references to make the environment feel more welcoming.",
      "Soften the atmosphere through warmer tones and gentler spatial transitions.",
      "Balance monumentality with tactile, intimate elements."
    ],
    profile: {
      calm_minimal: [
        "Add one refined focal element so the calm language does not become emotionally flat.",
        "Introduce subtle texture variation to enrich the minimalist atmosphere.",
        "Use nuanced shadow and depth to prevent excessive neutrality."
      ],
      dramatic_monumental: [
        "Counterbalance monumentality with more approachable human-scale zones.",
        "Soften the emotional harshness with warmer transitions and gentler thresholds.",
        "Use vegetation or filtered light to temper the intensity."
      ],
      warm_human: [
        "Increase architectural distinction so warmth is paired with stronger identity.",
        "Introduce a clearer formal rhythm to give the project more presence.",
        "Use one more dramatic spatial moment without losing comfort."
      ],
      dense_tense: [
        "Reduce formal density in selected zones to improve mental comfort.",
        "Create pauses or open voids to relieve pressure in the composition.",
        "Clarify major and minor elements so the overall reading feels less compressed."
      ],
      poetic_enchanting: [
        "Support the atmospheric quality with stronger functional legibility.",
        "Anchor the poetic mood in a clearer material theme.",
        "Balance mystery with moments of orientation and comfort."
      ],
      bright_civic: [
        "Reinforce generosity through threshold design and public-facing clarity.",
        "Use rhythm and proportion to give the civic character more authority.",
        "Create stronger moments of invitation at the human scale."
      ],
      luxury_refined: [
        "Deepen the tactile experience through richer material contrast.",
        "Use more controlled focal lighting to intensify refinement.",
        "Ensure elegance is paired with enough warmth to avoid emotional distance."
      ],
      experimental_dynamic: [
        "Clarify the main design idea so experimentation feels intentional rather than scattered.",
        "Balance expressive geometry with calmer zones of rest.",
        "Strengthen readability so innovation remains accessible."
      ]
    }
  };

  const suggestions = [];

  suggestions.push(choice(suggestionBank.profile[profile], seed + 60));

  const ranked = [
    { key: "calm", value: base.calm },
    { key: "interest", value: base.interest },
    { key: "admiration", value: base.admiration },
    { key: "enchantment", value: base.enchantment },
    { key: "anxiety", value: 100 - base.anxiety }
  ];

  ranked.sort((a, b) => a.value - b.value);

  const weakest1 = ranked[0].key;
  const weakest2 = ranked[1].key;

  suggestions.push(choice(suggestionBank[weakest1], seed + 61));
  suggestions.push(choice(suggestionBank[weakest2], seed + 62));

  if (goal.moreCalm) suggestions.push(choice(suggestionBank.calm, seed + 70));
  if (goal.lessAnxiety) suggestions.push(choice(suggestionBank.anxiety, seed + 71));
  if (goal.moreAdmiration) suggestions.push(choice(suggestionBank.admiration, seed + 72));
  if (goal.moreEnchantment) suggestions.push(choice(suggestionBank.enchantment, seed + 73));
  if (goal.moreInterest) suggestions.push(choice(suggestionBank.interest, seed + 74));
  if (goal.moreWarmth) suggestions.push(choice(suggestionBank.warmth, seed + 75));

  return uniqueList(suggestions).slice(0, 6);
}

function joinNatural(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
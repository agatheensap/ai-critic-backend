# AI Architectural Critic: Toward an Emotional Reading of Architectural Images

## Abstract

AI Architectural Critic is a web-based prototype that translates measurable visual properties of architectural renderings and photographs into an emotional reading. The system extracts visual features from uploaded images, maps them to six emotional dimensions, and returns scores, summaries, goal-oriented interpretation, design suggestions, and a downloadable PDF report.

The current framework uses six emotions: Calm, Joy, Inspiration, Security, Enchantment, and Admiration. Comfort and Serenity were removed from the earlier framework because they overlapped too strongly with Security and Calm. This reduction makes the radar chart clearer and the theoretical model more coherent.

## 1. Introduction

Architecture is often evaluated through function, form, structure, and performance. Yet architectural images also communicate atmosphere, mood, and emotional intention. Designers routinely ask whether an image feels calm, inspiring, stable, joyful, enchanting, or admirable, but these impressions are difficult to discuss systematically.

AI Architectural Critic proposes a lightweight rule-based method for making these impressions more explicit. It does not claim to understand architecture semantically. Instead, it treats each uploaded image as a visual field and extracts measurable properties that can support structured critique.

## 2. Scope

The prototype is focused on:

- renderings
- photographs
- interior scenes
- atmospheric architectural images
- project image sets of up to 4 uploads

The active implementation is render-focused. Plan and section modes are not part of the current user-facing workflow.

## 3. Emotional Framework

The final emotional model contains six dimensions:

| Emotion | Design Reading |
| --- | --- |
| Calm | Visual quietness, reduced friction, controlled contrast |
| Joy | Brightness, warmth, openness, uplifting atmosphere |
| Inspiration | Conceptual boldness, clarity, contrast, memorable composition |
| Security | Legibility, stability, enclosure, reassurance |
| Enchantment | Atmosphere, depth, richness, emotional staging |
| Admiration | Refinement, distinctiveness, compositional intention |

The reduction from eight to six emotions improves conceptual separation:

- Security absorbs qualities previously associated with Comfort.
- Calm absorbs qualities previously associated with Serenity.

## 4. Method

### 4.1 Visual Feature Extraction

The frontend loads each uploaded image into an HTML canvas and extracts nine normalized features:

- brightness
- contrast
- warmth
- saturation
- hue
- lightness
- sharpness
- entropy
- unique colors

These features describe the image as a visual composition rather than as a set of recognized objects.

### 4.2 Emotional Mapping

The backend maps the visual features to six scores between 0 and 100. Each emotion uses a weighted formula.

For example:

- Calm increases with brightness, low contrast, low saturation, lower entropy, and lower sharpness.
- Joy increases with brightness, warmth, saturation, and yellow hue proximity.
- Inspiration increases with contrast, sharpness, entropy, and visual variety.
- Security increases with legibility, lower contrast, lower entropy, and visual stability.
- Enchantment increases with atmosphere, richness, contrast, saturation, and layered complexity.
- Admiration increases with contrast, sharpness, refinement, and compositional distinction.

### 4.3 Goal-Oriented Interpretation

Users can enter an emotional goal such as:

```text
more calm and more inspiration
```

The system parses supported English target phrases and generates guidance aligned with those goals.

Supported goals include:

- more calm
- more joy
- more inspiration
- more security
- more enchantment
- more admiration
- less anxiety
- less stress

## 5. Interface

The interface supports:

- image upload with a maximum of 4 images
- image previews
- radar chart comparison between current and target emotional profiles
- six score cards
- visual feature metadata
- project summary
- goal-oriented interpretation
- design suggestions
- multi-image comparison tables
- JSON export
- PDF report export

The layout uses responsive grid sections to avoid visual overlap between charts, cards, summaries, suggestions, and comparison tables.

## 6. Multi-Image Project Reading

When several images are uploaded, the frontend analyzes each image independently and then builds an aggregated project profile. It averages emotion scores and visual features, combines summaries, deduplicates suggestions, and preserves the desired emotional outcome.

This allows a project to be read as a set of related visual moments rather than as a single isolated image.

## 7. PDF Reporting

PDF export turns the interactive analysis into a shareable report. The report contains:

- project overview
- uploaded images in a dedicated Project Images section
- desired emotional outcome
- aggregated emotional scores
- project summary
- goal-oriented interpretation
- individual image analyses when available
- design suggestions

Images are embedded directly in the PDF, resized to page margins, and placed using stable PDFKit layout flow.

## 8. Limitations

The prototype is intentionally simple:

- It is not a trained machine-learning image model.
- It does not identify architectural elements.
- It does not understand context, program, culture, or lived experience.
- It relies on hypothesized relationships between visual features and emotional impressions.

Despite these limits, the tool can support design discussion by making atmospheric intentions easier to compare, document, and refine.

## 9. Conclusion

AI Architectural Critic demonstrates one way to structure emotional critique around architectural images. By reducing the framework to six clearer dimensions and combining visual feature extraction with goal-oriented feedback, the application offers a compact design-support tool for reflection, presentation, and iterative critique.

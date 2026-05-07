# API Documentation

AI Architectural Critic exposes a small local HTTP API from `server.js`.

Base URL:

```text
http://localhost:3000
```

The backend currently runs in render analysis mode. `imageType` may still appear in requests for backward compatibility, but responses use `imageType: "render"`.

## Health Check

### `GET /health`

Returns plain text:

```text
AI Architectural Critic backend is running in render analysis mode.
```

## Analyze Image

### `POST /analyze`

Analyzes one uploaded image and returns six emotional scores.

### Request

```json
{
  "imageBase64": "data:image/png;base64,iVBORw0KGgo...",
  "desiredOutcome": "more calm and more inspiration",
  "visualFeatures": {
    "brightness": 62,
    "contrast": 41,
    "warmth": 54,
    "saturation": 38,
    "hue": 50,
    "lightness": 59,
    "sharpness": 44,
    "entropy": 36,
    "uniqueColors": 28
  }
}
```

### Request Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `imageBase64` | string | Yes | Data URI image string. |
| `desiredOutcome` | string | No | English free-form goal, for example `more calm and more inspiration`. |
| `visualFeatures` | object | No | Frontend-extracted visual features. Missing values default to 50. |
| `imageType` | string | No | Accepted for compatibility; render analysis is used. |

### Visual Features

| Feature | Range | Meaning |
| --- | --- | --- |
| `brightness` | 0-100 | Average luminosity |
| `contrast` | 0-100 | Pixel value variance |
| `warmth` | 0-100 | Red-minus-blue color balance |
| `saturation` | 0-100 | Color intensity |
| `hue` | 0-100 | Average hue mapped from 0-360 degrees |
| `lightness` | 0-100 | HSL lightness |
| `sharpness` | 0-100 | Edge density and detail clarity |
| `entropy` | 0-100 | Visual complexity |
| `uniqueColors` | 0-100 | Normalized distinct color count |

### Response

```json
{
  "calm": 68,
  "joy": 54,
  "inspiration": 49,
  "security": 63,
  "enchantment": 47,
  "admiration": 51,
  "summary": "This render or photograph is interpreted as an atmospheric image...",
  "goalResponse": "To increase calm, the design should reduce visual friction...",
  "suggestions": [
    "Introduce controlled daylight through lateral openings...",
    "Refine proportion, hierarchy, and structural expression..."
  ],
  "visualFeatures": {
    "brightness": 62,
    "contrast": 41,
    "warmth": 54,
    "saturation": 38,
    "hue": 50,
    "lightness": 59,
    "sharpness": 44,
    "entropy": 36,
    "uniqueColors": 28
  },
  "desiredOutcome": "more calm and more inspiration",
  "imageType": "render"
}
```

### Response Fields

| Field | Type | Notes |
| --- | --- | --- |
| `calm` | number | 0-100 |
| `joy` | number | 0-100 |
| `inspiration` | number | 0-100 |
| `security` | number | 0-100 |
| `enchantment` | number | 0-100 |
| `admiration` | number | 0-100 |
| `summary` | string | Overall emotional reading |
| `goalResponse` | string | Goal-oriented interpretation |
| `suggestions` | string[] | Design suggestions |
| `visualFeatures` | object | Sanitized feature values |
| `desiredOutcome` | string | Echoed goal |
| `imageType` | string | Always `render` |

## Generate PDF Report

### `POST /report`

Generates a PDF report from a single-image or aggregated multi-image analysis.

### Request

```json
{
  "calm": 68,
  "joy": 54,
  "inspiration": 49,
  "security": 63,
  "enchantment": 47,
  "admiration": 51,
  "summary": "Project-level summary...",
  "goalResponse": "To increase calm...",
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2"
  ],
  "desiredOutcome": "more calm and more inspiration",
  "individualAnalyses": [
    {
      "imageName": "render-01.jpg",
      "calm": 70,
      "joy": 52,
      "inspiration": 48,
      "security": 64,
      "enchantment": 45,
      "admiration": 51
    }
  ],
  "reportImages": [
    {
      "name": "render-01.jpg",
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `calm` | number | No | Aggregated score |
| `joy` | number | No | Aggregated score |
| `inspiration` | number | No | Aggregated score |
| `security` | number | No | Aggregated score |
| `enchantment` | number | No | Aggregated score |
| `admiration` | number | No | Aggregated score |
| `summary` | string | No | Project summary |
| `goalResponse` | string | No | If missing and `desiredOutcome` exists, backend generates fallback text |
| `suggestions` | string[] | No | Design suggestions |
| `desiredOutcome` | string | No | User goal |
| `individualAnalyses` | object[] | No | Per-image scores |
| `reportImages` | object[] | No | Images to embed in the PDF |
| `images` | object[] | No | Metadata fallback |

### PDF Layout

The generated PDF contains:

1. Title and subtitle
2. Project overview
3. Dedicated Project Images section
4. Desired emotional outcome
5. Aggregated emotional scores
6. Project summary
7. Goal-oriented interpretation
8. Individual image analyses, when multiple analyses are provided
9. Design suggestions
10. Prototype note

Uploaded images are decoded from data URIs, resized to fit within A4 margins, and placed with stable PDFKit cursor flow.

## Error Responses

### Missing Image

`POST /analyze` without `imageBase64`:

```json
{
  "error": "Missing imageBase64 in request body."
}
```

### Server Error

```json
{
  "error": "Server error during analysis.",
  "details": "Error message"
}
```

or:

```json
{
  "error": "Server error during PDF generation.",
  "details": "Error message"
}
```

## Limits

- Frontend upload limit: 4 images
- Backend JSON body limit: 50MB
- Supported embedded PDF image data URI types: PNG, JPG, JPEG

## Example Workflow

```js
const analysisResponses = [];

for (const image of uploadedImages.slice(0, 4)) {
  const response = await fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imageBase64: image.base64,
      desiredOutcome: "more calm and more inspiration",
      visualFeatures: image.features
    })
  });

  analysisResponses.push(await response.json());
}

const pdfResponse = await fetch("/report", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...aggregatedAnalysis,
    individualAnalyses: analysisResponses,
    reportImages: uploadedImages.map(({ name, base64 }) => ({ name, base64 }))
  })
});
```

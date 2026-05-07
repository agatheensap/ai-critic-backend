# AI Architectural Critic

AI Architectural Critic is a local web application that analyzes architectural renderings and photographs through visual features, maps them to a six-emotion framework, and generates design feedback plus a PDF report.

The app is rule-based. It does not perform semantic image understanding; it extracts visual properties such as brightness, contrast, warmth, saturation, hue, lightness, sharpness, entropy, and color variety, then translates those measurements into emotional scores.

## Features

- Upload up to 4 architectural images
- Analyze renderings, photographs, interiors, and atmospheric project views
- Score 6 emotional dimensions: Calm, Joy, Inspiration, Security, Enchantment, Admiration
- Compare current and target emotional profiles with a radar chart
- Generate goal-oriented interpretation from prompts such as `more calm and more inspiration`
- Display multi-image comparison tables
- Export JSON analysis data
- Export a PDF report with embedded uploaded images
- Keep recent analyses in browser local storage

## Quick Start

```bash
npm install
npm start
```

Open:

```text
http://localhost:3000
```

Health check:

```bash
curl http://localhost:3000/health
```

Expected response:

```text
AI Architectural Critic backend is running in render analysis mode.
```

## Public Deployment

The app needs a Node hosting platform because the frontend calls the backend routes `/analyze` and `/report`.

Recommended option: Render.

1. Push this repository to GitHub.
2. Go to Render.
3. Create a new Blueprint or Web Service from the GitHub repository.
4. If using the Blueprint flow, Render reads `render.yaml` automatically.
5. If creating a Web Service manually, use:

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

After deployment, Render provides a public URL such as:

```text
https://ai-architectural-critic.onrender.com
```

Because `index.html` uses `window.location.origin`, the frontend will automatically call the deployed backend on the same public domain.

## Project Structure

```text
ai-critic-backend/
├── index.html
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── Docs/
    ├── API.md
    ├── Explain app.md
    ├── Diagrams.md
    ├── ACADEMIC_PAPER.md
    └── AUTHORSHIP_AND_PROCESS.md
```

## Emotional Framework

The app now uses 6 emotional dimensions:

| Emotion | Meaning |
| --- | --- |
| Calm | Visual quietness, reduced friction, controlled contrast |
| Joy | Brightness, warmth, openness, uplifting atmosphere |
| Inspiration | Conceptual boldness, contrast, clarity, memorable composition |
| Security | Legibility, stability, enclosure, reassurance |
| Enchantment | Atmosphere, richness, depth, emotional staging |
| Admiration | Refinement, distinctiveness, compositional intention |

Comfort and Serenity were removed because they overlapped too strongly with Security and Calm.

## Workflow

1. User uploads 1 to 4 images.
2. Frontend extracts 9 visual features with Canvas.
3. Frontend sends one `/analyze` request per image.
4. Backend returns 6 emotion scores, summary, goal response, suggestions, and sanitized visual features.
5. Frontend aggregates multiple images into a project-level profile.
6. User can export JSON or a PDF report.
7. PDF report embeds uploaded images in a dedicated Project Images section.

## API Summary

### `POST /analyze`

Analyzes one image.

Required:

- `imageBase64`: data URI image string

Optional:

- `desiredOutcome`: English free-form emotional goal
- `visualFeatures`: frontend-extracted feature object
- `imageType`: accepted for backward compatibility, but analysis is render-focused

Returns:

- `calm`
- `joy`
- `inspiration`
- `security`
- `enchantment`
- `admiration`
- `summary`
- `goalResponse`
- `suggestions`
- `visualFeatures`
- `desiredOutcome`
- `imageType: "render"`

### `POST /report`

Generates a PDF report from aggregated analysis data.

The report includes:

- Project overview
- Project Images section with embedded uploaded images
- Desired emotional outcome
- Aggregated emotional scores
- Project summary
- Goal-oriented interpretation
- Individual image analyses when available
- Design suggestions

## Payload Limit

The backend accepts JSON payloads up to 50MB:

```js
app.use(express.json({ limit: "50mb" }));
```

This supports PDF export with embedded Base64 image data. Very large images can still exceed the limit, so users should prefer reasonably compressed JPG/PNG uploads.

## Development Notes

- Frontend is plain HTML, CSS, and vanilla JavaScript.
- Backend is Express with PDFKit.
- Radar chart uses Chart.js.
- There is no build step.
- Analysis is currently render-focused only.
- The frontend prevents selecting more than 4 images.

## Documentation

- [Docs/API.md](Docs/API.md): endpoint contracts and examples
- [Docs/Explain app.md](Docs/Explain%20app.md): architecture and workflow
- [Docs/Diagrams.md](Docs/Diagrams.md): formulas and flow diagrams
- [Docs/ACADEMIC_PAPER.md](Docs/ACADEMIC_PAPER.md): conceptual framing
- [Docs/AUTHORSHIP_AND_PROCESS.md](Docs/AUTHORSHIP_AND_PROCESS.md): authorship and development process

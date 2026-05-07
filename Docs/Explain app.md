# Application Explanation

AI Architectural Critic is a single-page local web application for evaluating the emotional character of architectural images.

The current application is render-focused. It analyzes renderings, photographs, interiors, and atmospheric project views. Plan and section modes are no longer part of the active workflow.

## User-Facing Workflow

1. User uploads 1 to 4 images.
2. User enters an optional desired emotional outcome, such as `more calm and more inspiration`.
3. Browser extracts visual features from each image.
4. Frontend sends one `/analyze` request per valid image.
5. Backend returns six emotional scores and design feedback.
6. Frontend aggregates multi-image results.
7. User can view the radar chart, scores, summaries, comparison tables, and suggestions.
8. User can export JSON or a PDF report.

## Active Emotional Framework

The app uses 6 emotional dimensions:

- Calm
- Joy
- Inspiration
- Security
- Enchantment
- Admiration

Comfort was removed because it overlapped with Security. Serenity was removed because it overlapped with Calm.

## Frontend Responsibilities

File: `index.html`

The frontend handles:

- image upload
- maximum 4 image validation
- image previews
- visual feature extraction through Canvas
- request orchestration for `/analyze`
- multi-image aggregation
- radar chart rendering through Chart.js
- score cards
- comparison tables
- local analysis history
- JSON export
- PDF export request body construction

## Visual Feature Extraction

The frontend extracts 9 visual features:

| Feature | Meaning |
| --- | --- |
| Brightness | Average luminosity |
| Contrast | Pixel variance |
| Warmth | Red-minus-blue color balance |
| Saturation | Color intensity |
| Hue | Average hue |
| Lightness | HSL lightness |
| Sharpness | Edge density |
| Entropy | Visual complexity |
| Unique Colors | Normalized color variety |

These values are normalized to 0-100 before being sent to the backend.

## Backend Responsibilities

File: `server.js`

The backend handles:

- serving the static frontend
- `/health`
- `/analyze`
- `/report`
- feature sanitization
- six-emotion scoring
- summary generation
- goal-oriented interpretation
- suggestion generation
- PDF report generation with embedded uploaded images

## Analyze Route

Route:

```text
POST /analyze
```

Input:

- `imageBase64`
- `desiredOutcome`
- `visualFeatures`

Output:

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

## Report Route

Route:

```text
POST /report
```

The report route uses PDFKit and produces a professional PDF containing:

- title
- project overview
- Project Images section
- desired emotional outcome
- aggregated emotional scores
- project summary
- goal-oriented interpretation
- individual image analyses when present
- design suggestions

Uploaded images are sent as Base64 data URIs in `reportImages`. The backend decodes them, preserves aspect ratio, and fits them within page margins.

## Multi-Image Aggregation

For multiple images, the frontend:

- averages the six emotion scores
- averages visual features
- combines summaries
- deduplicates suggestions
- builds a project-level goal response
- preserves the original desired outcome
- sends uploaded images to the PDF report request

## Goal-Oriented Interpretation

The supported target phrases are:

- `more calm`
- `more joy`
- `more inspiration`
- `more security`
- `more enchantment`
- `more admiration`
- `less anxiety`
- `less stress`

If `goalResponse` is missing but `desiredOutcome` is present, both frontend and backend have fallback logic to generate a meaningful interpretation.

## Layout System

The frontend layout is organized around stable responsive sections:

- input panel
- preview area
- results header
- visual feature cards
- radar chart
- six score cards
- image comparison block
- summary and goal cards
- suggestions card

The results layout uses named CSS grid areas to prevent overlap between chart, score cards, text blocks, comparison tables, and suggestions.

## Important Constraints

- Maximum frontend upload count: 4 images
- Backend JSON payload limit: 50MB
- Analysis mode: render-focused
- Active emotional dimensions: 6
- PDF images are embedded directly in the generated report

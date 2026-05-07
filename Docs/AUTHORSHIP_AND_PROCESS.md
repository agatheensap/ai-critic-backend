# Authorship and Process

## Project Overview

AI Architectural Critic is a local web application for analyzing the emotional character of architectural renderings and photographs. It extracts visual features, maps them to six emotional dimensions, and generates summaries, goal-oriented interpretation, design suggestions, comparison views, JSON exports, and PDF reports.

## Current Scope

The current implementation is:

- render-focused
- English-language in the frontend
- limited to 4 uploaded images
- based on 6 emotional dimensions
- able to embed uploaded images directly inside the generated PDF report

The active emotions are:

- Calm
- Joy
- Inspiration
- Security
- Enchantment
- Admiration

## Conceptual Direction

The project began as an experiment in making atmospheric and emotional critique more explicit. The emotional framework was refined from eight dimensions to six after identifying overlap:

- Comfort overlapped with Security.
- Serenity overlapped with Calm.

This refinement made the radar chart clearer and the framework easier to interpret.

## User Experience Design

The interface was designed around a compact workflow:

1. Upload architectural images.
2. Define a desired emotional outcome.
3. Analyze the images.
4. Read the emotional profile.
5. Compare current and target profiles.
6. Review summaries and suggestions.
7. Export JSON or PDF.

Recent layout work focused on preventing overlap between:

- radar chart
- score cards
- summaries
- goal interpretation
- suggestions
- comparison tables
- uploaded image previews

## Detailed Creation Timeline

### 1. Initial Concept and Project Framing

The project started with the idea of creating an architectural critique tool focused on emotion rather than only form, function, or technical performance. The first conceptual step was to define the application as a design-support prototype capable of translating visual qualities into an emotional profile.

Early decisions included:

- making the tool accessible through a local web interface
- focusing on architectural images as the primary input
- using emotional scoring as the main output
- producing design feedback that could support critique and iteration
- keeping the system rule-based and explainable rather than opaque

### 2. Core Application Structure

The application was structured as a simple full-stack local project:

- `index.html` for the frontend interface
- `server.js` for the backend API and PDF generation
- `package.json` and `package-lock.json` for Node dependencies
- `Docs/` for project documentation

The technical stack was kept deliberately lightweight:

- no frontend build system
- no database
- no user accounts
- no server-side image storage
- direct browser-to-backend JSON requests

### 3. Frontend Interface Creation

The first version of the frontend established the main user journey:

1. upload architectural images
2. enter a desired emotional outcome
3. analyze the design
4. view emotional scores
5. read a summary and suggestions
6. export results

The interface was built with:

- a hero section
- an upload/input panel
- image preview area
- result panel
- emotional score cards
- radar chart
- summary and interpretation cards
- suggestions list
- export buttons

The visual direction aimed for a calm, premium, architectural interface using soft surfaces, restrained spacing, neutral colors, and card-based information hierarchy.

### 4. Image Upload and Preview Workflow

Image upload was implemented with a browser file input and `FileReader`.

Actions completed:

- added multiple image upload support
- converted uploaded images to Base64 data URLs
- generated preview thumbnails
- displayed image file names
- stored current image state in `currentImages`
- prepared uploaded image data for both analysis and PDF export
- added a maximum upload limit of 4 images
- added the user-facing validation message `Maximum 4 images allowed.`

### 5. Visual Feature Extraction

The frontend was extended to process each uploaded image through an HTML canvas.

The implemented feature extraction pipeline:

- loads each image into a canvas
- resizes it for efficient analysis
- reads pixel data
- computes average brightness
- computes contrast through luminance variance
- computes warmth from red-blue balance
- computes saturation
- computes hue
- computes lightness
- estimates sharpness from edge differences
- computes visual entropy
- estimates normalized unique color count

These nine values became the measurable basis for the emotional scoring system.

### 6. Backend API Setup

The backend was created with Express.

Core backend actions:

- configured CORS
- configured JSON parsing
- served the static frontend
- added `/health`
- added `/analyze`
- added `/report`
- added feature sanitization
- added error handling for missing image input
- increased JSON payload support to 50MB for image-rich PDF exports

The health endpoint now reports:

```text
AI Architectural Critic backend is running in render analysis mode.
```

### 7. Emotional Scoring System

The emotional scoring system was initially broader, then refined.

Initial framework:

- Calm
- Joy
- Inspiration
- Security
- Comfort
- Enchantment
- Serenity
- Admiration

Final framework:

- Calm
- Joy
- Inspiration
- Security
- Enchantment
- Admiration

Actions completed:

- created rule-based formulas from visual features
- mapped visual properties to emotional categories
- removed Comfort because it overlapped with Security
- removed Serenity because it overlapped with Calm
- updated frontend score cards to six emotions
- updated radar chart labels and datasets
- updated backend response objects
- updated aggregation logic
- updated PDF score sections
- updated goal parsing and goal responses
- removed old Comfort and Serenity references from active code

### 8. Single-Image Analysis Workflow

The single-image workflow was implemented first.

Actions completed:

- frontend sends one `/analyze` request
- backend calculates six emotional scores
- backend generates a summary
- backend generates goal-oriented interpretation
- backend generates suggestions
- frontend displays scores, chart, feature metadata, summary, goal interpretation, and suggestions
- export buttons become available after analysis

### 9. Multi-Image Analysis Workflow

The app was then expanded to support multiple images from the same project.

Actions completed:

- sends one `/analyze` request per uploaded image
- preserves image names and indexes
- stores individual analysis results
- averages six emotional scores
- averages visual features
- combines summaries
- deduplicates suggestions
- creates image comparison tables
- displays per-image details
- keeps multi-image PDF export working

### 10. Goal-Oriented Interpretation Improvements

The desired emotional outcome system was corrected to work across the full single-image and multi-image workflow.

Actions completed:

- preserved `desiredOutcome` at the start of analysis
- sent `desiredOutcome` with every `/analyze` request
- stored it in single-image results
- stored it in aggregated multi-image results
- generated project-level goal responses
- prevented empty `goalResponse` values from overwriting valid content
- added frontend fallback generation
- added backend fallback generation for PDF reports
- kept the same interpretation visible in the UI and PDF

Supported target phrases are now English-only.

### 11. Radar Chart and Visualization

The radar chart was introduced with Chart.js to visualize the emotional profile.

Actions completed:

- created radar chart labels for the six final emotions
- displayed current emotional scores
- displayed target emotional scores when a goal is provided
- updated colors so the target profile is black
- adjusted current profile colors toward neutral grey
- removed the extra visible `Current profile` and `Target profile` labels under the chart
- kept the radar as a single chart instance
- preserved emotional scoring logic while changing only visual styling

### 12. Results Layout Stabilization

The result layout was improved after overlap issues appeared with different image counts, screen sizes, text lengths, and suggestion lengths.

Actions completed:

- converted the result area to named CSS grid zones
- separated metadata, radar, score cards, comparison, content, and suggestions
- removed rigid score-card heights
- made the six-score grid responsive
- added text wrapping for long summaries and suggestions
- added horizontal scrolling for comparison tables
- stabilized image preview containers
- disabled the internal Chart.js legend to avoid chart compression
- cleaned up malformed adjacent HTML tags
- improved mobile breakpoints

### 13. PDF Report Generation

PDF export was implemented with PDFKit and later improved.

Actions completed:

- added `/report`
- generated downloadable PDF files
- added project overview
- added desired emotional outcome
- added aggregated emotional scores
- added project summary
- added goal-oriented interpretation
- added individual image analyses
- added design suggestions
- embedded uploaded images directly into the PDF
- created a dedicated Project Images section
- preserved image aspect ratio
- resized images to fit within page margins
- added page breaks when needed
- advanced PDFKit cursor position after each image
- prevented images from overlapping text
- removed Comfort and Serenity from all PDF score sections

### 14. Export Systems

Two export systems were implemented:

- JSON export
- PDF export

JSON export stores the analysis data in a downloadable file.

PDF export sends:

- aggregated scores
- summary
- goal response
- suggestions
- desired outcome
- individual analyses
- uploaded image names
- uploaded Base64 image data

### 15. History System

The frontend uses `localStorage` to keep recent analyses.

Actions completed:

- saved recent analysis summaries
- stored timestamps
- stored image count
- stored target emotional outcome
- stored scores and suggestions
- allowed users to reload a previous analysis
- allowed users to delete history items

### 16. Language and Interface Cleanup

The visible frontend was converted fully to English.

Actions completed:

- changed document language to `en`
- translated comparison labels
- translated table headers
- translated summary and goal labels
- removed remaining French UI text
- removed French goal keywords from frontend target parsing
- removed the descriptive sentence under the main title

### 17. Documentation Updates

The documentation was rewritten and aligned with the current application.

Updated documents:

- `README.md`
- `Docs/API.md`
- `Docs/Explain app.md`
- `Docs/Diagrams.md`
- `Docs/ACADEMIC_PAPER.md`
- `Docs/AUTHORSHIP_AND_PROCESS.md`

Documentation now reflects:

- six-emotion framework
- render-focused analysis
- four-image upload limit
- 50MB backend payload limit
- PDF image embedding
- English frontend
- stable responsive layout
- goal-oriented interpretation workflow

### 18. Verification and Testing

Throughout development, the project was checked with:

- frontend inline script parsing through Node
- backend syntax checks with `node --check server.js`
- direct `/analyze` requests
- direct `/report` requests
- PDF response validation
- global searches for obsolete references

Key verified behaviors:

- frontend scripts parse correctly
- backend syntax is valid
- `/analyze` returns only six emotions
- `/report` returns a valid PDF
- uploaded images can be embedded in PDF reports
- multi-image analysis remains functional
- maximum four-image upload limit remains active
- old Comfort and Serenity references were removed from active code

## Technical Implementation

### Frontend

File: `index.html`

The frontend uses:

- HTML
- CSS
- vanilla JavaScript
- Canvas API
- FileReader API
- Chart.js
- localStorage

Main responsibilities:

- upload validation
- maximum 4 image limit
- image previews
- visual feature extraction
- multi-image request handling
- score aggregation
- radar chart rendering
- UI layout
- JSON export
- PDF request construction

### Backend

File: `server.js`

The backend uses:

- Node.js
- Express
- PDFKit

Main responsibilities:

- serving the static frontend
- `/health`
- `/analyze`
- `/report`
- feature sanitization
- six-emotion scoring
- goal response generation
- suggestion generation
- PDF generation
- embedded image layout in PDFs

## PDF Generation

The PDF report was improved to include uploaded images directly. Images are placed only in a dedicated Project Images section. The layout preserves aspect ratio, fits images inside page margins, adds page breaks when needed, and advances PDFKit cursor position to prevent overlap with text sections.

## Goal-Oriented Interpretation

The desired outcome is preserved throughout the workflow:

- sent with every `/analyze` request
- stored in single-image and multi-image results
- used for project-level aggregation
- included in PDF export
- used as a fallback source if `goalResponse` is missing

Supported English goals include:

- more calm
- more joy
- more inspiration
- more security
- more enchantment
- more admiration
- less anxiety
- less stress

## Documentation Updates

The documentation was updated to reflect:

- six-emotion framework
- render-only active analysis mode
- 4-image upload limit
- 50MB JSON payload limit
- embedded PDF image support
- English-only frontend text
- stable responsive layout

## Development Notes

The project remains intentionally lightweight:

- no frontend build step
- no database
- no external AI model dependency
- no persistent server-side image storage

The analysis is rule-based and should be read as a design-support prototype rather than an empirical measurement system.

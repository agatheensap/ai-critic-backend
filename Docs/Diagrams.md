# Diagrams and Formulas

This document summarizes the active AI Architectural Critic workflow, the six-emotion model, and the render-focused scoring formulas.

## System Flow

```mermaid
flowchart TD
    A[User uploads 1 to 4 images] --> B[Frontend previews images]
    B --> C[Canvas extracts visual features]
    C --> D[POST /analyze per image]
    D --> E[Backend sanitizes features]
    E --> F[Render-focused scoring formulas]
    F --> G[Six emotional scores]
    G --> H[Summary, goal response, suggestions]
    H --> I[Frontend aggregates multi-image results]
    I --> J[Radar chart and score cards]
    I --> K[Comparison tables]
    I --> L[PDF export]
    L --> M[POST /report]
    M --> N[PDFKit report with embedded images]
```

## Active Emotion Set

```mermaid
mindmap
  root((Six Emotional Dimensions))
    Calm
    Joy
    Inspiration
    Security
    Enchantment
    Admiration
```

## Visual Features

```mermaid
flowchart LR
    IMG[Image] --> CANVAS[Canvas sampling]
    CANVAS --> B[Brightness]
    CANVAS --> C[Contrast]
    CANVAS --> W[Warmth]
    CANVAS --> S[Saturation]
    CANVAS --> H[Hue]
    CANVAS --> L[Lightness]
    CANVAS --> SH[Sharpness]
    CANVAS --> E[Entropy]
    CANVAS --> U[Unique Colors]
```

## Render-Focused Scoring Formulas

All feature values are normalized to 0-100. `NOT x` means `100 - x`.

| Emotion | Formula Summary | Interpretation |
| --- | --- | --- |
| Calm | brightness + NOT contrast + warmth + NOT saturation + lightness + NOT entropy + NOT sharpness + NOT unique colors | Quiet, legible, visually controlled |
| Joy | brightness + warmth + saturation + lightness + entropy + unique colors + yellow hue + NOT contrast | Bright, warm, open, positive |
| Inspiration | brightness + contrast + saturation + warmth + sharpness + entropy + unique colors | Bold, clear, stimulating |
| Security | brightness + warmth + NOT contrast + NOT saturation + lightness + NOT entropy + NOT sharpness + NOT unique colors | Stable, reassuring, legible |
| Enchantment | brightness + contrast + saturation + entropy + unique colors + sharpness + warmth | Atmospheric, layered, memorable |
| Admiration | brightness + contrast + saturation + sharpness + entropy + unique colors + warmth | Refined, distinctive, intentional |

## Backend Analysis Flow

```mermaid
flowchart TD
    A[POST /analyze] --> B{imageBase64 present?}
    B -->|No| C[400 Missing imageBase64]
    B -->|Yes| D[Sanitize visual features]
    D --> E[buildRenderResponse]
    E --> F[Calculate six scores]
    F --> G[buildRenderSummary]
    F --> H[buildGoalResponse]
    F --> I[buildRenderSuggestions]
    G --> J[JSON response]
    H --> J
    I --> J
```

## Multi-Image Aggregation

```mermaid
flowchart TD
    A[Individual analyses] --> B[Average six emotion scores]
    A --> C[Average visual features]
    A --> D[Combine summaries]
    A --> E[Deduplicate suggestions]
    B --> F[Project-level analysis]
    C --> F
    D --> F
    E --> F
    F --> G[Radar chart]
    F --> H[Comparison table]
    F --> I[PDF payload]
```

## PDF Report Structure

```mermaid
flowchart TD
    A[PDF Report] --> B[Title]
    A --> C[Project Overview]
    A --> D[Project Images]
    A --> E[Desired Emotional Outcome]
    A --> F[Aggregated Emotional Scores]
    A --> G[Project Summary]
    A --> H[Goal-Oriented Interpretation]
    A --> I[Individual Image Analyses]
    A --> J[Design Suggestions]
```

## PDF Image Placement

```mermaid
flowchart TD
    A[reportImages data URIs] --> B[Normalize image data]
    B --> C[Decode Buffer]
    C --> D[Measure image with PDFKit]
    D --> E[Fit within page margins]
    E --> F{Enough vertical space?}
    F -->|No| G[Add page]
    F -->|Yes| H[Draw caption and image]
    G --> H
    H --> I[Advance PDF cursor below image]
```

## Goal-Oriented Interpretation

```mermaid
flowchart TD
    A[desiredOutcome] --> B[Parse supported English phrases]
    B --> C{Recognized target?}
    C -->|Yes| D[Generate targeted interpretation]
    C -->|No| E[Fallback text using raw goal]
    D --> F[Display in UI and PDF]
    E --> F
```

Supported target phrases:

- more calm
- more joy
- more inspiration
- more security
- more enchantment
- more admiration
- less anxiety
- less stress

## Frontend Layout

```mermaid
flowchart TD
    A[Results Body] --> B[Visual Feature Cards]
    A --> C[Radar Chart]
    A --> D[Six Score Cards]
    A --> E[Image Comparison]
    A --> F[Summary and Goal Cards]
    A --> G[Design Suggestions]
```

The results layout uses CSS grid areas to keep sections stable across screen sizes and content lengths.

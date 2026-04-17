---
name: design-graphics
description: Compose branded graphics — quote cards, carousel slides, social headers, newsletter inline graphics — from templates
when_to_use: >
  User needs pull-quote cards, a LinkedIn document / Instagram carousel,
  newsletter inline images, social headers, or any templated branded composite.
  Not for thumbnails (use generate-thumbnail) or raw AI images (use generate-visuals).
tier: extension
---

# Design Graphics

Templated composition. Generate branded, on-style graphics at scale — quote cards, carousels, newsletter graphics, social headers.

## Purpose

Branded visuals need consistency. Generating from a template ensures color, font, and layout match across every asset. This skill uses Figma templates, Remotion compositions, or programmatic image builders — and respects the creator's `memory/creative-style/brand.yaml`.

## How It Works

### Path A: Figma API (preferred if creator has brand templates)

1. Creator has a Figma file with pre-built templates (quote card, carousel slide 1, slide 2, etc.), exposed via Figma API.
2. Duplicate template node via REST API:
   ```bash
   curl -H "X-Figma-Token: $FIGMA_TOKEN" \
     "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=123:456"
   ```
3. Figma doesn't have a text-update REST endpoint; use **Figma plugins** (TypeScript) to fill text and render, OR use FigJam/Figma via their Connect API (enterprise).
4. Export nodes as PNG/SVG:
   ```bash
   curl -H "X-Figma-Token: $FIGMA_TOKEN" \
     "https://api.figma.com/v1/images/$FILE_KEY?ids=123:456&format=png&scale=2"
   ```

### Path B: Remotion (programmatic, React-based)

Best for dynamic content (data-driven templates, per-post variation):

```tsx
const QuoteCard = ({quote, author, bg}) => (
  <AbsoluteFill style={{backgroundColor: bg}}>
    <div style={{
      fontFamily: 'Inter', fontSize: 72, fontWeight: 900,
      color: 'white', padding: 80, lineHeight: 1.1,
    }}>
      "{quote}"
    </div>
    <div style={{position:'absolute', bottom:60, right:80, fontSize:32}}>
      — {author}
    </div>
  </AbsoluteFill>
);
```

Render as still image:
```bash
npx remotion still src/index.ts QuoteCard quote.png \
  --props='{"quote":"...","author":"Jane Doe","bg":"#0B1220"}'
```

### Path C: PIL / Sharp (Python/Node, minimal dependencies)

For one-offs, no framework overhead:

```python
from PIL import Image, ImageDraw, ImageFont
BRAND_BG = "#0B1220"; BRAND_FG = "#FFD700"
card = Image.new("RGB", (1080, 1080), BRAND_BG)
draw = ImageDraw.Draw(card)
font_q = ImageFont.truetype("Inter-Black.ttf", 64)
font_a = ImageFont.truetype("Inter-Regular.ttf", 28)
# Word-wrap helper omitted for brevity
draw.text((80, 120), wrap(quote, 18), font=font_q, fill=BRAND_FG)
draw.text((80, 960), f"— {author}", font=font_a, fill="#9AA0A6")
card.save("out.png", quality=92)
```

### Path D: Canva API (enterprise only as of 2026)

Canva Connect API — available on Enterprise plans. REST endpoints for duplicating templates and replacing variables. If unavailable, skip.

## Supported graphic types

| Type | Size | Template elements |
|---|---|---|
| Quote card (square) | 1080x1080 | quote, attribution, brand mark |
| Quote card (4:5) | 1080x1350 | same |
| Carousel slide | 1080x1350 | slide number, headline, body, CTA on last |
| LinkedIn doc page | 1080x1080 or 1080x1350 | page number, headline, body |
| Newsletter inline | 1200x630 | hero, headline, byline |
| Social header | per-platform | logo, tagline, brand colors |
| Podcast episode art | 3000x3000 | episode number, guest, title |

## Brand config

```yaml
# memory/creative-style/brand.yaml
palette:
  primary: "#0B1220"
  accent: "#FFD700"
  text: "#FFFFFF"
  subtle: "#9AA0A6"
fonts:
  headline: Inter
  headline_weight: 900
  body: Inter
  body_weight: 400
  mono: JetBrains Mono
logo:
  light: assets/logo-light.svg
  dark: assets/logo-dark.svg
corner_radius: 12
padding_default: 80
```

## Carousel-specific

LinkedIn / Instagram carousels — 8-10 slides optimal:

1. **Hook slide** — promise + swipe cue
2-N. **Value slides** — one idea per slide; slide number in corner
N+1. **Close slide** — recap + CTA (follow / save / share)

Export all slides → combine into PDF (for LinkedIn documents):
```bash
convert slide_*.png -density 150 carousel.pdf
```

For IG: export each as JPG; upload sequence.

## Autonomy behavior

- **L1** — Render preview batch, get creator approval on design before final render.
- **L2** — Use defaults from `brand.yaml`, auto-render set, present for one revision pass.
- **L3** — Full auto-render; creator reviews final set before publishing.

## Integration

- Input: content (quotes, carousel script, newsletter sections), brand.yaml, template choice
- Composes **act** (Figma / Remotion / PIL) + **remember** (brand config, template registry)
- Downstream: `publish`, or manual upload
- Upstream: `segment-transcript` (quotes), `write-article` (newsletter graphics), `create-thread` (thread graphics)

## Failure modes

- **Text overflow** — word-wrap + auto-scale; never clip
- **Brand drift** — always load `brand.yaml`; never use default fonts/colors
- **Inconsistent carousel** — same layout across slides (except hook + close); inconsistency = amateur
- **Emoji render inconsistency** — different platforms render emoji differently; for true consistency, use SVG icons in place of emoji in graphics

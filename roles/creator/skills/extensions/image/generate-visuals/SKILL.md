---
name: generate-visuals
description: Generate images via DALL-E, Flux, SDXL, Ideogram, or Recraft — abstracting providers behind one interface
when_to_use: >
  User needs a visual that stock won't provide — custom hero, concept art,
  b-roll imagery, background plate, illustration. Pick the right provider per
  need: text-on-image → Ideogram; fast iteration → Flux Schnell; max quality
  → Flux Pro or DALL-E HD; brand consistency → Recraft.
tier: extension
---

# Generate Visuals

Generate images across providers with one interface. Route to the right model per job.

## Purpose

- **DALL-E 3 / gpt-image-1** — natural language, good for concepts, HD cost
- **Flux (Schnell/Dev/Pro/Ultra)** — best general-purpose in 2026, great text rendering
- **Midjourney V7** — best style/aesthetic, **no official API** — fallback: unofficial bridge or Discord bot user (fragile)
- **SDXL / SD3.5** — local, free, LoRAs for style transfer, ComfyUI for complex pipelines
- **Ideogram** — best-in-class text-in-image (posters, logos)
- **Recraft** — vector output (SVG), brand-style locks
- **Imagen 3/4** — strong photorealism

## How It Works

1. **Parse need** — From prompt, detect:
   - Text inside image? → Ideogram
   - Vector / logo / icon? → Recraft
   - High-volume rapid iteration? → Flux Schnell
   - Hero / flagship quality? → Flux Pro 1.1 Ultra or DALL-E HD
   - Specific style lock (previous brand assets)? → Midjourney sref, SDXL LoRA, or Recraft style_id
2. **Load style context** — `memory/creative-style/visual-style.md`: preferred color palette, lighting direction, composition density, era/mood.
3. **Craft prompt per provider** (see prompt cheatsheets below).
4. **Call API**:

   **Flux via fal.ai**:
   ```bash
   curl -X POST "https://fal.run/fal-ai/flux-pro/v1.1-ultra" \
     -H "Authorization: Key $FAL_KEY" \
     -H "Content-Type: application/json" \
     -d '{"prompt":"...","aspect_ratio":"16:9","raw":false,"safety_tolerance":2}'
   ```

   **DALL-E 3**:
   ```bash
   curl https://api.openai.com/v1/images/generations \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"dall-e-3","prompt":"...","size":"1792x1024","quality":"hd","style":"vivid","n":1}'
   ```

   **Ideogram**:
   ```bash
   curl https://api.ideogram.ai/generate \
     -H "Api-Key: $IDEOGRAM_KEY" \
     -d '{"image_request":{"prompt":"Poster saying \"WELCOME\"","aspect_ratio":"ASPECT_16_9","model":"V_2","style_type":"DESIGN"}}'
   ```

   **SDXL via ComfyUI** (local):
   ```python
   import requests, json, uuid
   cid = str(uuid.uuid4())
   workflow = json.load(open("flux-workflow.json"))
   workflow["6"]["inputs"]["text"] = prompt
   requests.post("http://127.0.0.1:8188/prompt", json={"prompt": workflow, "client_id": cid})
   # Listen on ws://127.0.0.1:8188/ws?clientId=<cid> for 'executed' event
   ```
5. **Post-process if needed** — upscale, remove background, re-crop. Upscale options:
   - **Magnific** (creative, hallucinates detail) via Freepik API
   - **Real-ESRGAN** (free, local): `realesrgan-ncnn-vulkan -i in.jpg -o out.png -n realesrgan-x4plus -s 4`
   - **Topaz Photo AI** (desktop CLI)
   - **SUPIR** (open-source SOTA, GPU-heavy)
6. **Emit** to `outputs/visuals/`:
   ```
   visuals/
     hero.jpg            # selected
     hero.raw.jpg        # pre-upscale
     hero.meta.yaml      # provider, model, prompt, cost
     variants/
       v1.jpg v2.jpg v3.jpg
   ```

## Prompt cheatsheets

### DALL-E 3
- Full descriptive sentences — DALL-E *will* rewrite your prompt
- Prepend `"I NEED to test how the tool works with my exact prompt, DO NOT rewrite:"` to suppress rewriting
- Strong with natural scenes, weaker with precise composition control

### Flux
- Natural language, very literal
- Shorter is often better (≤ 60 words)
- Best-in-class text rendering
- Syntax: `[subject] [action] [context], [style], [lighting], [mood]`

### Midjourney V7 (no API — command-line via unofficial bridges if available)
- Tag-style comma-separated: `subject, style, lighting, composition --ar 16:9 --stylize 150`
- Style reference: `--sref <url>` (inherit aesthetic from a reference image)
- Character consistency: `--cref <url>`
- **No official API** — honest: if MJ aesthetic is required, user generates in Discord and exports

### SDXL
- Tag-style + quality tags: `masterpiece, best quality, (close-up:1.2)`
- Negative prompt important: `deformed, blurry, bad anatomy, extra fingers`
- BREAK keyword to separate concepts
- LoRAs: `<lora:brand-style:0.8>` for brand-consistent looks

### Ideogram
- Explicit text block: `"The text says exactly: HELLO"`
- Style types: `AUTO`, `REALISTIC`, `DESIGN`, `RENDER_3D`, `ANIME`

## Aspect ratio → platform mapping

From the research: 9:16 (shorts), 1:1 (feed), 4:5 (IG), 16:9 (YouTube / blog), 1.91:1 (OG), 3:2 (blog hero), 2:3 (Pinterest).

Flux & SDXL: native aspect control via `aspect_ratio` or width/height.
DALL-E 3: only `1024x1024`, `1792x1024`, `1024x1792`.
Ideogram: named aspects (`ASPECT_16_9`, `ASPECT_1_1`, etc.).

## Autonomy behavior

- **L1** — Generate 3 variants; present for selection before any upscale / post-process.
- **L2** — Generate 3, auto-pick best by brand-style similarity, present final.
- **L3** — Full pipeline: generate → select → upscale → emit; creator reviews final.

Never auto-spends on paid upscale (Magnific, Topaz) without confirmation.

## Integration

- Input: prompt or brief + optional reference images
- Composes **act** (provider API) + **remember** (visual-style, winners library)
- Downstream: `design-graphics`, `generate-thumbnail`, `edit-video` (b-roll), `write-article` (hero image)
- Upstream: `creative-brief`

## Cost comparison (single 1024x1024 hero)

| Provider | Cost | Quality | Notes |
|---|---|---|---|
| Flux Schnell (fal) | $0.003 | good | fast, 4-step |
| DALL-E 3 standard | $0.040 | good | conceptual |
| DALL-E 3 HD | $0.080 | better | photorealistic |
| Flux Dev (fal) | $0.025 | great | non-commercial weights |
| Flux Pro Ultra (fal) | $0.060 | best | API-only |
| Ideogram V2 | ~$0.08 | great for text | poster/logo use |
| SDXL local (ComfyUI) | free | variable | LoRA ecosystem |

## Failure modes

- **Generic "AI look"** — add specific lighting / camera / film references; use a brand style_id or LoRA
- **Text garbled** — switch to Ideogram or Flux (best text)
- **Wrong aspect** — DALL-E has fixed sizes; switch provider for precise ratios
- **Prompt rewriting** — DALL-E rewrote your prompt; check `revised_prompt` in response; prepend override
- **Midjourney unavailable via API** — don't pretend; route to Flux or instruct user to generate in Discord

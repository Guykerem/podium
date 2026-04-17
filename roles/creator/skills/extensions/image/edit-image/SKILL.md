---
name: edit-image
description: Edit existing images — background removal, inpainting, outpainting, style transfer, upscale, text-in-image edits
when_to_use: >
  User has an image that needs modification — remove background, change a
  detail, extend the canvas, restyle, upscale, add/remove an object.
  Covers both instruction-based editing (Flux Kontext) and classic tools (PIL/Sharp).
tier: extension
---

# Edit Image

Modify existing imagery. Background removal, object add/remove, inpainting, outpainting, upscale, restyle.

## Purpose

Generating new images is one thing. Fixing, extending, or remixing existing ones is a different craft. This skill covers the full image-edit surface.

## How It Works

### 1. Background removal

- **remove.bg API** — fastest, highest quality:
  ```bash
  curl -X POST https://api.remove.bg/v1.0/removebg \
    -H "X-Api-Key: $REMOVEBG_KEY" \
    -F image_file=@in.jpg -F size=auto --output out.png
  ```
- **Photoroom API** — similar, includes shadows
- **Local `rembg`** (Python, free): `rembg i in.jpg out.png -m u2net`
- **Apple Vision** (macOS): `VNGenerateForegroundInstanceMaskRequest`

### 2. Instruction-based editing — Flux Kontext

Best-in-class for "keep everything else identical" edits:

```bash
curl -X POST "https://fal.run/fal-ai/flux-pro/kontext" \
  -H "Authorization: Key $FAL_KEY" \
  -d '{
    "image_url": "https://.../in.jpg",
    "prompt": "change the shirt color to red, keep everything else identical",
    "guidance_scale": 3.5
  }'
```

Good prompts:
- "Change X to Y, keep everything else identical"
- "Remove the coffee cup, restore the table behind it"
- "Add a warm afternoon lighting, same composition"

Bad prompts (will restyle whole image):
- "Make it more vibrant" (too vague)
- "Change the mood" (too global)

### 3. Inpainting (local) — SD / SDXL with mask

1. User specifies region (bounding box or mask)
2. Provide mask to ComfyUI inpainting workflow or Auto1111 API:
   ```bash
   curl -X POST http://localhost:7860/sdapi/v1/img2img \
     -H "Content-Type: application/json" \
     -d '{"init_images":["<base64>"],"mask":"<base64-mask>","prompt":"a vase of flowers","denoising_strength":0.8,"inpainting_fill":1}'
   ```

### 4. Outpainting (extend canvas)

- **Adobe Firefly Generative Expand** (if integrated)
- **Flux Fill / Outpaint** on fal.ai
- **DALL-E Edit** (`POST /v1/images/edits`, pass an image + mask with transparent extension area)
- SDXL outpainting workflow in ComfyUI

### 5. Upscaling

| Tool | Quality | Speed | Cost |
|---|---|---|---|
| Real-ESRGAN (local) | good | fast | free |
| Magnific AI (Freepik API) | great, hallucinates detail | slow | $0.10+/image |
| Topaz Photo AI (desktop) | great, preserves | fast | $199 one-time |
| SUPIR (local) | SOTA open | slow, GPU-heavy | free |
| clarity-upscaler (Replicate) | Magnific-clone | medium | $0.025 |

Real-ESRGAN CLI:
```bash
realesrgan-ncnn-vulkan -i in.jpg -o out.png -n realesrgan-x4plus -s 4
```

### 6. Style transfer / restyle

- Flux Kontext: `"restyle this in the aesthetic of [reference style]"`
- SDXL img2img with low denoising strength (0.3-0.5) + style LoRA
- Recraft: apply brand style_id to an uploaded image

### 7. Classic edits — deterministic

For crop, resize, rotate, color shifts, text overlay: **PIL / Sharp / ImageMagick** — fast, free, predictable:

```python
from PIL import Image, ImageDraw, ImageFont
im = Image.open("in.jpg").convert("RGB")
im.thumbnail((1920, 1080))
draw = ImageDraw.Draw(im)
font = ImageFont.truetype("Inter-Bold.ttf", 72)
draw.text((100, 100), "HEADLINE", font=font, fill="white",
          stroke_width=4, stroke_fill="black")
im.save("out.jpg", quality=92)
```

ImageMagick:
```bash
convert in.jpg -resize 1200x -quality 90 out.jpg
magick in.jpg -gravity center -crop 1200x628+0+0 +repage out.jpg
```

## Output

```
edits/<slug>/
  in.jpg                 # original preserved
  out.jpg                # edited
  out.meta.yaml          # edit type, provider, prompt, cost, preserves
```

## Autonomy behavior

- **L1** — Preview the edit (low-res), ask creator to approve before committing / paying for HD version.
- **L2** — Auto-apply deterministic edits (bg removal, resize, crop). Paid AI edits (Kontext, inpaint) get approval first.
- **L3** — Full auto. Cost-capped per job via `memory/tool-preferences/budgets.yaml`.

## Integration

- Input: source image + edit spec
- Composes **act** (API / local tool) + **remember** (edit history)
- Downstream: `generate-thumbnail`, `design-graphics`, `edit-video` (for poster frames / intro cards)
- Upstream: `generate-visuals` (for assets that need post-processing)

## Failure modes

- **Kontext over-edits** — drift in unrelated areas. Add "keep everything else identical" to prompt; reduce `guidance_scale` to 2.5.
- **Inpaint seams visible** — feather the mask, raise denoising strength in seam region, or run two passes
- **Upscaled but hallucinated** — Magnific adds detail that may not match reality (e.g., inventing textures). For fidelity, use Topaz or Real-ESRGAN.
- **Transparent PNG artifacts on white background** — when compositing, check for haloing; remove.bg has an `alpha_matte` parameter for refined edges

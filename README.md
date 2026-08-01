# ProSnap AI

**▶️ [Try it live](https://seehiong.github.io/prosnap-ai/)** — open it on your phone, snap a product photo, and enhance it in the browser.

Snap a product photo on your phone and turn it into a professional e-commerce image — no desktop editor, no post-processing.

Selling a 3D print, a craft item or anything else online means fighting for attention with a good photo. ProSnap AI takes the phone shot you already have and relights it, cleans up the background and sharpens it, so it is ready to upload to a product listing.

It runs entirely in the browser as a static site. There is no backend and no server holding your images — your photo goes directly from your device to Google's API and the result comes straight back.

## Status

Live at **[seehiong.github.io/prosnap-ai](https://seehiong.github.io/prosnap-ai/)** and working, with one important caveat: **you need your own Google AI Studio API key.** The hosted site has no shared key — you paste your own into ⚙️ Settings on first use, and it stays in your browser. That makes this a bring-your-own-key tool rather than something you can hand to a non-technical seller. See [Limitations](#limitations).

## Features

- **Mobile-first capture** — take a photo directly from your phone's camera, or upload an existing one.
- **Real AI image enhancement** via Gemini's image models:
  - 💡 **Studio Lighting** — three-point softbox lighting with a contact shadow
  - ✂️ **Clean Background** — seamless white e-commerce backdrop
  - ✨ **Enhance Quality** — sharpen, denoise, correct white balance
  - 🏆 **Hero Shot** — reflective surface and dramatic lighting for a listing header
- **Stackable** — apply one enhancement on top of another to refine the result.
- **Hold to compare** — press and hold to see the original, so you can judge what actually changed.
- **Download the result** — save the enhanced image straight to your phone, or revert to the original.

Each prompt describes the finished photograph using real studio terminology and states that the product keeps its original shape, colour, materials, text and logos — only the lighting, background or image quality changes.

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/)
- A Google AI Studio API key — free to create at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Run locally

```bash
npm install
npm run dev
```

Open the `localhost` URL, click ⚙️ in the header, and paste your API key.
npm installsince 
## How it works

The app calls the Gemini `generateContent` endpoint with `responseModalities: ['IMAGE']`, sending your photo plus an editing prompt and receiving a new image back.

Three models are selectable in Settings, all on Google's free tier:

| Model | ID | Notes |
|---|---|---|
| Nano Banana 2 | `gemini-3.1-flash-image` | Default. Best quality, ~1K requests/day |
| Nano Banana 2 Lite | `gemini-3.1-flash-lite-image` | Fastest, ~1K requests/day |
| Nano Banana | `gemini-2.5-flash-image` | Previous generation, ~2K requests/day |

Free-tier limits change and vary per account — check your own at [aistudio.google.com/rate-limit](https://aistudio.google.com/rate-limit).

This detail matters if you plan to fork it: **ordinary vision models cannot do this.** Chat endpoints such as `gpt-4o` or the OpenRouter vision models accept an image but return *text* — a description of the photo, not an edited version. Image-to-image editing needs an image-generation model, which is why Google is the only provider offered.

## Limitations

- **Bring your own API key.** Enhancements are not free — Google bills per generated image. Check [current pricing](https://ai.google.dev/pricing) and consider a spend limit on your key.
- **Your key is stored in `localStorage`**, unencrypted, so any script on the page's origin could read it. That is an inherent trade-off of a static app with no backend. Use a key scoped to this purpose rather than your main one, and clear it when you are done.
- **Generation takes time** — expect several seconds to a minute per enhancement.
- **AI output is not deterministic.** The model is told to preserve the product exactly, but it can still drift on fine details such as text, logos or intricate patterns. **Check the result before putting it on a live listing.**

## Deployment

Pushes to `main` deploy automatically to [seehiong.github.io/prosnap-ai](https://seehiong.github.io/prosnap-ai/) via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

Forking it yourself: set **Settings → Pages → Source** to **GitHub Actions**, and update `base` in [`vite.config.js`](vite.config.js) to match your repository name — it is currently `/prosnap-ai/`, and a mismatch makes every built asset 404.

## License

[MIT](LICENSE)

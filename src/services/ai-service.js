// Image-to-image enhancement via Gemini's image generation model.
//
// Note: only Google is supported here. OpenAI/OpenRouter chat-completion
// endpoints accept an image but return text, so they cannot enhance a photo.

const IMAGE_MODEL_HOST = 'https://generativelanguage.googleapis.com/v1beta/models';

function detectMimeType(base64Image) {
  return base64Image.startsWith('iVBORw0KGgo') ? 'image/png' : 'image/jpeg';
}

/**
 * Sends an image plus an editing prompt to Gemini and returns a new image.
 * Resolves to a data URL ready to drop straight into an <img> src or a download link.
 */
export async function enhanceImage(imageStr, prompt, settings) {
  const { provider, apiKey, model } = settings;

  if (!apiKey) throw new Error(`Please provide an API key for ${provider} in the settings.`);
  if (provider !== 'Google') {
    throw new Error(
      `${provider} cannot generate images. Switch the provider to Google in Settings to enhance photos.`
    );
  }

  const base64Image = imageStr.split(',')[1];
  const url = `${IMAGE_MODEL_HOST}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: detectMimeType(base64Image), data: base64Image } }
        ]
      }
    ],
    // Without this the model replies with a text description instead of an image.
    generationConfig: { responseModalities: ['IMAGE'] }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Google API error: ${res.statusText}`);

  return extractImage(data);
}

// The REST API has shipped both snake_case and camelCase spellings of the
// inline image field, so accept either rather than depending on one.
function extractImage(data) {
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    const blob = part.inline_data || part.inlineData;
    if (blob?.data) {
      const mimeType = blob.mime_type || blob.mimeType || 'image/png';
      return `data:${mimeType};base64,${blob.data}`;
    }
  }

  // No image came back. If the model explained why, surface that instead of a generic failure.
  const explanation = parts.find((part) => part.text)?.text;
  const blockReason = data.promptFeedback?.blockReason;

  if (blockReason) throw new Error(`Request blocked by the safety filter (${blockReason}).`);
  throw new Error(explanation?.trim() || 'The model did not return an image. Try another photo or prompt.');
}

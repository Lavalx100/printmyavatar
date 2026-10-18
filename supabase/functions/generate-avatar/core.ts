export const MAX_REQUEST_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_DATA_URL_CHARS = 7 * 1024 * 1024;
const MAX_CUSTOM_PROMPT_CHARS = 500;

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SINGLE_CHARACTER_PROMPT = `Create a 3D rendered chibi style vinyl figure avatar based on the person in the reference photo.

Likeness:
- The avatar must clearly look like the same person as in the reference photo.
- Preserve the same hairstyle, hairline, and parting.
- Match the eyebrow shape, eye shape and spacing, nose, lips, and overall face structure, showing the same resemblance as the person in the photo.
- Keep the natural skin tone and same facial expression.

Style:
- Big head and small body, chibi toy proportions.
- Smooth plastic or vinyl look for skin, hair, and clothes, with soft reflections and no visible texture.
- Match eyes with subtle highlights, same nose bump, simple small mouth but adjusted to be like the person in the photo.
- Clean, minimal detailing with soft rounded edges and matching the person in the photo.

Outfit:
- Same shirt as the person in the photo.
- Same pants as the person in the photo.
- Same shoes as the person in the photo.
- Same accessories as the person in the photo.

Pose and composition:
- Full body, standing straight, arms relaxed by the sides.
- Camera straight on at about chest height.
- Plain warm off white background with soft studio lighting and gentle shadows.
- No extra objects, text, or background elements.`;

export interface GenerateAvatarPayload {
  imageUrl: string;
  isMultiplePeople: boolean;
  customPrompt?: string;
  peopleCount?: number;
}

export interface GenerateAvatarInput {
  prompt: string;
  input_image: string;
  aspect_ratio: "1:1";
  output_format: "png";
  safety_tolerance: 2;
}

interface AuthenticatedUser {
  id: string;
}

export interface GenerateAvatarDependencies {
  authenticate(request: Request): Promise<AuthenticatedUser | null>;
  consumeQuota(userId: string): Promise<boolean>;
  generate(input: GenerateAvatarInput): Promise<unknown>;
}

export function normalizeGeneratedImageUrl(output: unknown): string | null {
  const candidate = Array.isArray(output) ? output[0] : output;
  if (typeof candidate === "string") return trustedReplicateImageUrl(candidate);
  if (!candidate || typeof candidate !== "object") return null;

  const urlMember = (candidate as { url?: unknown }).url;
  const value = typeof urlMember === "function" ? urlMember.call(candidate) : urlMember;
  const url = value instanceof URL
    ? value.href
    : typeof value === "string"
      ? value
      : value && typeof value === "object" && "href" in value && typeof value.href === "string"
        ? value.href
        : null;
  return url ? trustedReplicateImageUrl(url) : null;
}

function trustedReplicateImageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const isReplicateOutput = url.hostname === "replicate.delivery" || url.hostname.endsWith(".replicate.delivery");
    return url.protocol === "https:" && isReplicateOutput ? url.href : null;
  } catch {
    return null;
  }
}

type ValidationResult =
  | { ok: true; payload: GenerateAvatarPayload }
  | { ok: false; message: string };

export function validateGenerateAvatarPayload(value: unknown): ValidationResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, message: "Request body must be a JSON object." };
  }

  const body = value as Record<string, unknown>;
  if (typeof body.imageUrl !== "string" || body.imageUrl.length === 0) {
    return { ok: false, message: "Missing required field: imageUrl" };
  }

  const imageUrl = body.imageUrl.trim();
  if (imageUrl.startsWith("data:")) {
    const dataUrlPattern = /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
    if (!dataUrlPattern.test(imageUrl) || imageUrl.length > MAX_IMAGE_DATA_URL_CHARS) {
      return { ok: false, message: "Image must be a PNG, JPEG, or WebP smaller than 5 MB." };
    }
  } else {
    try {
      const url = new URL(imageUrl);
      const isReplicateOutput = url.hostname === "replicate.delivery" || url.hostname.endsWith(".replicate.delivery");
      if (url.protocol !== "https:" || !isReplicateOutput || imageUrl.length > 2048) {
        return { ok: false, message: "Image URL must be an HTTPS Replicate output URL." };
      }
    } catch {
      return { ok: false, message: "Image URL is invalid." };
    }
  }

  const isMultiplePeople = body.isMultiplePeople ?? false;
  if (typeof isMultiplePeople !== "boolean") {
    return { ok: false, message: "isMultiplePeople must be a boolean." };
  }

  let peopleCount: number | undefined;
  if (body.peopleCount !== undefined && body.peopleCount !== null) {
    const countText = String(body.peopleCount);
    if (!/^[2-5]$/.test(countText)) {
      return { ok: false, message: "peopleCount must be between 2 and 5." };
    }
    peopleCount = Number(countText);
  }

  let customPrompt: string | undefined;
  if (body.customPrompt !== undefined && body.customPrompt !== null) {
    if (typeof body.customPrompt !== "string") {
      return { ok: false, message: "customPrompt must be text." };
    }
    customPrompt = body.customPrompt.trim();
    if (!customPrompt || customPrompt.length > MAX_CUSTOM_PROMPT_CHARS) {
      return { ok: false, message: `customPrompt must contain 1 to ${MAX_CUSTOM_PROMPT_CHARS} characters.` };
    }
  }

  return {
    ok: true,
    payload: { imageUrl, isMultiplePeople, peopleCount, customPrompt },
  };
}

function buildMultiplePeoplePrompt(count?: number): string {
  const countText = count ? `EXACTLY ${count}` : "ALL the";
  const criticalInstruction = count
    ? `CRITICAL: There are EXACTLY ${count} people in the reference photo. You MUST generate EXACTLY ${count} avatars, no more and no fewer. Count them: ${Array.from({ length: count }, (_, index) => index + 1).join(", ")}. Show all ${count} avatars standing side by side in the same image.`
    : "CRITICAL: Generate a separate chibi avatar for EACH person shown. Show all avatars standing side by side in the same image.";

  return `Create multiple 3D rendered chibi style vinyl figure avatars based on ${countText} people in the reference photo.

${criticalInstruction}

Likeness:
- Each avatar must clearly look like the corresponding person in the reference photo.
- Preserve the same hairstyle, hairline, and parting for each person.
- Match the eyebrow shape, eye shape and spacing, nose, lips, and overall face structure, showing the same resemblance as the person in the photo.
- Keep the natural skin tone and same facial expression for each person.

Style:
- Big head and small body, chibi toy proportions for each avatar.
- Smooth plastic or vinyl look for skin, hair, and clothes, with soft reflections and no visible texture.
- Match eyes with subtle highlights, same nose bump, simple small mouth but adjusted to be like the person in the photo.
- Clean, minimal detailing with soft rounded edges and matching the person in the photo.

Outfit:
- Same shirt, pants, shoes, and accessories as each person in the reference photo.

Pose and composition:
- Full body for each avatar, standing straight, arms relaxed by the sides.
- All avatars standing side by side in a row.
- Camera straight on at about chest height.
- Plain warm off white background with soft studio lighting and gentle shadows.
- No extra objects, text, or background elements.`;
}

function buildPrompt(payload: GenerateAvatarPayload): string {
  if (payload.customPrompt) {
    return `You are modifying an existing 3D chibi avatar. Make ONLY the following specific change to the avatar shown in the reference image, keeping everything else EXACTLY the same (same pose, same background, same lighting, same style, same proportions):

${payload.customPrompt}

CRITICAL: Change ONLY what is explicitly requested above. Keep all other aspects of the avatar identical to the reference image.`;
  }

  return payload.isMultiplePeople
    ? buildMultiplePeoplePrompt(payload.peopleCount)
    : SINGLE_CHARACTER_PROMPT;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function handleGenerateAvatar(
  request: Request,
  dependencies: GenerateAvatarDependencies,
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BYTES) {
    return jsonResponse({ error: "Request is too large." }, 413);
  }

  try {
    const user = await dependencies.authenticate(request);
    if (!user?.id) {
      return jsonResponse({ error: "Sign in to generate an avatar." }, 401);
    }

    const bodyBytes = await request.arrayBuffer();
    if (bodyBytes.byteLength > MAX_REQUEST_BYTES) {
      return jsonResponse({ error: "Request is too large." }, 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(new TextDecoder().decode(bodyBytes));
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, 400);
    }

    const validation = validateGenerateAvatarPayload(body);
    if (!validation.ok) {
      return jsonResponse({ error: validation.message }, 400);
    }

    if (!(await dependencies.consumeQuota(user.id))) {
      return jsonResponse({ error: "Generation limit reached. Please try again later." }, 429);
    }

    const { payload } = validation;
    const output = normalizeGeneratedImageUrl(await dependencies.generate({
      prompt: buildPrompt(payload),
      input_image: payload.imageUrl,
      aspect_ratio: "1:1",
      output_format: "png",
      safety_tolerance: 2,
    }));
    if (!output) throw new Error("Replicate returned an unsupported image output");
    return jsonResponse({ imageUrl: output }, 200);
  } catch (error) {
    console.error("Avatar generation failed:", error instanceof Error ? error.name : "Unknown error");
    return jsonResponse({ error: "Failed to generate avatar." }, 500);
  }
}

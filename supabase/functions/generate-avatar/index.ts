import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

const buildMultiplePeoplePrompt = (count?: number) => {
  const countText = count ? `EXACTLY ${count}` : 'ALL the';
  const criticalInstruction = count 
    ? `CRITICAL: There are EXACTLY ${count} people in the reference photo. You MUST generate EXACTLY ${count} avatars, no more and no fewer. Count them: ${Array.from({length: count}, (_, i) => i + 1).join(', ')}. Show all ${count} avatars standing side by side in the same image.`
    : `CRITICAL: Generate a separate chibi avatar for EACH person shown. Show all avatars standing side by side in the same image.`;
  
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
- Same shirt as the person in the photo for each avatar.
- Same pants as the person in the photo for each avatar.
- Same shoes as the person in the photo for each avatar.
- Same accessories as the person in the photo for each avatar.

Pose and composition:
- Full body for each avatar, standing straight, arms relaxed by the sides.
- Make sure the number of avatars generated match the number of people in the image.
- All avatars standing side by side in a row.
- Camera straight on at about chest height.
- Plain warm off white background with soft studio lighting and gentle shadows.
- No extra objects, text, or background elements.`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    const REPLICATE_MODEL = Deno.env.get("REPLICATE_MODEL") ?? "black-forest-labs/flux-kontext-pro";
    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    const replicate = new Replicate({
      auth: REPLICATE_API_TOKEN,
    });

    const body = await req.json();
    const { imageUrl, isMultiplePeople = false, customPrompt, peopleCount } = body;

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required field: imageUrl" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log("Avatar generation requested.");

    // Use refined prompt if this is a modification, otherwise use the base prompt
    let prompt;
    if (customPrompt) {
      // For modifications, use a prompt that preserves everything except the requested change
      prompt = `You are modifying an existing 3D chibi avatar. Make ONLY the following specific change to the avatar shown in the reference image, keeping everything else EXACTLY the same (same pose, same background, same lighting, same style, same proportions):

${customPrompt}

CRITICAL: Change ONLY what is explicitly requested above. Keep all other aspects of the avatar identical to the reference image.`;
    } else {
      prompt = isMultiplePeople ? buildMultiplePeoplePrompt(peopleCount) : SINGLE_CHARACTER_PROMPT;
    }

    // Call Replicate API
    const output = await replicate.run(
      REPLICATE_MODEL,
      {
        input: {
          prompt: prompt,
          input_image: imageUrl,
          aspect_ratio: "1:1",
          output_format: "png",
          safety_tolerance: 2
        }
      }
    );

    // The output is the generated image URL
    return new Response(JSON.stringify({ imageUrl: output }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Avatar generation failed:", error instanceof Error ? error.name : "Unknown error");
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate avatar"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

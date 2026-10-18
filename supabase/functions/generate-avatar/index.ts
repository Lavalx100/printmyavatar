import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Replicate from "https://esm.sh/replicate@0.25.2";
import { handleGenerateAvatar } from "./core.ts";

function keyFromEnvironment(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const values = Object.values(JSON.parse(value) as Record<string, unknown>);
    return values.find((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return undefined;
  }
}

function publishableKey(): string | undefined {
  return Deno.env.get("SUPABASE_ANON_KEY")
    ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
    ?? keyFromEnvironment(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS"));
}

function serviceKey(): string | undefined {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    ?? Deno.env.get("SUPABASE_SECRET_KEY")
    ?? keyFromEnvironment(Deno.env.get("SUPABASE_SECRET_KEYS"));
}

serve(async (request) => handleGenerateAvatar(request, {
  authenticate: async (incomingRequest) => {
    const authorization = incomingRequest.headers.get("authorization");
    const url = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
    const key = publishableKey();
    if (!authorization?.startsWith("Bearer ") || !url || !key) return null;

    const response = await fetch(`${url}/auth/v1/user`, {
      headers: { authorization, apikey: key },
    });
    if (!response.ok) return null;
    const user = await response.json();
    return typeof user?.id === "string" ? { id: user.id } : null;
  },
  consumeQuota: async (userId) => {
    const url = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
    const key = serviceKey();
    if (!url || !key) throw new Error("Supabase server credentials are unavailable");

    const response = await fetch(`${url}/rest/v1/rpc/consume_avatar_generation_quota`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ p_user_id: userId }),
    });
    if (!response.ok) throw new Error("Rate-limit check failed");
    return (await response.json()) === true;
  },
  generate: async (input) => {
    const token = Deno.env.get("REPLICATE_API_TOKEN");
    const model = Deno.env.get("REPLICATE_MODEL") ?? "black-forest-labs/flux-kontext-pro";
    if (!token) throw new Error("REPLICATE_API_TOKEN is not set");
    const replicate = new Replicate({ auth: token });
    return await replicate.run(model, { input });
  },
}));

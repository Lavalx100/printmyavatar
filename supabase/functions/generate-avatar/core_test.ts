import {
  handleGenerateAvatar,
  normalizeGeneratedImageUrl,
  validateGenerateAvatarPayload,
  type GenerateAvatarDependencies,
} from "./core.ts";

const validPayload = {
  imageUrl: "data:image/png;base64,iVBORw0KGgo=",
  isMultiplePeople: false,
};

function dependencies(overrides: Partial<GenerateAvatarDependencies> = {}) {
  const calls = { quota: 0, generation: 0 };
  const value: GenerateAvatarDependencies = {
    authenticate: async () => ({ id: "user-1" }),
    consumeQuota: async () => { calls.quota += 1; return true; },
    generate: async () => { calls.generation += 1; return "https://replicate.delivery/output.png"; },
    ...overrides,
  };
  return { value, calls };
}

function post(body: unknown) {
  return new Request("https://function.test/generate-avatar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

Deno.test("validates supported image sources and bounds custom prompts", () => {
  const valid = validateGenerateAvatarPayload({
    ...validPayload,
    isMultiplePeople: true,
    peopleCount: "3",
    customPrompt: "Change the jacket to blue.",
  });
  if (!valid.ok) throw new Error(valid.message);
  if (valid.payload.peopleCount !== 3) throw new Error("peopleCount was not normalized");

  const invalid = validateGenerateAvatarPayload({ ...validPayload, peopleCount: 9 });
  if (invalid.ok) throw new Error("Out-of-range peopleCount should be rejected");
});

Deno.test("normalizes Replicate string arrays and file output objects", () => {
  const expected = "https://replicate.delivery/output.png";
  if (normalizeGeneratedImageUrl([expected]) !== expected) throw new Error("Image array was not normalized");
  if (normalizeGeneratedImageUrl({ url: () => new URL(expected) }) !== expected) {
    throw new Error("File output URL was not normalized");
  }
  if (normalizeGeneratedImageUrl(["https://example.com/image.png"]) !== null) {
    throw new Error("Untrusted provider output URL was accepted");
  }
});

Deno.test("rejects unauthenticated requests before checking quota or generating", async () => {
  const { value, calls } = dependencies({ authenticate: async () => null });
  const response = await handleGenerateAvatar(post(validPayload), value);
  if (response.status !== 401) throw new Error(`Expected 401, got ${response.status}`);
  if (calls.quota !== 0 || calls.generation !== 0) throw new Error("Unauthorized request reached paid work");
});

Deno.test("rejects invalid requests before consuming quota", async () => {
  const { value, calls } = dependencies();
  const response = await handleGenerateAvatar(post({ ...validPayload, imageUrl: "http://example.com/image.png" }), value);
  if (response.status !== 400) throw new Error(`Expected 400, got ${response.status}`);
  if (calls.quota !== 0 || calls.generation !== 0) throw new Error("Invalid request reached quota or generation");
});

Deno.test("stops generation when the server-side quota is exhausted", async () => {
  const { value, calls } = dependencies({ consumeQuota: async () => false });
  const response = await handleGenerateAvatar(post(validPayload), value);
  if (response.status !== 429) throw new Error(`Expected 429, got ${response.status}`);
  if (calls.generation !== 0) throw new Error("Rate-limited request reached the provider");
});

Deno.test("sends validated input to the provider and returns its output", async () => {
  const { value, calls } = dependencies();
  const response = await handleGenerateAvatar(post(validPayload), value);
  const body = await response.json();
  if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  if (body.imageUrl !== "https://replicate.delivery/output.png") throw new Error("Provider output was not returned");
  if (calls.quota !== 1 || calls.generation !== 1) throw new Error("Expected one quota check and one generation");
});

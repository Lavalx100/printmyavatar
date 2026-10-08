# Print My Avatar

Print My Avatar is a React web app for turning a portrait into a chibi-style avatar image. It uses a Supabase Edge Function to call Replicate, so provider credentials stay on the server.

The current app generates images. The 3D model download flow is a placeholder and does not create a printable STL or OBJ file yet.

## Features

- Upload a portrait and generate a single-person or group avatar.
- Refine a generated image with a text prompt.
- Choose avatar options in the interface and keep recent results in browser storage.
- Use your own Supabase project and Replicate account.

## Requirements

- Node.js 18 or newer and npm.
- A Supabase project for the generation Edge Function.
- A Replicate API token for image generation.
- The Supabase CLI to deploy the Edge Function.

## Run locally

1. Clone the repository and install dependencies:

   ```sh
   git clone https://github.com/YOUR-ACCOUNT/printmyavatar.git
   cd printmyavatar
   npm install
   ```

2. Copy the environment template and add your Supabase project values:

   ```sh
   cp .env.example .env.local
   ```

   Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`. Find these in your Supabase project's API settings. The publishable key is intended for browser use; never put a service-role key or provider secret in a `VITE_` variable.

3. Start the development server:

   ```sh
   npm run dev
   ```

   Vite prints the local address to open in your browser.

## Configure Supabase and Replicate

The browser calls the `generate-avatar` Supabase Edge Function. The function reads `REPLICATE_API_TOKEN` from its server-side environment and calls the model configured by `REPLICATE_MODEL` (defaults to `black-forest-labs/flux-kontext-pro`).

1. Create a Supabase project and copy its project URL and publishable key into `.env.local`.
2. Install and authenticate the [Supabase CLI](https://supabase.com/docs/guides/cli).
3. Link this checkout to your own Supabase project:

   ```sh
   supabase login
   supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
   ```

4. In Supabase Dashboard, open **Edge Functions → Secrets** and add `REPLICATE_API_TOKEN` with your Replicate token. Optionally set `REPLICATE_MODEL` to a model compatible with the input format in `supabase/functions/generate-avatar/index.ts`.
5. Deploy the function:

   ```sh
   supabase functions deploy generate-avatar
   ```

The default function configuration allows unauthenticated calls for this demo. Add authentication and rate limiting before deploying it for public use, so other people cannot spend your Replicate credits. Keep provider secrets in Supabase Edge Function secrets; never commit them or expose them through frontend environment variables.

## Customize the app

- Edit avatar prompts and generation inputs in `supabase/functions/generate-avatar/index.ts`.
- Change the default Replicate model with the server-side `REPLICATE_MODEL` secret.
- Update the app title, description, and social metadata in `index.html`.
- Adjust screens and UI components under `src/`.
- Add browser-visible settings to `.env.example` and document them here. Treat every `VITE_` value as public.

## Available commands

```sh
npm run dev      # Start the local development server
npm run build    # Build the production web app
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

## Privacy and credentials

Uploaded photos are sent to your Supabase Edge Function and then to Replicate for image generation. Recent results are saved in the browser's local storage. Review the privacy and data-retention terms of the services you configure before using real photos. This repository does not include API credentials; provide your own values locally and in your Supabase project.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup and contribution guidance. Please do not include credentials, personal data, or private project URLs in commits or issue reports.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

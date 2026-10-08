# Contributing

Contributions are welcome. Please keep changes focused and avoid adding personal data, private service URLs, or credentials.

## Development setup

1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and configure your own Supabase project.
4. Run `npm run dev` to start the app.

## Before submitting a change

- Run `npm run lint` and `npm run build` for code changes.
- Update the README when setup steps, environment variables, or app behavior change.
- Do not commit `.env` files, API tokens, service-role keys, uploaded photos, or generated private data.
- Keep provider secrets in server-side configuration. Anything prefixed with `VITE_` is included in the browser build and must be treated as public.

Open a pull request with a short description of the change and any setup steps reviewers need.

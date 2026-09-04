# aiprreviewer

AI pull request reviews on GitHub. Install the app, open a PR, get an inline review plus a summary — with a second model judging whether the comment is worth posting.

The homepage shows a live sample review so you can judge the output without signing in.

## What it does

1. **Connect** — GitHub OAuth login, then install the GitHub App on the repos you want reviewed.
2. **Optional sync** — index a repo in Pinecone so comments can cite nearby code, not only the diff.
3. **Review** — Inngest runs the job in the background: generate review → judge → post on the PR.
4. **Dashboard** — connected repos, PR status, plan / Stripe billing.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js, TypeScript |
| Auth | better-auth (GitHub) |
| Database | Prisma + Neon (Postgres) |
| Jobs | Inngest |
| AI | OpenRouter (reviewer + judge models) |
| Embeddings | Pinecone |
| Billing | Stripe Checkout |
| GitHub | GitHub App webhooks + Octokit |
| Run | Docker / Compose |

## Local development

```bash
cp .env.example .env
# fill keys — see .env.example
npm ci
npx prisma migrate deploy
npm run dev
```

In another terminal, for background jobs:

```bash
npm run inngest:dev
```

Open [http://localhost:3000](http://localhost:3000). For GitHub webhooks on a laptop, tunnel with ngrok (or similar) and point the App webhook at `/api/github/webhook`.

## Docker

Needs a filled `.env` (Neon `DATABASE_URL` and the rest). Compose does not run Postgres — use Neon.

```bash
docker compose up --build
```

The container runs `prisma migrate deploy`, then starts the app on port 3000.

## GitHub App endpoints

After you have a public HTTPS URL, set these on the GitHub App (and OAuth app):

| Setting | Path |
| --- | --- |
| OAuth callback | `/api/auth/callback/github` |
| App setup URL | `/api/github/callback` |
| Webhook | `/api/github/webhook` |
| Stripe webhook | `/api/stripe/webhook` |
| Inngest | `/api/inngest` |

`BETTER_AUTH_URL` must be that same public origin (no trailing slash).

## CI / CD

1. **CI** — lint and Next build (`workflow.yaml`). Does **not** touch Neon.
2. **Publish** (`docker.yml`) — `prisma migrate deploy` against Neon using Actions secret `DATABASE_URL`, then build and push the image to GHCR.
3. **Server** — `docker compose pull` and `up -d`. The container only starts Next.js; it does not run migrations.

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | What |
|---|---|
| `DATABASE_URL` | Same Neon pooled URL as in the VPS `.env` |

That is the only app secret GitHub needs. Other keys stay in `.env` on the server.

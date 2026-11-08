# VeriClause

Verified contract risk review. Specialist agents read a vendor MSA in parallel, a **code Verifier** drops any finding whose quote is not in the source, and a Supervisor returns a Red / Amber / Green verdict. Decision support for counsel — not a substitute for legal advice.

## What it does

1. Upload a PDF or DOCX, or pick one of the two staged demo MSAs.
2. Text is extracted and split into numbered sections.
3. Six specialists (liability, payment, privacy, termination, IP, governing law) review only their sections against your playbook.
4. The Verifier string-matches every quote. Unmatched findings never reach the report.
5. The Supervisor merges the rest into a verdict, next steps, and click-to-clause highlighting.
6. Type a plain-English rule, rerun, and generate a redline for any Red or Amber issue.
7. Open FAQ, or the Help button, for how verdicts, uploads, the playbook, and sign-in work. Help answers from that same guide.

## Run locally

```bash
npm install
npx tsx scripts/seed-demo.ts
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317). Try **Trap vendor MSA** first — it plants unlimited liability, a 15-day auto-renewal, and data leaving the EU.

```bash
npm test
npx tsx scripts/run-review-cli.ts trap
npx tsx scripts/run-review-cli.ts clean
```

## Models and hackathon services

Without keys, VeriClause uses **sample specialists** that still quote the source and pass the Verifier.

Copy `.env.example` to `.env.local`. Do not commit `.env.local`.

- `GEMINI_API_KEY` — specialists, compiler, supervisor, and redlines. OpenRouter and xAI remain fallbacks.
- `TIGER_DATABASE_URL` — each finished review is inserted into `vericlause_review_events`.
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET` — counsel can edit the playbook. Set the Auth0 role claim `https://vericlause.app/role` to `business` for read-only teammates. Callback URL: `http://127.0.0.1:4317/api/auth/auth0/callback`.
- Vultr — `docker build -t vericlause .` then `docker run -p 4317:4317 --env-file .env.local vericlause`. `GET /api/health` reports the instance when `VULTR_INSTANCE` is set.

Supabase remains optional. SQL under `supabase/` is unchanged.

## Demo script (about three minutes)

1. Problem: vendor review takes days and is inconsistent.
2. Upload the trap MSA. Agents light up; the Verifier confirms quotes.
3. Click a Red finding to jump to the clause.
4. Add a playbook rule in plain English and rerun.
5. Suggest a fix — side-by-side rewrite plus a negotiation note.
6. Close on pages reviewed, seconds taken, and lawyer-in-the-loop.

## Stack

Next.js App Router, Tailwind, shadcn/ui, Gemini (OpenRouter and xAI fallback), Tiger Data, Auth0, Vultr via Docker, optional Supabase, PDF via `unpdf`, DOCX via Mammoth.

## Explain and deploy

- `docs/CODE-AND-CONCEPTS.md` explains the pipeline, the verifier, languages, speech, and the four ideas behind the product: innovation, technical complexity, functionality and UX, and impact.
- `docs/DEPLOY.md` is how to run this folder on Render and how to put the same site on Vercel. Reviews stay in process memory, so use one Render instance when a finished review must still be there after the redirect.

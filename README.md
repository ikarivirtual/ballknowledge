# Ball Knowledge

Production-ready Next.js daily football quiz app with anonymous daily attempts, Postgres-backed scoring, OpenAI question generation, strict schema validation, and Vercel cron support.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only key used by route handlers for protected scoring and leaderboard reads.
- `OPENAI_API_KEY`: OpenAI API key for daily question generation.
- `OPENAI_MODEL`: Optional model override, defaults to `gpt-4.1-mini`.
- `CRON_SECRET`: Shared secret for `/api/generate-daily`.
- `ADMIN_REVIEW_REQUIRED`: Optional. Set to `true` to store OpenAI-generated quizzes as `pending` until approved.

## Setup

1. Create a Supabase project.
2. Run the SQL migrations in order from `supabase/migrations`.
3. Add the env vars above to `.env.local` and to Vercel.
4. Install dependencies with `npm install`.
5. Start locally with `npm run dev`.
6. Deploy to Vercel. The cron in `vercel.json` calls `/api/generate-daily` daily.

## Routes

- `GET /play`: today's five-question quiz.
- `POST /api/attempts`: server-scored submit endpoint, one anonymous browser attempt per daily set.
- `GET /leaderboard`: leaderboard UI with daily, weekly, and all-time tabs.
- `GET /api/leaderboard?tab=daily|weekly|all-time`: leaderboard data.
- `POST /api/generate-daily`: admin-safe daily generation endpoint. Send `Authorization: Bearer $CRON_SECRET`.
- `GET /api/admin/review-daily`: admin-safe review endpoint for today's generated set.
- `POST /api/admin/approve-daily`: admin-safe endpoint that publishes a pending generated set.

## Question Quality Safeguards

- World Cup campaign questions are generated from a curated local fact pack in `lib/world-cup-facts.ts`.
- Generated sets pass deterministic validation for duplicate choices, risky wording, and weak explanations.
- Generated sets pass a model-based fact-check audit before storage.
- World Cup campaign sets also pass a source-grounding audit against the supplied fact pack.
- Known corrections live in `lib/trivia-corrections.ts` and are injected into generation and audit prompts.
- To enable manual review, run `supabase/migrations/0002_pending_review.sql`, set `ADMIN_REVIEW_REQUIRED=true`, then approve with `POST /api/admin/approve-daily`.

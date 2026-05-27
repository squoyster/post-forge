# AGENTS.md — post-forge

## Repo State

This repository is **design-only**. No code has been bootstrapped yet. There is no `package.json`, no build system, no tests, and no CI. Everything is spec.

Before writing code, read:
- `README.md` — full system design and intended behavior.
- `docs/AGENT_IMPLEMENTATION_PROMPT.md` — implementation priorities and guardrails.
- `docs/ARCHITECTURE.md` — intended module boundaries and data flow.
- `docs/DATA_MODEL.md` — SQL schema for `post_forge` tables.

## Critical Constraints

- **Read-only from `video-rag`**. Never write to `video-rag` tables (`media_assets`, `transcript_segments`, `transcript_chunks`, `clip_candidates`).
- **Write only to `post_forge` schema** in the same PostgreSQL database.
- **Human approval is mandatory** in MVP. No autonomous publishing.
- **Manual export must always work**, even if Facebook API credentials are missing.

## Intended Stack

- TypeScript, Next.js (App Router), pnpm workspace monorepo.
- PostgreSQL + Drizzle ORM for schema and migrations.
- pg-boss for job queueing.
- ffmpeg/ffprobe via `execa` (preferred over `fluent-ffmpeg`).
- Playwright for rasterizing HTML/SVG overlays.
- Handlebars for text templates; Zod for validation.

## Target Workspace Structure

```
apps/web              Next.js UI + API routes
packages/db           Drizzle schema, migrations, typed queries
packages/retrieval    Read-only video-rag DB adapter
packages/proposals    Proposal generation and scoring
packages/templates    Text/video/audio template rendering
packages/render       ffmpeg/Playwright render orchestration
packages/scheduler    Queue and scheduling logic
packages/publisher    Facebook/manual export adapters
packages/calendar     Spiritual calendar engine
```

## Implementation Order

Implement in **vertical slices**, not horizontal layers. The first useful workflow is:

1. Connect to `video-rag` database.
2. List topics and search chunks.
3. Generate text proposals.
4. Show proposals in a simple UI.
5. Approve/reject proposals.
6. Export approved posts manually.

Only after that works should you add:
- Clip proposals and boundary editing.
- Video rendering (intro + clip + outro).
- Caption generation and burning.
- Scheduling and Facebook publishing.

## Environment

Copy `.env.example` to `.env` and fill in `DATABASE_URL` pointing to the existing `video-rag` database. All other values are optional for local development.

## Style Notes

- Prefer simple deterministic heuristics before ML-heavy logic.
- Every proposal must preserve source references (media ID, chunk IDs, timestamps).
- Every rendered asset must include a `render-manifest.json`.
- Templates are data (YAML + HTML/CSS), not hardcoded UI components.

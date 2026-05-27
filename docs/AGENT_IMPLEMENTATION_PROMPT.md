# Agent Implementation Prompt — post-forge

You are developing `post-forge`, a TypeScript content mining, review, rendering, queueing, scheduling, and publishing system.

## Mission

Build a minimal but extensible system that reads from an existing `video-rag` PostgreSQL database and proposes Facebook-ready content packages from previously processed videos.

The system must support:

- Text posts.
- Video clip posts.
- Audio excerpt posts.
- Mixed media posts.
- Human approval.
- Batch approval.
- Scheduling.
- Template-based formatting.
- Video rendering with intro/clip/outro.
- Optional captions.
- Spiritual-calendar-aware topic selection.

## Critical Constraint

Do not reimplement `video-rag`.

`video-rag` is responsible for:

- Ingestion.
- Transcription.
- Chunking.
- Embedding.
- Hybrid search.
- Clip candidates.
- Source media paths.

`post-forge` is responsible for:

- Mining.
- Proposal generation.
- Review.
- Templating.
- Rendering.
- Approval.
- Queueing.
- Scheduling.
- Publishing/export.

## Preferred Stack

- TypeScript.
- Next.js.
- PostgreSQL.
- Drizzle ORM.
- pg-boss for queueing.
- ffmpeg/ffprobe through `execa`.
- Playwright for HTML/SVG template rendering.
- Handlebars for text templates.
- Zod for config/template validation.
- pnpm workspace.

## Development Style

Implement in vertical slices. Keep modules independent and testable.

Avoid building a large framework before the first useful workflow works.

First useful workflow:

1. Connect to `video-rag` database.
2. List topics.
3. Search chunks.
4. Generate text proposals.
5. Show proposals in UI.
6. Approve proposals.
7. Export approved posts.

Second useful workflow:

1. Generate clip proposal.
2. Review source video.
3. Adjust start/end.
4. Render intro + clip + outro.
5. Burn captions.
6. Export final MP4 + Facebook caption.

## Initial Project Structure

```text
apps/
  web/
packages/
  db/
  retrieval/
  proposals/
  templates/
  render/
  scheduler/
  publisher/
  calendar/
templates/
  text/
  video/
  audio/
assets/
  intro/
  outro/
  logos/
data/
  render/
  export/
docs/
```

## First Implementation Tasks

1. Bootstrap Next.js + pnpm workspace.
2. Add `.env.example`.
3. Add Drizzle.
4. Define read-only `video-rag` table mappings.
5. Define `post_forge` tables.
6. Implement retrieval adapter:
   - `listTopics`
   - `searchChunks`
   - `getMediaAsset`
   - `getTranscriptWindow`
7. Implement proposal generator:
   - query by topic
   - create text proposal
   - store proposal
8. Implement proposal inbox UI:
   - list proposals
   - detail view
   - approve/reject
   - edit body
9. Implement manual export.

## Guardrails

- No automatic publishing without explicit approval.
- Do not mutate `video-rag` tables.
- Every proposal must preserve source references.
- Every rendered asset must include a manifest.
- Keep Facebook publishing optional.
- Manual export must always work.
- Prefer simple deterministic heuristics before ML-heavy logic.

## Definition of Done for MVP

The MVP is done when a user can:

1. Generate a batch of proposals from existing `video-rag` content.
2. Review and approve at least 3 proposals.
3. Edit a text post.
4. Adjust a video clip boundary.
5. Render one vertical short with intro/clip/outro.
6. Optionally add captions.
7. Queue approved posts.
8. Export post assets for manual Facebook publishing.

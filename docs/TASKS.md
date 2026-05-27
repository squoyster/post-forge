# post-forge Development Tasks

## Milestone 0 — Repo Bootstrap

- [ ] Create Next.js + TypeScript project.
- [ ] Add pnpm workspace.
- [ ] Add ESLint, Prettier, TypeScript strict mode.
- [ ] Add `.env.example`.
- [ ] Add Docker Compose for local PostgreSQL only if needed.
- [ ] Add basic README and docs.
- [ ] Add CI for lint/typecheck/test.

## Milestone 1 — Database Adapter

- [ ] Add Drizzle ORM.
- [ ] Define `video-rag` read models:
  - [ ] `media_assets`
  - [ ] `transcript_segments`
  - [ ] `transcript_chunks`
  - [ ] `clip_candidates`
- [ ] Define `post_forge` schema.
- [ ] Create migrations.
- [ ] Implement DB connection.
- [ ] Implement retrieval adapter.
- [ ] Implement topic listing.
- [ ] Implement transcript window query.
- [ ] Implement source media lookup.

## Milestone 2 — Proposal Model

- [ ] Create proposal table.
- [ ] Create proposal asset table.
- [ ] Create review event table.
- [ ] Create proposal state machine.
- [ ] Add proposal CRUD API.
- [ ] Add proposal list UI.
- [ ] Add proposal detail UI.

## Milestone 3 — Text Proposal Generation

- [ ] Add text template loader.
- [ ] Add Handlebars rendering.
- [ ] Add default text templates:
  - [ ] Teaching reflection.
  - [ ] Quote with context.
  - [ ] Observance post.
  - [ ] Question/reflection post.
- [ ] Add proposal batch generation command.
- [ ] Add duplicate suppression.
- [ ] Add topic/source variety rules.
- [ ] Add proposal scoring.

## Milestone 4 — Review Workflow

- [ ] Add proposal inbox.
- [ ] Add approve/reject actions.
- [ ] Add batch approval.
- [ ] Add editable title/body.
- [ ] Add template selector.
- [ ] Add source transcript display.
- [ ] Add source timestamp links.
- [ ] Add review event audit log.

## Milestone 5 — Clip Review

- [ ] Add media preview player.
- [ ] Add transcript-synced source excerpt.
- [ ] Add clip start/end controls.
- [ ] Add preview range playback.
- [ ] Add duration validation.
- [ ] Add alternate clip proposal action.
- [ ] Store final selected boundaries.

## Milestone 6 — Render Worker

- [ ] Add worker process.
- [ ] Add pg-boss queue.
- [ ] Add render job table.
- [ ] Add ffprobe metadata utility.
- [ ] Add clip cutting.
- [ ] Add clip normalization.
- [ ] Add intro/clip/outro concat.
- [ ] Add render manifest.
- [ ] Add render status UI.

## Milestone 7 — Captions

- [ ] Query transcript segments overlapping selected clip.
- [ ] Convert timestamps to clip-relative time.
- [ ] Generate SRT.
- [ ] Generate ASS with style.
- [ ] Burn captions with ffmpeg.
- [ ] Add caption enable/disable UI.

## Milestone 8 — Video Templates

- [ ] Add video template schema.
- [ ] Add default vertical short template.
- [ ] Add default square feed template.
- [ ] Add HTML/SVG preview rendering with Playwright.
- [ ] Add title card generation.
- [ ] Add logo/watermark support.
- [ ] Add template preview UI.

## Milestone 9 — Scheduling

- [ ] Add post queue table.
- [ ] Add cadence settings.
- [ ] Add scheduler job.
- [ ] Add calendar UI.
- [ ] Add manual schedule override.
- [ ] Enforce max posts/day.
- [ ] Enforce minimum spacing.

## Milestone 10 — Manual Export

- [ ] Export text body to Markdown/TXT.
- [ ] Export rendered media.
- [ ] Export metadata JSON.
- [ ] Add export bundle per post.
- [ ] Add "mark manually published" action.

## Milestone 11 — Facebook Page Publishing

- [ ] Add Facebook config.
- [ ] Add dry-run mode.
- [ ] Validate page credentials.
- [ ] Publish text-only post.
- [ ] Publish video post.
- [ ] Store external post ID.
- [ ] Store publish attempts.
- [ ] Add retry handling.
- [ ] Add failure UI.

## Milestone 12 — Spiritual Calendar Engine

- [ ] Add observance YAML schema.
- [ ] Add fixed-date observances.
- [ ] Add manually configured lunar-date observances.
- [ ] Generate date-aware search intents.
- [ ] Add calendar relevance scoring.
- [ ] Add observance filters in UI.
- [ ] Add "generate proposals for observance" action.

## Milestone 13 — Quality Pass

- [ ] Add tests for retrieval adapter.
- [ ] Add tests for proposal scoring.
- [ ] Add tests for template rendering.
- [ ] Add tests for scheduler.
- [ ] Add tests for caption timestamp conversion.
- [ ] Add render smoke test with sample media.
- [ ] Add documentation for local setup.

# post-forge Architecture

## Architectural Decision

`post-forge` should be a TypeScript application that acts as a publishing layer over `video-rag`.

It should not fork or duplicate `video-rag` ingestion/transcription logic. It should consume the database and rendered media paths created by `video-rag`, then add proposal generation, human review, rendering, queueing, scheduling, and publishing.

## Recommended Framework

Use a modular monolith first.

```text
apps/web          Next.js UI + API routes
packages/db       Drizzle schema, migrations, typed queries
packages/retrieval video-rag DB adapter
packages/proposals proposal generation and scoring
packages/templates text/video/audio template rendering
packages/render   ffmpeg/playwright render orchestration
packages/scheduler queue and post scheduling logic
packages/publisher Facebook/manual export adapters
packages/calendar spiritual calendar engine
```

This gives the agent clean boundaries without requiring distributed services too early.

## Runtime Processes

### Web/API Process

Responsibilities:

- Review UI.
- Proposal management.
- Template management.
- Manual preview.
- Queue inspection.
- Settings.

### Worker Process

Responsibilities:

- Generate proposal batches.
- Render media.
- Generate captions.
- Run scheduler.
- Publish or export approved posts.
- Retry failed jobs.

### Database

One PostgreSQL database is sufficient for MVP.

Recommended:

```text
public.media_assets              # from video-rag
public.transcript_segments       # from video-rag
public.transcript_chunks         # from video-rag
public.clip_candidates           # from video-rag

post_forge.templates
post_forge.proposals
post_forge.proposal_assets
post_forge.review_events
post_forge.render_jobs
post_forge.post_queue
post_forge.publish_attempts
post_forge.settings
post_forge.calendar_observances
```

## Module Responsibilities

### Retrieval Adapter

Purpose: isolate all assumptions about `video-rag`.

Exports:

```ts
searchChunks(input: SearchChunksInput): Promise<SearchChunkResult[]>
getMediaAsset(mediaId: number): Promise<MediaAsset>
getTranscriptWindow(mediaId: number, start: number, end: number): Promise<TranscriptSegment[]>
getCandidateClips(input: CandidateClipInput): Promise<ClipCandidate[]>
listTopics(): Promise<TopicCount[]>
```

### Calendar Engine

Purpose: generate date-aware search intents.

Inputs:

- Current date.
- Posting horizon.
- Traditions enabled.
- Observance registry.
- Topic taxonomy.

Outputs:

- Search intents.
- Calendar context metadata.
- Suggested post angles.

### Proposal Engine

Purpose: turn retrieved material into proposals.

Inputs:

- Search results.
- Calendar context.
- Available templates.
- Recent posting history.

Outputs:

- Proposal records.

Scoring factors:

```text
score =
  0.35 * retrieval_score +
  0.20 * calendar_relevance +
  0.15 * topic_diversity +
  0.10 * source_diversity +
  0.10 * duration_fit +
  0.10 * transcript_quality
```

### Template Engine

Use Handlebars or Liquid-style templates for text. Use HTML/CSS/SVG for media layouts.

Recommended libraries:

- `handlebars` for text templates.
- `zod` for template schema validation.
- `playwright` for rasterizing HTML/SVG overlays.
- `sharp` for image conversion/resizing.
- `fluent-ffmpeg` or direct `execa` calls for ffmpeg.

Prefer direct `execa` calls for ffmpeg because command construction and logging are more explicit.

### Render Engine

Pipeline:

```text
resolve media -> cut clip -> normalize -> captions -> overlays -> concat intro/clip/outro -> final mp4
```

Render outputs:

```text
data/render/{proposalId}/source-clip.mp4
data/render/{proposalId}/normalized-clip.mp4
data/render/{proposalId}/captions.srt
data/render/{proposalId}/captions.ass
data/render/{proposalId}/title-card.png
data/render/{proposalId}/final.mp4
data/render/{proposalId}/render-manifest.json
```

### Scheduler

Use deterministic rules first:

- Preferred posting windows.
- Minimum interval between posts.
- Max posts per day.
- Manual pinning overrides automatic scheduling.
- Calendar-relevant proposals should be scheduled near the relevant date.

### Publisher

Adapters:

```ts
interface PublisherAdapter {
  publish(input: PublishInput): Promise<PublishResult>;
  validateConfig(): Promise<PublisherHealth>;
}
```

Initial adapters:

- `ManualExportPublisher`
- `FacebookPagePublisher`

## Key Design Constraints

- Keep `video-rag` read-only from `post-forge`.
- Preserve source traceability.
- Human approval is mandatory in MVP.
- Rendering and publishing are async jobs.
- Templates are data, not hardcoded UI.
- Manual export must work even if Facebook API permissions are unavailable.

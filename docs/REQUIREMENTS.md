# post-forge Requirements

## Functional Requirements

### R1. Database Integration

- Connect to the existing `video-rag` PostgreSQL database.
- Read from:
  - `media_assets`
  - `transcript_segments`
  - `transcript_chunks`
  - `clip_candidates`
- Do not mutate `video-rag` ingestion tables in MVP.
- Store `post-forge` state in separate `post_forge_*` tables or a dedicated PostgreSQL schema.

### R2. Retrieval

The system shall retrieve candidate content by:

- Search query.
- Topic tag.
- Media ID.
- Date/calendar context.
- Duration constraints.
- Previously unused or underused topics.
- Hybrid semantic/keyword relevance exposed by `video-rag`.

### R3. Proposal Generation

The system shall generate proposals for:

- Text posts.
- Video clip posts.
- Audio excerpt posts.
- Mixed text + media posts.

Each proposal shall include:

- Title.
- Body/caption.
- Source media reference.
- Source chunk references.
- Source transcript excerpt.
- Topic.
- Template ID.
- Score.
- Status.
- Optional start/end time.
- Optional render settings.
- Optional calendar context.

### R4. Human Review

The system shall provide a review UI where a user can:

- View proposals.
- Approve N proposals in batch.
- Reject proposals.
- Edit text.
- Change templates.
- Adjust scheduling.
- Adjust video clip start/end time.
- Preview source media.
- Preview generated post formatting.
- Preview rendered media where available.

### R5. Scheduling

The system shall:

- Queue approved proposals.
- Assign scheduled times according to configured cadence rules.
- Prevent accidental over-posting.
- Allow manual schedule overrides.
- Track scheduled, published, failed, and canceled states.

### R6. Template System

The system shall support:

- Text templates.
- Video templates.
- Audio templates.
- Template preview.
- Dynamic placeholders.
- Versioned template files.

Minimum template placeholders:

```text
{{title}}
{{hook}}
{{excerpt}}
{{reflection}}
{{question}}
{{source_title}}
{{source_url}}
{{topic}}
{{calendar_context}}
{{hashtags}}
```

### R7. Video Rendering

The system shall render video packages using:

- Selected source clip.
- Optional intro.
- Optional outro.
- Optional captions.
- Optional overlay/title card.
- Configurable aspect ratio.

Initial targets:

- 1080x1920 vertical short.
- 1080x1080 square feed post.
- 1920x1080 landscape export.

### R8. Captioning

The system shall:

- Extract overlapping transcript segments for selected clip windows.
- Convert segment timestamps to clip-relative timestamps.
- Generate SRT/VTT/ASS caption files.
- Burn captions into rendered video when enabled.

### R9. Export and Publishing

The system shall support:

- Manual export mode.
- Facebook Page publishing adapter.
- Dry-run mode.
- Publish attempt logging.
- Retry handling.

### R10. Spiritual Calendar

The system shall:

- Load a spiritual calendar registry from YAML or JSON.
- Match upcoming observances to search topics.
- Use calendar context as a proposal scoring signal.
- Support multiple traditions:
  - Christian
  - Sanatana Dharma
  - Buddhist
  - General interfaith/contemplative

## Non-Functional Requirements

### NFR1. Safety and Control

- No post shall be published without approval in MVP.
- Publishing adapter must support dry-run mode.
- Every rendered/published asset must be traceable to source media and timestamps.

### NFR2. Maintainability

- Use TypeScript throughout.
- Use explicit schema migrations.
- Keep retrieval, proposal, rendering, scheduling, and publishing as separate modules.
- Add unit tests for scoring, scheduling, templates, and caption timestamp conversion.

### NFR3. Performance

- Proposal generation for a batch of 20 should complete in under 60 seconds on a local development machine, excluding full video rendering.
- Text proposal generation should complete in under 10 seconds for 20 proposals using cached retrieval.
- Rendering can be asynchronous and queued.

### NFR4. Portability

- MVP should run locally with PostgreSQL and ffmpeg.
- Avoid cloud-only dependencies.
- Keep Facebook publishing optional.

### NFR5. Auditability

Track:

- Who approved a proposal.
- When it was approved.
- What source chunks were used.
- Render job inputs and outputs.
- Publish attempts and errors.

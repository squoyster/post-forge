# post-forge

**post-forge** is a human-approved content mining, packaging, rendering, and scheduling system for turning an existing `video-rag` database into high-quality Facebook page/feed posts.

It consumes timestamped transcript chunks, media metadata, topic tags, clip candidates, and search results created by `squoyster/video-rag`. It proposes text, audio, video, and short-form clip posts; presents them to a human reviewer; queues approved posts; renders media assets with templates; and schedules publication at appropriate times.

## Project Goal

Create a low-effort, high-variety social publishing system for spiritual video archives.

The first target corpus is DKMC-style spiritual content: Sanatana Dharma, Vedanta, meditation, devotional material, comparative spiritual teaching, and related Buddhist/Christian themes. The system should also support date-aware topic selection, such as selecting content relevant to major Christian, Sanatana Dharma, Buddhist, or other spiritual observances.

## Core Outcomes

- Mine previously processed videos from the `video-rag` PostgreSQL database.
- Propose publishable Facebook posts using text, video, audio, or mixed media.
- Generate candidate short clips from existing video assets.
- Allow a human reviewer to approve, reject, edit, regenerate, or reschedule proposals.
- Allow manual adjustment of video clip start/end times.
- Render clips into short-form vertical or square formats using reusable templates.
- Add optional captions/subtitles.
- Queue approved posts.
- Schedule posts at reasonable times with variety and calendar relevance.
- Keep the system extensible for future platforms beyond Facebook.

## Relationship to `video-rag`

`video-rag` is the ingestion and retrieval system. `post-forge` is the publishing orchestration system.

`video-rag` already provides media ingestion, faster-whisper transcription, transcript segments/chunks, topic tagging, embeddings, PostgreSQL + pgvector storage, hybrid semantic + keyword search, clip candidate generation, and ffmpeg clip cutting.

`post-forge` should initially read from the `video-rag` database directly. Later, it may use a thin API adapter if `video-rag` exposes FastAPI endpoints.

## Recommended Architecture

### Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Good fit for UI, API, scheduling, templating, and agentic development. |
| Web framework | Next.js | Fast full-stack UI, route handlers, server actions, simple deployment. |
| Database | PostgreSQL | Reuse `video-rag` DB; add `post_forge_*` tables in same DB or separate schema. |
| ORM/query | Drizzle ORM | Type-safe SQL, explicit migrations, good fit for existing PostgreSQL. |
| Job queue | pg-boss | PostgreSQL-only queue; avoids Redis for MVP. |
| Rendering | ffmpeg + ffprobe | Required for clip cutting, captions, concat, overlays, audio extraction. |
| Visual templates | HTML/CSS/SVG rendered by Playwright | Easier than raw ffmpeg drawtext; supports dynamic text layouts. |
| Captions | SRT/VTT/ASS generated from transcript segments | Use ffmpeg subtitles filter for burned-in captions. |
| Calendar data | JSON/YAML spiritual calendar registry | Start static; later add ICS/import providers. |
| Facebook posting | Meta Graph API where allowed; manual export fallback | Scheduling/publishing APIs vary by page/profile permissions. |

## System Components

```text
video-rag PostgreSQL DB
        |
        v
Retrieval Adapter
        |
        v
Proposal Engine <-> Calendar/Topic Engine
        |
        v
Review UI
        |
        v
Approval Queue + Scheduler
        |
        v
Render Workers
        |
        v
Publisher Adapter / Manual Export
```

## Content Types

### Text Post

A templated Facebook post built from retrieved chunks:

- Teaching excerpt.
- Short reflection.
- Question-based devotional post.
- Quote + explanation.
- Topic summary.
- Date-relevant observance post.

### Video Clip Post

A short-form video package:

```text
intro asset -> selected clip -> outro asset
```

Optional overlays:

- Title card.
- Speaker/topic label.
- Date/occasion label.
- Burned-in captions.
- Logo/watermark.
- Lower-third source attribution.

### Audio Post

An audio excerpt rendered with a static or animated visual template:

- Waveform video.
- Still image + captions.
- Quote card + audio.
- Intro/outro audio stingers.

### Mixed Post

A Facebook post containing text plus rendered video or audio.

## Human Approval Workflow

### Proposal States

```text
draft -> proposed -> approved -> queued -> rendering -> rendered -> scheduled -> published
                         |          |           |          |           |
                         v          v           v          v           v
                      rejected   canceled     failed     failed      failed
```

### Reviewer Actions

- Approve proposal.
- Approve multiple proposals in batch.
- Reject proposal.
- Edit title/body/caption.
- Change post template.
- Change scheduled date/time.
- Adjust clip start/end.
- Preview clip around selected region.
- Request regenerated text.
- Request alternate clips for same topic.
- Lock a proposal against further automatic edits.

## MVP Scope

The MVP should provide:

1. Read-only integration with the `video-rag` database.
2. Topic/calendar-based proposal generation.
3. Text post template rendering.
4. Clip proposal review.
5. Manual clip boundary adjustment.
6. ffmpeg render pipeline with intro + clip + outro.
7. Optional burned-in captions.
8. Approval queue.
9. Basic scheduler.
10. Manual export and/or Facebook page posting adapter.

## Non-Goals for MVP

- Reimplementing transcription.
- Reimplementing ingestion.
- Fully autonomous posting without approval.
- Supporting all social platforms.
- Perfect ML-based clip boundary detection.
- Complex multi-tenant user management.
- Full editorial CMS.

## Data Model

Recommended new tables or schema namespace:

```text
post_forge_sources
post_forge_topic_calendar
post_forge_templates
post_forge_proposals
post_forge_proposal_assets
post_forge_reviews
post_forge_render_jobs
post_forge_post_queue
post_forge_publish_attempts
post_forge_settings
```

## Proposal Engine

The proposal engine should combine:

1. Calendar signals.
2. Topic rotation.
3. Corpus coverage.
4. Recent posting history.
5. Search score from `video-rag`.
6. Clip duration constraints.
7. Content quality heuristics.

### Proposal Selection Algorithm

For each proposal batch:

1. Load upcoming spiritual calendar windows.
2. Generate search intents:
   - Date-aware topics.
   - Evergreen topics.
   - Underused topics.
   - High-performing historical topics if analytics exist.
3. Query `video-rag` hybrid search.
4. Deduplicate near-identical chunks/media.
5. Generate content proposals.
6. Score each proposal.
7. Apply variety rules.
8. Present top N to reviewer.

### Variety Rules

Avoid:

- Repeating the same media too often.
- Repeating the same topic too often.
- Posting multiple clips from adjacent timestamps unless explicitly approved.
- Posting too many long clips.
- Overusing the same template.
- Overusing the same opening language.

Prefer:

- Different media sources.
- Different durations.
- Different post types.
- Mix of devotional, contemplative, practical, and teaching content.
- Timely calendar-aware posts when available.

## Template System

Templates should be stored as versioned files plus DB records.

Recommended layout:

```text
templates/
  text/
    teaching-reflection.yaml
    quote-with-context.yaml
    observance-post.yaml
  video/
    vertical-short/
      template.yaml
      layout.html
      styles.css
    square-feed/
      template.yaml
      layout.html
      styles.css
  audio/
    waveform-card/
      template.yaml
      layout.html
      styles.css
assets/
  intro/
  outro/
  logos/
  backgrounds/
  fonts/
```

## Video Rendering Pipeline

1. Resolve source media path from `video-rag.media_assets.local_media_path`.
2. Cut selected source interval with ffmpeg.
3. Normalize clip format:
   - H.264 video.
   - AAC audio.
   - Constant frame rate.
   - Target resolution.
4. Generate captions from transcript segments overlapping selected interval.
5. Render dynamic title card or overlay using HTML/SVG/Playwright.
6. Compose intro + selected clip + outro.
7. Burn captions if enabled.
8. Export final MP4.
9. Attach rendered asset to proposal.

## Facebook Publishing

MVP should support two modes.

### Manual Export Mode

Always implement this first.

- Export post body.
- Export final media file.
- Export metadata JSON.
- Mark proposal as `ready_to_publish`.
- Human manually posts or uploads through Meta Business Suite.

### Graph API Mode

Implement once credentials and page permissions are validated.

- Publish to Facebook Page where API permissions allow it.
- Store publish attempt response.
- Store external post ID.
- Retry transient failures.
- Do not assume personal-profile automation is available.

## Development Order

1. Project skeleton.
2. Database connection to existing `video-rag` DB.
3. Read-only retrieval adapter.
4. Proposal schema and migrations.
5. Basic text proposal generation.
6. Proposal review UI.
7. Approval queue.
8. Clip boundary editor.
9. Render worker.
10. Caption generation.
11. Scheduler.
12. Manual export.
13. Facebook Page publishing adapter.
14. Calendar-aware proposal generation.
15. Template editor and preview.

## Environment Variables

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/video_rag
POST_FORGE_SCHEMA=post_forge
APP_BASE_URL=http://localhost:3000
APP_TIMEZONE=America/Denver

RENDER_WORKDIR=./data/render
EXPORT_DIR=./data/export
INTRO_ASSET_DIR=./assets/intro
OUTRO_ASSET_DIR=./assets/outro

FACEBOOK_PAGE_ID=
FACEBOOK_ACCESS_TOKEN=
FACEBOOK_DRY_RUN=true
```

## Local Development

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

## Initial Success Criteria

- Generate 10 candidate post proposals from the existing `video-rag` DB.
- Approve 3 proposals in the UI.
- Edit one text post.
- Adjust one video clip start/end time.
- Render one vertical short with intro/clip/outro.
- Render captions from transcript segments.
- Queue approved posts.
- Export approved posts to `data/export`.

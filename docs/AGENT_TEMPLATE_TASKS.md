# Agent Tasks — DKMC Template System

Implement the DKMC Satsang Dawn asset system in post-forge.

## Tasks

1. Add brand token loading from `templates/brand/*.tokens.json`.
2. Add image template renderer:
   - Handlebars HTML
   - CSS
   - Playwright screenshot
   - PNG output
3. Add optional image-to-MP4 animation:
   - 5 to 8 sec
   - subtle fade/scale only
4. Add video intro/outro renderer:
   - HTML to PNG frames or short MP4
   - ffmpeg concat with source clip
5. Add ASS caption generation from transcript segments.
6. Add proposal CTA modes:
   - none
   - follow_facebook_page
   - subscribe_youtube
   - watch_live
   - watch_replay
   - save_reflection
7. Add proposal series labels:
   - Practice Reminder
   - Know Thy Self
   - Satsang Reflection
   - From the Archive
   - Live Satsang
   - Sacred Calendar Reflection
8. Add validation:
   - quote max words
   - caption line length
   - required source references
   - no publish without approval

## Definition of Done

- One quote card can render to PNG.
- One daily reflection card can render to PNG.
- One short clip can render with intro/outro/captions.
- One Facebook caption can be generated from template YAML.
- Assets are attached to proposals and exportable.

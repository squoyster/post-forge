# post-forge Data Model

## Schema Strategy

Use a separate schema named `post_forge` in the same PostgreSQL database used by `video-rag`.

This keeps source retrieval close to the existing data while avoiding accidental mutation of ingestion/transcription tables.

## Tables

### `post_forge.templates`

Stores text, video, and audio template metadata.

```sql
CREATE TABLE post_forge.templates (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  platform text NOT NULL DEFAULT 'facebook',
  version integer NOT NULL DEFAULT 1,
  file_path text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### `post_forge.proposals`

Stores generated content proposals.

```sql
CREATE TABLE post_forge.proposals (
  id uuid PRIMARY KEY,
  proposal_type text NOT NULL,
  source_media_id bigint,
  source_chunk_ids bigint[] DEFAULT '{}',
  source_segment_ids bigint[] DEFAULT '{}',
  topic text,
  calendar_context jsonb DEFAULT '{}',
  title text,
  body text,
  start_seconds numeric,
  end_seconds numeric,
  template_id uuid REFERENCES post_forge.templates(id),
  score numeric,
  status text NOT NULL DEFAULT 'proposed',
  scheduled_for timestamptz,
  locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### `post_forge.proposal_assets`

Stores rendered or exported assets.

```sql
CREATE TABLE post_forge.proposal_assets (
  id uuid PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES post_forge.proposals(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  path text NOT NULL,
  mime_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### `post_forge.review_events`

Audit trail for human decisions.

```sql
CREATE TABLE post_forge.review_events (
  id uuid PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES post_forge.proposals(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor text,
  before jsonb,
  after jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### `post_forge.render_jobs`

Tracks asynchronous rendering.

```sql
CREATE TABLE post_forge.render_jobs (
  id uuid PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES post_forge.proposals(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  input_manifest jsonb NOT NULL DEFAULT '{}',
  output_manifest jsonb DEFAULT '{}',
  error text,
  attempts integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### `post_forge.post_queue`

Approved/scheduled publishing queue.

```sql
CREATE TABLE post_forge.post_queue (
  id uuid PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES post_forge.proposals(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'facebook',
  status text NOT NULL DEFAULT 'queued',
  scheduled_for timestamptz,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### `post_forge.publish_attempts`

Tracks manual export and API publishing attempts.

```sql
CREATE TABLE post_forge.publish_attempts (
  id uuid PRIMARY KEY,
  queue_id uuid REFERENCES post_forge.post_queue(id) ON DELETE SET NULL,
  proposal_id uuid NOT NULL REFERENCES post_forge.proposals(id) ON DELETE CASCADE,
  platform text NOT NULL,
  mode text NOT NULL,
  status text NOT NULL,
  external_post_id text,
  request jsonb DEFAULT '{}',
  response jsonb DEFAULT '{}',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### `post_forge.calendar_observances`

Stores spiritual calendar metadata.

```sql
CREATE TABLE post_forge.calendar_observances (
  id text PRIMARY KEY,
  tradition text NOT NULL,
  name text NOT NULL,
  date_rule jsonb NOT NULL,
  search_topics text[] NOT NULL DEFAULT '{}',
  post_angles text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'
);
```

CREATE SCHEMA "post_forge";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_forge"."calendar_observances" (
	"id" text PRIMARY KEY NOT NULL,
	"tradition" text NOT NULL,
	"name" text NOT NULL,
	"date_rule" jsonb NOT NULL,
	"search_topics" text[] DEFAULT '{}' NOT NULL,
	"post_angles" text[] DEFAULT '{}' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clip_candidates" (
	"id" bigint PRIMARY KEY NOT NULL,
	"media_id" bigint,
	"start_time" numeric,
	"end_time" numeric,
	"score" numeric,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media_assets" (
	"id" bigint PRIMARY KEY NOT NULL,
	"title" text,
	"description" text,
	"local_media_path" text,
	"duration_seconds" numeric,
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_forge"."post_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"platform" text DEFAULT 'facebook' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_forge"."proposal_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"asset_type" text NOT NULL,
	"path" text NOT NULL,
	"mime_type" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_forge"."proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_type" text NOT NULL,
	"source_media_id" bigint,
	"source_chunk_ids" bigint[] DEFAULT '{}',
	"source_segment_ids" bigint[] DEFAULT '{}',
	"topic" text,
	"calendar_context" jsonb DEFAULT '{}',
	"title" text,
	"body" text,
	"start_seconds" numeric,
	"end_seconds" numeric,
	"template_id" uuid,
	"score" numeric,
	"status" text DEFAULT 'proposed' NOT NULL,
	"scheduled_for" timestamp with time zone,
	"locked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_forge"."publish_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_id" uuid,
	"proposal_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"mode" text NOT NULL,
	"status" text NOT NULL,
	"external_post_id" text,
	"request" jsonb DEFAULT '{}',
	"response" jsonb DEFAULT '{}',
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_forge"."render_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"input_manifest" jsonb DEFAULT '{}' NOT NULL,
	"output_manifest" jsonb DEFAULT '{}',
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_forge"."review_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"proposal_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"actor" text,
	"before" jsonb,
	"after" jsonb,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_forge"."templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"platform" text DEFAULT 'facebook' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"file_path" text NOT NULL,
	"config" jsonb DEFAULT '{}' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transcript_chunks" (
	"id" bigint PRIMARY KEY NOT NULL,
	"media_id" bigint,
	"segment_ids" bigint[],
	"text" text,
	"embedding" text,
	"topics" text[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transcript_segments" (
	"id" bigint PRIMARY KEY NOT NULL,
	"media_id" bigint,
	"start_time" numeric,
	"end_time" numeric,
	"text" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_forge"."post_queue" ADD CONSTRAINT "post_queue_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "post_forge"."proposals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_forge"."proposal_assets" ADD CONSTRAINT "proposal_assets_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "post_forge"."proposals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_forge"."proposals" ADD CONSTRAINT "proposals_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "post_forge"."templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_forge"."publish_attempts" ADD CONSTRAINT "publish_attempts_queue_id_post_queue_id_fk" FOREIGN KEY ("queue_id") REFERENCES "post_forge"."post_queue"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_forge"."publish_attempts" ADD CONSTRAINT "publish_attempts_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "post_forge"."proposals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_forge"."render_jobs" ADD CONSTRAINT "render_jobs_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "post_forge"."proposals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_forge"."review_events" ADD CONSTRAINT "review_events_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "post_forge"."proposals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

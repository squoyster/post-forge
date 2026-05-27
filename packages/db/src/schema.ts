import { pgTable, uuid, text, integer, boolean, timestamp, jsonb, numeric, bigint, pgSchema } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// video-rag tables (read-only, mapped for type safety)
export const mediaAssets = pgTable("media_assets", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  title: text("title"),
  description: text("description"),
  localMediaPath: text("local_media_path"),
  durationSeconds: numeric("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true }),
});

export const transcriptSegments = pgTable("transcript_segments", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  mediaId: bigint("media_id", { mode: "number" }),
  startTime: numeric("start_time"),
  endTime: numeric("end_time"),
  text: text("text"),
});

export const transcriptChunks = pgTable("transcript_chunks", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  mediaId: bigint("media_id", { mode: "number" }),
  segmentIds: bigint("segment_ids", { mode: "number" }).array(),
  text: text("text"),
  embedding: text("embedding"),
  topics: text("topics").array(),
});

export const clipCandidates = pgTable("clip_candidates", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  mediaId: bigint("media_id", { mode: "number" }),
  startTime: numeric("start_time"),
  endTime: numeric("end_time"),
  score: numeric("score"),
  reason: text("reason"),
});

// post_forge schema tables
export const postForgeSchema = pgSchema("post_forge");

export const templates = postForgeSchema.table("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  platform: text("platform").notNull().default("facebook"),
  version: integer("version").notNull().default(1),
  filePath: text("file_path").notNull(),
  config: jsonb("config").notNull().default("{}"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const proposals = postForgeSchema.table("proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalType: text("proposal_type").notNull(),
  sourceMediaId: bigint("source_media_id", { mode: "number" }),
  sourceChunkIds: bigint("source_chunk_ids", { mode: "number" }).array().default(sql`'{}'`),
  sourceSegmentIds: bigint("source_segment_ids", { mode: "number" }).array().default(sql`'{}'`),
  topic: text("topic"),
  calendarContext: jsonb("calendar_context").default("{}"),
  title: text("title"),
  body: text("body"),
  startSeconds: numeric("start_seconds"),
  endSeconds: numeric("end_seconds"),
  templateId: uuid("template_id").references(() => templates.id),
  score: numeric("score"),
  status: text("status").notNull().default("proposed"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  locked: boolean("locked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const proposalAssets = postForgeSchema.table("proposal_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
  assetType: text("asset_type").notNull(),
  path: text("path").notNull(),
  mimeType: text("mime_type"),
  metadata: jsonb("metadata").default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviewEvents = postForgeSchema.table("review_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  actor: text("actor"),
  before: jsonb("before"),
  after: jsonb("after"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const renderJobs = postForgeSchema.table("render_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  inputManifest: jsonb("input_manifest").notNull().default("{}"),
  outputManifest: jsonb("output_manifest").default("{}"),
  error: text("error"),
  attempts: integer("attempts").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const postQueue = postForgeSchema.table("post_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
  platform: text("platform").notNull().default("facebook"),
  status: text("status").notNull().default("queued"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  priority: integer("priority").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const publishAttempts = postForgeSchema.table("publish_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  queueId: uuid("queue_id").references(() => postQueue.id, { onDelete: "set null" }),
  proposalId: uuid("proposal_id").notNull().references(() => proposals.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  mode: text("mode").notNull(),
  status: text("status").notNull(),
  externalPostId: text("external_post_id"),
  request: jsonb("request").default("{}"),
  response: jsonb("response").default("{}"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calendarObservances = postForgeSchema.table("calendar_observances", {
  id: text("id").primaryKey(),
  tradition: text("tradition").notNull(),
  name: text("name").notNull(),
  dateRule: jsonb("date_rule").notNull(),
  searchTopics: text("search_topics").array().notNull().default(sql`'{}'`),
  postAngles: text("post_angles").array().notNull().default(sql`'{}'`),
  active: boolean("active").notNull().default(true),
  metadata: jsonb("metadata").default("{}"),
});

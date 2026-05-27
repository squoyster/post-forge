import { getDb, mediaAssets, transcriptSegments, transcriptChunks, clipCandidates } from "@post-forge/db";
import { eq, sql, and, gte, lte } from "drizzle-orm";

export interface SearchChunksInput {
  query?: string;
  topics?: string[];
  mediaId?: number;
  limit?: number;
}

export interface SearchChunkResult {
  chunkId: number;
  mediaId: number | null;
  text: string;
  topics: string[] | null;
  score?: number;
}

export interface MediaAsset {
  id: number;
  title: string | null;
  description: string | null;
  localMediaPath: string | null;
  durationSeconds: string | null;
}

export interface TranscriptSegment {
  id: number;
  mediaId: number | null;
  startTime: string | null;
  endTime: string | null;
  text: string | null;
}

export interface ClipCandidate {
  id: number;
  mediaId: number | null;
  startTime: string | null;
  endTime: string | null;
  score: string | null;
  reason: string | null;
}

export interface TopicCount {
  topic: string;
  count: number;
}

export async function searchChunks(input: SearchChunksInput): Promise<SearchChunkResult[]> {
  const db = getDb();
  const limit = input.limit ?? 20;

  if (input.mediaId) {
    const results = await db
      .select()
      .from(transcriptChunks)
      .where(eq(transcriptChunks.mediaId, input.mediaId))
      .limit(limit);

    return results.map((r) => ({
      chunkId: r.id,
      mediaId: r.mediaId,
      text: r.text ?? "",
      topics: r.topics,
    }));
  }

  if (input.topics && input.topics.length > 0) {
    const results = await db
      .select()
      .from(transcriptChunks)
      .where(sql`${transcriptChunks.topics} && ${input.topics}`)
      .limit(limit);

    return results.map((r) => ({
      chunkId: r.id,
      mediaId: r.mediaId,
      text: r.text ?? "",
      topics: r.topics,
    }));
  }

  // Fallback: return most recent chunks
  const results = await db.select().from(transcriptChunks).limit(limit);

  return results.map((r) => ({
    chunkId: r.id,
    mediaId: r.mediaId,
    text: r.text ?? "",
    topics: r.topics,
  }));
}

export async function getMediaAsset(mediaId: number): Promise<MediaAsset | null> {
  const db = getDb();
  const results = await db.select().from(mediaAssets).where(eq(mediaAssets.id, mediaId)).limit(1);
  if (results.length === 0) return null;
  const r = results[0];
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    localMediaPath: r.localMediaPath,
    durationSeconds: r.durationSeconds,
  };
}

export async function getTranscriptWindow(
  mediaId: number,
  start: number,
  end: number
): Promise<TranscriptSegment[]> {
  const db = getDb();
  const results = await db
    .select()
    .from(transcriptSegments)
    .where(
      and(
        eq(transcriptSegments.mediaId, mediaId),
        gte(transcriptSegments.startTime, String(start)),
        lte(transcriptSegments.endTime, String(end))
      )
    )
    .orderBy(transcriptSegments.startTime);

  return results.map((r) => ({
    id: r.id,
    mediaId: r.mediaId,
    startTime: r.startTime,
    endTime: r.endTime,
    text: r.text,
  }));
}

export async function getCandidateClips(mediaId: number): Promise<ClipCandidate[]> {
  const db = getDb();
  const results = await db
    .select()
    .from(clipCandidates)
    .where(eq(clipCandidates.mediaId, mediaId))
    .orderBy(sql`${clipCandidates.score} desc`)
    .limit(20);

  return results.map((r) => ({
    id: r.id,
    mediaId: r.mediaId,
    startTime: r.startTime,
    endTime: r.endTime,
    score: r.score,
    reason: r.reason,
  }));
}

export async function listTopics(): Promise<TopicCount[]> {
  const db = getDb();
  const results = await db.select({ topics: transcriptChunks.topics }).from(transcriptChunks);

  const counts = new Map<string, number>();
  for (const row of results) {
    if (row.topics) {
      for (const topic of row.topics) {
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      }
    }
  }

  return Array.from(counts.entries())
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count);
}

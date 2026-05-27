import { getDb, proposals, templates, reviewEvents } from "@post-forge/db";
import { searchChunks, listTopics, getMediaAsset } from "@post-forge/retrieval";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";

const proposalTypeSchema = z.enum(["text", "video", "audio", "mixed"]);

export interface GenerateTextProposalsInput {
  topics?: string[];
  limit?: number;
}

export interface ProposalOutput {
  id: string;
  proposalType: string;
  sourceMediaId: number | null;
  sourceChunkIds: number[];
  topic: string | null;
  title: string | null;
  body: string | null;
  score: string | null;
  status: string;
  createdAt: Date;
}

export async function generateTextProposals(input: GenerateTextProposalsInput): Promise<ProposalOutput[]> {
  const db = getDb();
  const limit = input.limit ?? 10;

  // Get topics if not provided
  let topics = input.topics;
  if (!topics || topics.length === 0) {
    const topicList = await listTopics();
    topics = topicList.slice(0, 5).map((t) => t.topic);
  }

  if (topics.length === 0) {
    return [];
  }

  // Search chunks for each topic
  const allChunks: Awaited<ReturnType<typeof searchChunks>> = [];
  for (const topic of topics) {
    const chunks = await searchChunks({ topics: [topic], limit: 5 });
    for (const chunk of chunks) {
      // Simple deduplication by chunkId
      if (!allChunks.find((c) => c.chunkId === chunk.chunkId)) {
        allChunks.push(chunk);
      }
    }
  }

  // Get default text template
  const templateRows = await db
    .select()
    .from(templates)
    .where(eq(templates.type, "text"))
    .limit(1);

  const defaultTemplateId = templateRows[0]?.id ?? null;

  // Create proposals
  const created: ProposalOutput[] = [];
  for (const chunk of allChunks.slice(0, limit)) {
    if (!chunk.mediaId) continue;

    const media = await getMediaAsset(chunk.mediaId);

    const title = media?.title ? `Reflection on: ${media.title}` : "Spiritual Reflection";
    const body = chunk.text;

    const result = await db
      .insert(proposals)
      .values({
        proposalType: "text",
        sourceMediaId: chunk.mediaId,
        sourceChunkIds: [chunk.chunkId],
        topic: chunk.topics?.[0] ?? null,
        title,
        body,
        templateId: defaultTemplateId,
        score: "0.5",
        status: "proposed",
      })
      .returning();

    const p = result[0];
    created.push({
      id: p.id,
      proposalType: p.proposalType,
      sourceMediaId: p.sourceMediaId,
      sourceChunkIds: p.sourceChunkIds ?? [],
      topic: p.topic,
      title: p.title,
      body: p.body,
      score: p.score,
      status: p.status,
      createdAt: p.createdAt,
    });
  }

  return created;
}

export async function listProposals(status?: string): Promise<ProposalOutput[]> {
  const db = getDb();
  const results = status
    ? await db.select().from(proposals).where(eq(proposals.status, status)).orderBy(desc(proposals.createdAt)).limit(100)
    : await db.select().from(proposals).orderBy(desc(proposals.createdAt)).limit(100);
  return results.map((p) => ({
    id: p.id,
    proposalType: p.proposalType,
    sourceMediaId: p.sourceMediaId,
    sourceChunkIds: p.sourceChunkIds ?? [],
    topic: p.topic,
    title: p.title,
    body: p.body,
    score: p.score,
    status: p.status,
    createdAt: p.createdAt,
  }));
}

export async function getProposal(id: string): Promise<ProposalOutput | null> {
  const db = getDb();
  const results = await db.select().from(proposals).where(eq(proposals.id, sql`${id}::uuid`)).limit(1);
  if (results.length === 0) return null;
  const p = results[0];
  return {
    id: p.id,
    proposalType: p.proposalType,
    sourceMediaId: p.sourceMediaId,
    sourceChunkIds: p.sourceChunkIds ?? [],
    topic: p.topic,
    title: p.title,
    body: p.body,
    score: p.score,
    status: p.status,
    createdAt: p.createdAt,
  };
}

export async function approveProposal(id: string, actor?: string): Promise<void> {
  const db = getDb();
  const before = await getProposal(id);
  if (!before) throw new Error("Proposal not found");

  await db
    .update(proposals)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(proposals.id, sql`${id}::uuid`));

  await db.insert(reviewEvents).values({
    proposalId: sql`${id}::uuid`,
    eventType: "approved",
    actor: actor ?? "system",
    before: JSON.parse(JSON.stringify(before)),
    after: { status: "approved" },
  });
}

export async function rejectProposal(id: string, actor?: string, note?: string): Promise<void> {
  const db = getDb();
  const before = await getProposal(id);
  if (!before) throw new Error("Proposal not found");

  await db
    .update(proposals)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(proposals.id, sql`${id}::uuid`));

  await db.insert(reviewEvents).values({
    proposalId: sql`${id}::uuid`,
    eventType: "rejected",
    actor: actor ?? "system",
    before: JSON.parse(JSON.stringify(before)),
    after: { status: "rejected" },
    note,
  });
}

export async function updateProposalBody(id: string, title: string, body: string, actor?: string): Promise<void> {
  const db = getDb();
  const before = await getProposal(id);
  if (!before) throw new Error("Proposal not found");

  await db
    .update(proposals)
    .set({ title, body, updatedAt: new Date() })
    .where(eq(proposals.id, sql`${id}::uuid`));

  await db.insert(reviewEvents).values({
    proposalId: sql`${id}::uuid`,
    eventType: "edited",
    actor: actor ?? "system",
    before: JSON.parse(JSON.stringify(before)),
    after: { title, body },
  });
}

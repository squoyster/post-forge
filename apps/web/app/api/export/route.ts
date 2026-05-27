import { NextResponse } from "next/server";
import { getDb, proposals, proposalAssets } from "@post-forge/db";
import { eq } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";
import { resolve } from "path";

export async function POST(request: Request) {
  try {
    const { proposalId } = await request.json();
    if (!proposalId) {
      return NextResponse.json({ error: "proposalId is required" }, { status: 400 });
    }

    const db = getDb();
    const results = await db.select().from(proposals).where(eq(proposals.id, proposalId)).limit(1);
    if (results.length === 0) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const proposal = results[0];
    if (proposal.status !== "approved") {
      return NextResponse.json({ error: "Proposal must be approved before export" }, { status: 400 });
    }

    const exportDir = resolve(process.cwd(), "../../data/export", proposalId);
    await mkdir(exportDir, { recursive: true });

    // Export text body
    const bodyPath = resolve(exportDir, "post.txt");
    const bodyContent = `${proposal.title ?? "Untitled"}\n\n${proposal.body ?? ""}`;
    await writeFile(bodyPath, bodyContent, "utf-8");

    // Export metadata
    const metaPath = resolve(exportDir, "metadata.json");
    const metadata = {
      proposalId: proposal.id,
      type: proposal.proposalType,
      title: proposal.title,
      body: proposal.body,
      topic: proposal.topic,
      sourceMediaId: proposal.sourceMediaId,
      sourceChunkIds: proposal.sourceChunkIds,
      createdAt: proposal.createdAt,
      exportedAt: new Date().toISOString(),
    };
    await writeFile(metaPath, JSON.stringify(metadata, null, 2), "utf-8");

    // Check for rendered assets
    const assets = await db.select().from(proposalAssets).where(eq(proposalAssets.proposalId, proposalId));
    for (const asset of assets) {
      // Assets are already rendered, just note them in metadata
      console.log(`Asset available: ${asset.path}`);
    }

    return NextResponse.json({
      success: true,
      exportDir: `data/export/${proposalId}`,
      files: ["post.txt", "metadata.json"],
    });
  } catch (error) {
    console.error("Failed to export proposal:", error);
    return NextResponse.json({ error: "Failed to export proposal" }, { status: 500 });
  }
}

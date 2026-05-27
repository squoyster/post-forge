import { NextResponse } from "next/server";
import { generateTextProposals } from "@post-forge/proposals";

export async function POST() {
  try {
    const created = await generateTextProposals({ limit: 10 });
    return NextResponse.json({ proposals: created });
  } catch (error) {
    console.error("Failed to generate proposals:", error);
    return NextResponse.json({ error: "Failed to generate proposals" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { listProposals, generateTextProposals } from "@post-forge/proposals";

export async function GET() {
  try {
    const data = await listProposals();
    return NextResponse.json({ proposals: data });
  } catch (error) {
    console.error("Failed to list proposals:", error);
    return NextResponse.json({ error: "Failed to list proposals" }, { status: 500 });
  }
}

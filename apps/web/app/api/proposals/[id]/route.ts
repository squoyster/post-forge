import { NextResponse } from "next/server";
import { getProposal, approveProposal, rejectProposal, updateProposalBody } from "@post-forge/proposals";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const proposal = await getProposal(params.id);
    if (!proposal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("Failed to get proposal:", error);
    return NextResponse.json({ error: "Failed to get proposal" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { action, title, body: newBody, note } = body;

    if (action === "approve") {
      await approveProposal(params.id);
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      await rejectProposal(params.id, undefined, note);
      return NextResponse.json({ success: true });
    }

    if (action === "edit" && title && newBody) {
      await updateProposalBody(params.id, title, newBody);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update proposal:", error);
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 });
  }
}

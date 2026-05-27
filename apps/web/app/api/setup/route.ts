import { NextResponse } from "next/server";
import { loadTemplatesIntoDb } from "@/lib/templates";

export async function POST() {
  try {
    await loadTemplatesIntoDb();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to load templates:", error);
    return NextResponse.json({ error: "Failed to load templates" }, { status: 500 });
  }
}

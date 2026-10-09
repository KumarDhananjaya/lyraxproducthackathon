import { NextResponse } from "next/server";
import { getUserDisputes, saveDisputeCase } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId parameter required" }, { status: 400 });
    }

    const disputes = await getUserDisputes(userId);
    return NextResponse.json({ disputes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, disputeCase } = body;

    if (!userId || !disputeCase) {
      return NextResponse.json({ error: "userId and disputeCase required" }, { status: 400 });
    }

    const disputeId = await saveDisputeCase(userId, disputeCase);
    return NextResponse.json({
      success: true,
      disputeId,
      message: "Dispute successfully saved to Supabase",
    });
  } catch (error: any) {
    console.error("Save dispute error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

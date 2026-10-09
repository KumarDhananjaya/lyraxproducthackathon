import { NextResponse } from "next/server";
import { getFullDisputeCase } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const disputeCase = await getFullDisputeCase(id);

    if (!disputeCase) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
    }

    return NextResponse.json({ disputeCase });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

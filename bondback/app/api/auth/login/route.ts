import { NextResponse } from "next/server";
import { getOrCreateUser, getUserDisputes } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, fullName } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const name = fullName && typeof fullName === "string" ? fullName : email.split("@")[0];
    const user = await getOrCreateUser(email, name);
    const disputes = await getUserDisputes(user.id);

    return NextResponse.json({
      success: true,
      user,
      disputes,
    });
  } catch (error: any) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed", detail: error?.message },
      { status: 500 }
    );
  }
}

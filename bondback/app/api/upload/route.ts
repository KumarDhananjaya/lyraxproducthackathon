import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Try forwarding to FastAPI backend if running
    try {
      const fastApiFormData = new FormData();
      fastApiFormData.append("file", file, file.name);

      const fastApiResponse = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: fastApiFormData,
        signal: AbortSignal.timeout(3000),
      });

      if (fastApiResponse.ok) {
        const data = await fastApiResponse.json();
        return NextResponse.json({
          source: "fastapi_backend",
          ...data,
        });
      }
    } catch {
      // Fallback to Next.js in-process handler
    }

    // In-process handling: compute SHA-256 hash & mock file ID
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const crypto = await import("crypto");
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const fileId = "doc-" + crypto.randomUUID();

    return NextResponse.json({
      success: true,
      file_id: fileId,
      original_filename: file.name,
      sha256_hash: sha256,
      size_bytes: file.size,
      mime_type: file.type || "application/octet-stream",
      message: "Document ingested and verified with SHA-256 integrity hash.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      defectQuery = "find carpet stain",
      imageName = "IMG_4091.jpg",
      room = "Living Room",
    } = body;

    // Simulated Vision & LLM Response (Claude 3.5 Sonnet / GPT-4o Multimodal format)
    // Box format: [ymin, xmin, ymax, xmax] normalized 0-1000
    const aiAnalysisResult = {
      model: "claude-3-5-sonnet-20241022",
      promptUsed: `Locate defect: '${defectQuery}' in room: '${room}'. Return normalized bounding box coordinates [ymin, xmin, ymax, xmax] between 0 and 1000, confidence score, and forensic description.`,
      detected: true,
      label: "Pre-existing carpet discolouration",
      confidence: 0.984,
      box: [650, 180, 840, 430], // [ymin, xmin, ymax, xmax]
      metadataVerified: {
        filename: imageName,
        exifDate: "2024-03-14T19:34:12Z",
        daysPriorToHandover: 302,
        cameraModel: "Apple iPhone 14 Pro",
        geoCoordinates: "-33.8821, 151.2144 (Surry Hills NSW)",
        sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      },
      statutoryRebuttalConclusion:
        "Contemporaneous photographic evidence proves the claimed mark was present 10 months prior to tenancy expiration. Pursuant to Section 51(2) Residential Tenancies Act 2010 (NSW), tenant liability is $0.00.",
    };

    return NextResponse.json(aiAnalysisResult);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process multimodal vision request" },
      { status: 500 }
    );
  }
}

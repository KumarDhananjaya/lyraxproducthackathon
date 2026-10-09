"""
BondBack — AI Analysis & Workflow Router
Executes multimodal vision mining, claim parsing, and full end-to-end dispute workflows.
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.config import get_settings
from app.logging_config import get_logger
from app.middleware.security import limiter
from app.models.schemas import (
    AnalyzeWorkflowRequest,
    AnalyzeWorkflowResponse,
    ParsedClaimResponse,
    VisionFindingResponse,
)
from app.services.ai_service import ai_service
from app.services.storage import extract_exif_metadata, storage_service
from app.services.workflow_orchestrator import get_document, workflow_orchestrator

router = APIRouter(prefix="/api/analyze", tags=["Analyze"])
logger = get_logger("analyze_router")
settings = get_settings()


class ParseClaimRequest(BaseModel):
    claim_text: str


class AnalyzeDefectRequest(BaseModel):
    file_id: str
    defect_query: str = "find carpet stain"
    room: str = "Living Room"


@router.post("/workflow", response_model=AnalyzeWorkflowResponse)
@limiter.limit(settings.rate_limit_analyze)
async def process_full_workflow(
    request: Request,
    payload: AnalyzeWorkflowRequest,
):
    """
    Complete end-to-end AI dispute pipeline:
    1. Parses landlord deduction items
    2. Runs Multimodal Vision background defect mining on uploaded photos
    3. Calculates ATO TR 2022/1 & Tenancy Act statutory depreciation caps
    4. Synthesizes formal citation-backed legal dispute paragraphs
    5. Returns complete metrics & counter-offer package
    """
    logger.info("running_full_dispute_workflow", file_ids=payload.file_ids)
    try:
        response = await workflow_orchestrator.process_dispute_workflow(payload)
        return response
    except Exception as e:
        logger.error("workflow_execution_failed", error=str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI workflow failed: {str(e)}")


@router.post("/claim", response_model=ParsedClaimResponse)
@limiter.limit(settings.rate_limit_analyze)
async def parse_claim_text(
    request: Request,
    payload: ParseClaimRequest,
):
    """
    Parses unstructured landlord email / notice text into structured items.
    """
    if not payload.claim_text.strip():
        raise HTTPException(status_code=400, detail="Claim text cannot be empty")
    return await ai_service.parse_landlord_claim(payload.claim_text)


@router.post("/defect", response_model=VisionFindingResponse)
@limiter.limit(settings.rate_limit_analyze)
async def analyze_single_defect(
    request: Request,
    payload: AnalyzeDefectRequest,
):
    """
    Runs multimodal vision defect detection on a specific previously-uploaded image.
    """
    doc = get_document(payload.file_id)
    if not doc:
        raise HTTPException(status_code=404, detail="File ID not found in current session")

    img_bytes = await storage_service.read_file_bytes(doc.stored_filename)
    if not img_bytes:
        raise HTTPException(status_code=404, detail="File content missing on storage")

    exif_time, camera, gps = extract_exif_metadata(img_bytes)

    return await ai_service.analyze_photo_defect(
        file_id=doc.file_id,
        image_bytes=img_bytes,
        filename=doc.original_filename,
        defect_query=payload.defect_query,
        room=payload.room,
        exif_timestamp=exif_time,
        camera_model=camera,
        gps_location=gps,
        sha256_hash=doc.sha256_hash,
    )

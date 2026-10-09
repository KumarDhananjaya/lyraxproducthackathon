"""
BondBack — Document & Photo Ingestion Router
Accepts multipart file uploads with strict security validation.
"""
from typing import List
from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from app.config import get_settings
from app.logging_config import get_logger
from app.middleware.security import limiter
from app.models.schemas import UploadResponse
from app.services.storage import storage_service
from app.services.workflow_orchestrator import register_document

router = APIRouter(prefix="/api/upload", tags=["Upload"])
logger = get_logger("upload_router")
settings = get_settings()


@router.post("", response_model=UploadResponse)
@limiter.limit(settings.rate_limit_upload)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
):
    """
    Ingests a single dispute document or evidentiary photo.
    Verifies magic byte headers, enforces 20MB limit, hashes SHA-256 for court admissibility.
    """
    logger.info("upload_initiated", filename=file.filename, content_type=file.content_type)

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename cannot be empty")

    content = await file.read()

    try:
        doc = await storage_service.save_uploaded_file(
            filename=file.filename,
            content=content,
            reported_mime=file.content_type or "application/octet-stream",
        )
        # Register in session database
        register_document(doc)

        return UploadResponse(
            success=True,
            file_id=doc.file_id,
            original_filename=doc.original_filename,
            sha256_hash=doc.sha256_hash,
            size_bytes=doc.size_bytes,
            mime_type=doc.mime_type,
            message="Document verified, hashed with SHA-256, and stored for forensic mining.",
        )

    except ValueError as e:
        logger.warning("upload_validation_failed", filename=file.filename, error=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("upload_internal_error", filename=file.filename, error=str(e))
        raise HTTPException(status_code=500, detail="Failed to safely process uploaded document")


@router.post("/batch", response_model=List[UploadResponse])
@limiter.limit("5/minute")
async def upload_batch_documents(
    request: Request,
    files: List[UploadFile] = File(...),
):
    """
    Batch ingestion for multiple camera roll photos and condition reports.
    """
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per batch upload")

    responses: List[UploadResponse] = []
    for f in files:
        content = await f.read()
        try:
            doc = await storage_service.save_uploaded_file(
                filename=f.filename or "upload",
                content=content,
                reported_mime=f.content_type or "application/octet-stream",
            )
            register_document(doc)
            responses.append(
                UploadResponse(
                    success=True,
                    file_id=doc.file_id,
                    original_filename=doc.original_filename,
                    sha256_hash=doc.sha256_hash,
                    size_bytes=doc.size_bytes,
                    mime_type=doc.mime_type,
                    message="Ingested successfully.",
                )
            )
        except ValueError as ve:
            responses.append(
                UploadResponse(
                    success=False,
                    file_id="",
                    original_filename=f.filename or "unknown",
                    sha256_hash="",
                    size_bytes=len(content),
                    mime_type=f.content_type or "unknown",
                    message=f"Validation failed: {str(ve)}",
                )
            )

    return responses

"""
BondBack — End-to-End Dispute Workflow Orchestrator
Executes the full pipeline:
1. Ingests uploaded documents & extracts claims
2. Runs Multimodal Vision Background Mining on photos
3. Calculates ATO TR 2022/1 Statutory Caps & Betterment Limits
4. Synthesizes formal citation-backed Rebuttal Arguments
5. Computes net tenant savings and tribunal dossier metrics
"""
import time
import uuid
from typing import Dict, List, Optional

from app.logging_config import get_logger
from app.models.schemas import (
    AnalyzeWorkflowRequest,
    AnalyzeWorkflowResponse,
    ClaimCategory,
    DepreciationResult,
    DocumentType,
    ParsedClaimResponse,
    RebuttalDraft,
    UploadedDocument,
    VisionFindingResponse,
)
from app.services.ai_service import ai_service
from app.services.depreciation_service import depreciation_service
from app.services.storage import extract_exif_metadata, storage_service

logger = get_logger("workflow_orchestrator")

# In-memory document registry for uploaded files during active session
DOCUMENTS_DB: Dict[str, UploadedDocument] = {}


def register_document(doc: UploadedDocument):
    DOCUMENTS_DB[doc.file_id] = doc


def get_document(file_id: str) -> Optional[UploadedDocument]:
    return DOCUMENTS_DB.get(file_id)


class WorkflowOrchestrator:
    async def process_dispute_workflow(
        self,
        request: AnalyzeWorkflowRequest,
    ) -> AnalyzeWorkflowResponse:
        start_time = time.time()
        workflow_id = str(uuid.uuid4())

        logger.info(
            "dispute_workflow_started",
            workflow_id=workflow_id,
            file_count=len(request.file_ids),
        )

        # 1. Retrieve all uploaded documents
        docs: List[UploadedDocument] = []
        for fid in request.file_ids:
            doc = get_document(fid)
            if doc:
                docs.append(doc)
            else:
                logger.warning("document_not_found_in_session", file_id=fid)

        # 2. Extract or Parse Landlord Claim
        claim_text = request.claim_text or ""
        # If no claim text provided but a claim document exists, read it
        if not claim_text:
            for d in docs:
                if d.document_type == DocumentType.claim_notice:
                    raw_bytes = await storage_service.read_file_bytes(d.stored_filename)
                    if raw_bytes:
                        try:
                            claim_text = raw_bytes.decode("utf-8", errors="ignore")
                        except Exception:
                            pass
                    break

        if not claim_text:
            # Default sample dispute text if nothing was pasted
            claim_text = (
                "Bond Deduction Notice: 1. Full Living room carpet replacement: $850.00. "
                "2. Entrance hallway repainting: $450.00. "
                "3. Deep cleaning of kitchen oven: $300.00. Total claim: $1,600.00."
            )

        parsed_claim: ParsedClaimResponse = await ai_service.parse_landlord_claim(claim_text)

        # Override metadata if provided explicitly
        if request.tenant_name:
            parsed_claim.tenant_name = request.tenant_name
        if request.property_address:
            parsed_claim.property_address = request.property_address

        # 3. Vision Defect Mining on all uploaded photo documents
        vision_findings: List[VisionFindingResponse] = []
        has_carpet_pre_existing_proof = False
        has_paint_pre_existing_proof = False

        photo_docs = [d for d in docs if d.mime_type.startswith("image/")]

        # Check if condition report was uploaded in the session
        has_condition_report = any(d.document_type == DocumentType.condition_report for d in docs)
        if has_condition_report:
            has_paint_pre_existing_proof = True

        # If photo docs were uploaded, process them
        if photo_docs:
            for p_doc in photo_docs:
                img_bytes = await storage_service.read_file_bytes(p_doc.stored_filename)
                if not img_bytes:
                    continue

                exif_time, camera, gps = extract_exif_metadata(img_bytes)

                finding = await ai_service.analyze_photo_defect(
                    file_id=p_doc.file_id,
                    image_bytes=img_bytes,
                    filename=p_doc.original_filename,
                    defect_query="find carpet stain and wall scuff",
                    room="Living Room",
                    exif_timestamp=exif_time,
                    camera_model=camera,
                    gps_location=gps,
                    sha256_hash=p_doc.sha256_hash,
                )
                vision_findings.append(finding)
                if finding.defect_found:
                    has_carpet_pre_existing_proof = True
                    has_paint_pre_existing_proof = True
        else:
            # Generate simulated finding from Sarah's pre-loaded evidence
            finding = await ai_service.analyze_photo_defect(
                file_id="sample-ev-1",
                image_bytes=b"",
                filename="IMG_4091.jpg",
                defect_query="find carpet stain",
                room="Living Room",
                exif_timestamp="2024-03-14T19:34:12Z",
                camera_model="Apple iPhone 14 Pro",
                gps_location="-33.8821, 151.2144 (Surry Hills NSW)",
                sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            )
            vision_findings.append(finding)
            has_carpet_pre_existing_proof = True
            has_paint_pre_existing_proof = True

        # 4. Calculate Statutory Wear-and-Tear Depreciation for each Claim Item
        depreciation_results: List[DepreciationResult] = []
        rebuttal_drafts: List[RebuttalDraft] = []

        for item in parsed_claim.items:
            has_proof = False
            if item.category == ClaimCategory.carpet and has_carpet_pre_existing_proof:
                has_proof = True
            elif item.category == ClaimCategory.painting and has_paint_pre_existing_proof:
                has_proof = True

            dep_calc = depreciation_service.calculate_statutory_liability(
                category=item.category,
                claim_amount=item.amount_claimed,
                item_age_years=item.item_age_years,
                has_pre_existing_proof=has_proof,
            )
            depreciation_results.append(dep_calc)

            # 5. Synthesize Rebuttal Paragraph
            rebuttal = await ai_service.generate_rebuttal(
                category=item.category,
                room=item.room,
                amount_claimed=item.amount_claimed,
                counter_offer=dep_calc.counter_offer,
                has_pre_existing_proof=has_proof,
                item_age_years=item.item_age_years,
            )
            rebuttal_drafts.append(rebuttal)

        # 6. Aggregate Totals
        total_claimed = sum(i.amount_claimed for i in parsed_claim.items)
        statutory_cap_total = sum(d.statutory_legal_cap for d in depreciation_results)
        counter_offer_total = sum(d.counter_offer for d in depreciation_results)
        savings_amount = total_claimed - counter_offer_total
        savings_percent = round((savings_amount / total_claimed) * 100, 1) if total_claimed > 0 else 0.0

        elapsed_ms = int((time.time() - start_time) * 1000)

        logger.info(
            "dispute_workflow_completed",
            workflow_id=workflow_id,
            total_claimed=total_claimed,
            statutory_cap=statutory_cap_total,
            counter_offer=counter_offer_total,
            savings=savings_amount,
            elapsed_ms=elapsed_ms,
        )

        return AnalyzeWorkflowResponse(
            workflow_id=workflow_id,
            parsed_claim=parsed_claim,
            vision_findings=vision_findings,
            depreciation_results=depreciation_results,
            rebuttal_drafts=rebuttal_drafts,
            total_claimed=round(total_claimed, 2),
            statutory_cap_total=round(statutory_cap_total, 2),
            counter_offer_total=round(counter_offer_total, 2),
            savings_amount=round(savings_amount, 2),
            savings_percent=savings_percent,
            processing_time_ms=elapsed_ms,
        )


workflow_orchestrator = WorkflowOrchestrator()

"""
BondBack — Pydantic Data Models (API I/O Contracts)
"""
from __future__ import annotations

import uuid
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ─── Enums ───────────────────────────────────────────────────────────────────

class ClaimCategory(str, Enum):
    carpet = "Carpet"
    painting = "Painting"
    cleaning = "Cleaning"
    fixtures = "Fixtures"


class AIProvider(str, Enum):
    anthropic = "anthropic"
    openai = "openai"
    mock = "mock"


class DocumentType(str, Enum):
    casual_photo = "casual_photo"
    condition_report = "condition_report"
    routine_inspection = "routine_inspection"
    receipt = "receipt"
    claim_notice = "claim_notice"


# ─── Upload Models ────────────────────────────────────────────────────────────

class UploadedDocument(BaseModel):
    """Represents a validated, stored uploaded file."""
    file_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    original_filename: str
    stored_filename: str
    mime_type: str
    size_bytes: int
    sha256_hash: str
    document_type: DocumentType
    upload_timestamp: str  # ISO 8601


class UploadResponse(BaseModel):
    success: bool
    file_id: str
    original_filename: str
    sha256_hash: str
    size_bytes: int
    mime_type: str
    message: str


# ─── Claim Parsing Models ─────────────────────────────────────────────────────

class ParsedClaimItem(BaseModel):
    """A single deduction item extracted by LLM from a landlord claim notice."""
    category: ClaimCategory
    room: str
    amount_claimed: float
    landlord_description: str
    item_age_years: float = Field(ge=0, le=50)


class ParsedClaimResponse(BaseModel):
    """Full parsed result from a landlord notice (email / PDF / text)."""
    raw_text: str
    items: List[ParsedClaimItem]
    managing_agent: Optional[str] = None
    tenant_name: Optional[str] = None
    property_address: Optional[str] = None
    total_claimed: float
    model_used: str
    tokens_used: int


# ─── Vision / Forensic Models ─────────────────────────────────────────────────

class BoundingBox(BaseModel):
    """Normalized [ymin, xmin, ymax, xmax] in 0-1000 coordinate space."""
    ymin: int = Field(ge=0, le=1000)
    xmin: int = Field(ge=0, le=1000)
    ymax: int = Field(ge=0, le=1000)
    xmax: int = Field(ge=0, le=1000)

    @field_validator("ymax")
    @classmethod
    def ymax_gt_ymin(cls, v: int, info) -> int:
        if "ymin" in info.data and v <= info.data["ymin"]:
            raise ValueError("ymax must be greater than ymin")
        return v

    @field_validator("xmax")
    @classmethod
    def xmax_gt_xmin(cls, v: int, info) -> int:
        if "xmin" in info.data and v <= info.data["xmin"]:
            raise ValueError("xmax must be greater than xmin")
        return v


class VisionFindingResponse(BaseModel):
    """Returned by the vision/defect-detection AI call."""
    file_id: str
    defect_found: bool
    bounding_box: Optional[BoundingBox] = None
    label: str
    confidence: float = Field(ge=0.0, le=1.0)
    ai_finding: str
    statutory_defense_rationale: str
    exif_timestamp: Optional[str] = None
    camera_model: Optional[str] = None
    gps_location: Optional[str] = None
    sha256_hash: str
    model_used: str
    tokens_used: int


# ─── Depreciation / Rebuttal Models ──────────────────────────────────────────

class DepreciationInput(BaseModel):
    category: ClaimCategory
    claim_amount: float = Field(gt=0)
    item_age_years: float = Field(ge=0, le=50)
    has_pre_existing_proof: bool = False


class DepreciationResult(BaseModel):
    category: ClaimCategory
    statutory_lifespan_years: float
    item_age_years: float
    remaining_value_percentage: float
    statutory_legal_cap: float
    counter_offer: float
    formula_explanation: str
    statutory_authority: str
    tribunal_citation: str


class RebuttalDraft(BaseModel):
    """Auto-generated formal dispute paragraph for a single claim item."""
    claim_category: ClaimCategory
    room: str
    amount_claimed: float
    counter_offer: float
    rebuttal_paragraph: str
    citations: List[str]
    model_used: str
    tokens_used: int


# ─── Full Workflow Response ───────────────────────────────────────────────────

class AnalyzeWorkflowRequest(BaseModel):
    """
    Front-end sends this after uploading files.
    file_ids — list of previously uploaded file UUIDs.
    claim_text — raw landlord email / notice text (optional if PDF uploaded).
    """
    file_ids: List[str] = Field(min_length=1, max_length=20)
    claim_text: Optional[str] = Field(default=None, max_length=10_000)
    tenant_name: Optional[str] = Field(default=None, max_length=200)
    property_address: Optional[str] = Field(default=None, max_length=500)


class AnalyzeWorkflowResponse(BaseModel):
    workflow_id: str
    parsed_claim: Optional[ParsedClaimResponse] = None
    vision_findings: List[VisionFindingResponse] = []
    depreciation_results: List[DepreciationResult] = []
    rebuttal_drafts: List[RebuttalDraft] = []
    total_claimed: float
    statutory_cap_total: float
    counter_offer_total: float
    savings_amount: float
    savings_percent: float
    processing_time_ms: int


# ─── API Error Response ───────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    correlation_id: str

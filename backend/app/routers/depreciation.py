"""
BondBack — Statutory Depreciation Calculator Router
"""
from fastapi import APIRouter
from app.models.schemas import DepreciationInput, DepreciationResult
from app.services.depreciation_service import STATUTORY_BENCHMARKS, depreciation_service

router = APIRouter(prefix="/api/calculate", tags=["Depreciation"])


@router.post("/depreciation", response_model=DepreciationResult)
def calculate_asset_depreciation(payload: DepreciationInput):
    """
    Calculates straight-line statutory depreciation under ATO TR 2022/1 & Tenancies Act § 51(2).
    """
    return depreciation_service.calculate_statutory_liability(
        category=payload.category,
        claim_amount=payload.claim_amount,
        item_age_years=payload.item_age_years,
        has_pre_existing_proof=payload.has_pre_existing_proof,
    )


@router.get("/benchmarks")
def get_statutory_benchmarks():
    """
    Returns legal asset lifespan benchmarks across Carpet, Painting, Cleaning, and Fixtures.
    """
    return STATUTORY_BENCHMARKS

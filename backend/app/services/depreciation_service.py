"""
BondBack — Statutory Depreciation & Legal Rules Engine
Implements Australian Tax Office (ATO TR 2022/1) effective life schedules
and Residential Tenancies Act 2010 (NSW) § 51(2) & § 166 Betterment Prohibition.
"""
from typing import Dict
from app.models.schemas import ClaimCategory, DepreciationResult

STATUTORY_BENCHMARKS: Dict[ClaimCategory, dict] = {
    ClaimCategory.carpet: {
        "standard_lifespan_years": 10.0,
        "authority": "ATO Taxation Ruling TR 2022/1 (Effective life of depreciating assets - Carpets)",
        "citation": "Residential Tenancies Act 2010 (NSW) § 51(2) & VCAT Betterment Precedents",
        "notes": "Wool/nylon carpets have a 10-year effective economic lifespan. Landlord cannot claim new-for-old replacement.",
    },
    ClaimCategory.painting: {
        "standard_lifespan_years": 5.0,
        "authority": "ATO Depreciation Schedule Table A (Residential Property - Internal Paintwork)",
        "citation": "NCAT Procedural Direction 3 & RTA 2010 § 166 (Betterment Bar)",
        "notes": "Internal architectural paintwork carries a 5-year useful life. Normal friction marks over 3+ years constitute fair wear and tear.",
    },
    ClaimCategory.cleaning: {
        "standard_lifespan_years": 0.0,
        "authority": "Residential Tenancies Act 2010 (NSW) § 51(1)",
        "citation": "Fair Trading Standard Lease Agreement Cl. 23 - Reasonably Clean Standard",
        "notes": "Service charge. Tenant obligation is 'reasonably clean' having regard to move-in condition, not mandatory showroom steam cleaning.",
    },
    ClaimCategory.fixtures: {
        "standard_lifespan_years": 12.0,
        "authority": "ATO TR 2022/1 (Electrical, Rangehoods, Window Furnishings)",
        "citation": "Residential Tenancies Act 2010 (NSW) § 51",
        "notes": "Rangehood motors, blinds, taps carry 10-15 year lifespan. Normal operational mechanical friction is not tenant liability.",
    },
}


class DepreciationService:
    @staticmethod
    def calculate_statutory_liability(
        category: ClaimCategory,
        claim_amount: float,
        item_age_years: float,
        has_pre_existing_proof: bool = False,
    ) -> DepreciationResult:
        benchmark = STATUTORY_BENCHMARKS.get(category, STATUTORY_BENCHMARKS[ClaimCategory.fixtures])
        lifespan = benchmark["standard_lifespan_years"]

        if lifespan <= 0:
            # Cleaning / service charge
            counter_offer = 0.0 if has_pre_existing_proof else min(120.0, round(claim_amount * 0.4, 2))
            return DepreciationResult(
                category=category,
                statutory_lifespan_years=0.0,
                item_age_years=item_age_years,
                remaining_value_percentage=0.0,
                statutory_legal_cap=round(claim_amount, 2),
                counter_offer=counter_offer,
                formula_explanation="Service item: Evaluated against Section 51(1) 'reasonably clean' baseline. Goodwill counter-offer applied.",
                statutory_authority=benchmark["authority"],
                tribunal_citation=benchmark["citation"],
            )

        # Straight-line depreciation calculation
        age_ratio = min(1.0, max(0.0, item_age_years / lifespan))
        remaining_percentage = max(0.0, (1.0 - age_ratio) * 100.0)
        remaining_value = (claim_amount * remaining_percentage) / 100.0
        statutory_cap = round(remaining_value, 2)

        # If contemporaneous evidence proves damage was pre-existing, liability is $0.00!
        counter_offer = 0.0 if has_pre_existing_proof else statutory_cap

        formula_desc = (
            f"Asset Lifespan = {lifespan} yrs, Current Age = {item_age_years} yrs. "
            f"Remaining Asset Value = {remaining_percentage:.1f}%. Statutory Cap = ${statutory_cap:.2f}."
        )

        return DepreciationResult(
            category=category,
            statutory_lifespan_years=lifespan,
            item_age_years=item_age_years,
            remaining_value_percentage=round(remaining_percentage, 1),
            statutory_legal_cap=statutory_cap,
            counter_offer=counter_offer,
            formula_explanation=formula_desc,
            statutory_authority=benchmark["authority"],
            tribunal_citation=benchmark["citation"],
        )


depreciation_service = DepreciationService()

import { ClaimCategory } from "./types";

export interface StatutoryAssetBenchmark {
  category: ClaimCategory;
  standardLifespanYears: number;
  statutoryAuthority: string;
  tribunalRulingCitation: string;
  fairWearAndTearNotes: string;
}

export const STATUTORY_BENCHMARKS: Record<ClaimCategory, StatutoryAssetBenchmark> = {
  Carpet: {
    category: "Carpet",
    standardLifespanYears: 10,
    statutoryAuthority: "ATO Taxation Ruling TR 2022/1 & Tenancy Practice Guide",
    tribunalRulingCitation: "Section 51(2) Residential Tenancies Act 2010 (NSW) / VCAT Guidelines on Carpet Depreciation",
    fairWearAndTearNotes:
      "Carpets are recognized as having a 10-year effective lifespan. Landlords are prohibited from claiming 'new for old' replacement and can only claim the unexpired depreciated value, reduced further if pre-existing wear or normal transit wear occurred.",
  },
  Painting: {
    category: "Painting",
    standardLifespanYears: 5,
    statutoryAuthority: "ATO Asset Depreciation Schedule Table A (Residential Property)",
    tribunalRulingCitation: "NCAT Procedural Direction 3 & Section 166 Tenancies Act (Betterment Prohibition)",
    fairWearAndTearNotes:
      "Interior paint has a recognized 5-year commercial life. Minor scuffs, picture hook markings, and natural sunlight fading constitute statutory fair wear and tear. A landlord cannot charge full repainting for walls painted over 4 years ago.",
  },
  Cleaning: {
    category: "Cleaning",
    standardLifespanYears: 0, // Service item
    statutoryAuthority: "Residential Tenancies Act 2010 (NSW) Section 51(1)",
    tribunalRulingCitation: "Fair Trading Standard Lease Cl. 23 - Reasonably Clean Standard",
    fairWearAndTearNotes:
      "A tenant is only legally required to leave the property in a 'reasonably clean condition having regard to condition at lease start'. Landlords cannot enforce mandatory commercial/professional cleaning clauses unless explicitly agreed with domestic animal clauses.",
  },
  Fixtures: {
    category: "Fixtures",
    standardLifespanYears: 12,
    statutoryAuthority: "ATO TR 2022/1 (Electrical, Plumbing and Window Furnishings)",
    tribunalRulingCitation: "Residential Tenancies Act 2010 Section 51 & Consumer Tribunal Precedent",
    fairWearAndTearNotes:
      "Fixtures (rangehoods, blinds, taps, door latches) carry 10-15 year statutory life. Wear caused by normal friction, steam, or mechanical operation is not tenant liability.",
  },
};

/**
 * Calculates straight-line statutory wear and tear depreciated value
 *
 * @param claimAmount Initial replacement quote claimed by landlord
 * @param ageYears Age of the item at move-out in years
 * @param lifespanYears Standard statutory lifespan in years
 * @param hasPreExistingProof If AI evidence proves damage was pre-existing
 * @returns Object containing remaining percentage, maximum legal liability cap, and recommended counter-offer
 */
export function calculateStatutoryLiability({
  claimAmount,
  ageYears,
  lifespanYears,
  hasPreExistingProof = false,
}: {
  claimAmount: number;
  ageYears: number;
  lifespanYears: number;
  hasPreExistingProof?: boolean;
}) {
  if (lifespanYears <= 0) {
    // Service charge like cleaning
    return {
      remainingLifespanYears: 0,
      remainingAssetPercentage: 0,
      statutoryLegalMax: claimAmount,
      counterOffer: hasPreExistingProof ? 0 : Math.min(120, claimAmount * 0.4),
      formulaExplanation: "Service item: Evaluated against 'Reasonably Clean' baseline under Section 51(1).",
    };
  }

  // Straight line depreciation
  const ageRatio = Math.min(1, Math.max(0, ageYears / lifespanYears));
  const remainingPercentage = Math.max(0, (1 - ageRatio) * 100);
  const remainingValue = (claimAmount * remainingPercentage) / 100;
  const statutoryLegalMax = Math.round(remainingValue * 100) / 100;

  // If tenant has indisputable pre-existing evidence, tenant liability is $0.00!
  const counterOffer = hasPreExistingProof ? 0 : statutoryLegalMax;

  return {
    remainingLifespanYears: Math.max(0, lifespanYears - ageYears),
    remainingAssetPercentage: Math.round(remainingPercentage * 10) / 10,
    statutoryLegalMax,
    counterOffer,
    formulaExplanation: `Asset Lifespan = ${lifespanYears} yrs, Current Age = ${ageYears} yrs. Remaining Asset Value = ${remainingPercentage.toFixed(1)}%. Statutory Cap = $${statutoryLegalMax.toFixed(2)}.`,
  };
}

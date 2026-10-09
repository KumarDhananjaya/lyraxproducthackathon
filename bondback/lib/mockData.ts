import { DisputeCase, LandlordClaimItem, EvidenceItem, RebuttalLineItem, TimelineEvent } from "./types";
import { calculateStatutoryLiability, STATUTORY_BENCHMARKS } from "./depreciation";

export const MOCK_CLAIM_ITEMS: LandlordClaimItem[] = [
  {
    id: "claim-1",
    category: "Carpet",
    room: "Living Room",
    amountClaimed: 850.0,
    landlordDescription:
      "Severe red wine / organic discoloration to living room wool carpet. Requires full room carpet replacement and underlay replacement per contractor invoice.",
    itemAgeYears: 8.5,
    initialInstallCost: 1200.0,
  },
  {
    id: "claim-2",
    category: "Painting",
    room: "Entrance Hallway",
    amountClaimed: 450.0,
    landlordDescription:
      "Extensive dark scuffing and friction marks across lower 1.2m of hallway entry wall. Requires prep, sanding, and two full coats of paint.",
    itemAgeYears: 4.8,
    initialInstallCost: 600.0,
  },
  {
    id: "claim-3",
    category: "Cleaning",
    room: "Kitchen & Rangehood",
    amountClaimed: 300.0,
    landlordDescription:
      "Oven interior carbon residue and rangehood grease filters failed post-tenancy inspection standards. Commercial deep steam sanitization required.",
    itemAgeYears: 0.0,
  },
];

export const MOCK_EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: "ev-1",
    filename: "IMG_4091.jpg",
    timestamp: "2024-03-14T19:34:12Z",
    room: "Living Room",
    photoUrl: "/evidence/living_room_birthday_mined.svg",
    isBackgroundMining: true,
    boundingBox: [650, 180, 840, 430], // [ymin, xmin, ymax, xmax] normalized 0-1000
    aiFinding:
      "AI Finding: Pre-existing carpet mark detected in background of IMG_4091.jpg (Date: 14 March 2024, 10 months prior to move-out). Spectral analysis matches exact coordinates of landlord's move-out defect claim. Refutes landlord claim of new move-out damage.",
    cameraModel: "Apple iPhone 14 Pro (f/1.78, 24mm)",
    gpsLocation: "-33.8821, 151.2144 (Surry Hills, NSW)",
    sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    evidenceType: "casual_photo",
  },
  {
    id: "ev-2",
    filename: "MOVE_IN_REPORT_PAGE4.jpg",
    timestamp: "2022-02-15T10:15:00Z",
    room: "Entrance Hallway",
    photoUrl: "/evidence/hallway_move_in_scuff.svg",
    isBackgroundMining: false,
    boundingBox: [520, 290, 710, 580],
    aiFinding:
      "AI Finding: Entry Condition Report signed 15 Feb 2022 explicitly noted 'minor scuff marks on entry baseboard & hallway plasterboard'. Corroborates pre-existing condition and triggers Section 166 Betterment Prohibition.",
    cameraModel: "Agent Canon EOS 400D",
    gpsLocation: "Surry Hills Agency On-boarding",
    sha256Hash: "7d1f5b08c2a392849e78298b31a8bc8e91986c738ef265b4c1042718ec495a81",
    evidenceType: "condition_report",
  },
  {
    id: "ev-3",
    filename: "RECEIPT_PRO_CLEAN_2025.pdf",
    timestamp: "2025-01-09T14:20:00Z",
    room: "Kitchen & Rangehood",
    photoUrl: "/evidence/cleaning_invoice.svg",
    isBackgroundMining: false,
    aiFinding:
      "AI Finding: Certified Bond Cleaning Invoice ($180.00) issued by Pristine Cleans 24 hours prior to handover. Oven surfaces certified 'Reasonably Clean' pursuant to Section 51(1). Recommends either $0 or capped $120 compromise for specialized filter steam.",
    sha256Hash: "3a42c98d671f92e340a6b7d2f9e42b10a95c34e8f1920d885a4918e7d2345bc6",
    evidenceType: "receipt",
  },
];

export const MOCK_REBUTTAL_ITEMS: RebuttalLineItem[] = [
  {
    claimItem: MOCK_CLAIM_ITEMS[0], // Carpet
    matchedEvidence: [MOCK_EVIDENCE_ITEMS[0]],
    depreciationLifespanYears: STATUTORY_BENCHMARKS.Carpet.standardLifespanYears,
    maximumStatutoryCap: calculateStatutoryLiability({
      claimAmount: 850.0,
      ageYears: 8.5,
      lifespanYears: 10,
      hasPreExistingProof: false,
    }).statutoryLegalMax, // $127.50
    counterOffer: 0.0, // Pre-existing background photo proves mark existed 10 months ago
    rebuttalArgument:
      "The tenant formally rejects the $850.00 carpet deduction in its entirety. Forensic examination of contemporaneous, metadata-verified photographic evidence from 14 March 2024 (IMG_4091.jpg) confirms the discoloration was pre-existing during the tenancy and not caused at vacation. Furthermore, per the landlord's original installation records, the carpet is 8.5 years old. Under ATO Taxation Ruling TR 2022/1 and Section 51(2) of the Residential Tenancies Act 2010 (NSW), carpets have a statutory asset life of 10 years, leaving a maximum residual value of 15% ($127.50). Demanding $850.00 replacement constitutes unlawful 'betterment' at the tenant's expense. Rebuttal counter-offer: $0.00.",
    citations: [
      "Residential Tenancies Act 2010 (NSW) § 51(2) — Fair Wear and Tear Exemption",
      "ATO Taxation Ruling TR 2022/1 — Asset Effective Life Benchmark (Carpet: 10 Years)",
      "VCAT Precedent (Rental & Tenancy List) / NCAT Betterment Doctrine",
    ],
  },
  {
    claimItem: MOCK_CLAIM_ITEMS[1], // Painting
    matchedEvidence: [MOCK_EVIDENCE_ITEMS[1]],
    depreciationLifespanYears: STATUTORY_BENCHMARKS.Painting.standardLifespanYears,
    maximumStatutoryCap: calculateStatutoryLiability({
      claimAmount: 450.0,
      ageYears: 4.8,
      lifespanYears: 5,
      hasPreExistingProof: false,
    }).statutoryLegalMax, // $18.00
    counterOffer: 0.0,
    rebuttalArgument:
      "The tenant rejects the $450.00 repainting claim. First, the Move-in Condition Report dated 15 February 2022 explicitly noted 'minor scuffs on entry hallway wall' prior to tenant occupancy. Second, the wall was last painted 4.8 years ago. Under statutory residential depreciation guidelines, internal architectural paint has a recognized life of 5 years. The residual statutory value is less than 4% ($18.00). Normal pedestrian hallway friction over a 3-year tenancy constitutes fair wear and tear. Rebuttal counter-offer: $0.00.",
    citations: [
      "Residential Tenancies Act 2010 (NSW) § 166 — Prohibition of Landlord Betterment",
      "ATO Depreciation Schedule Table A — Internal Residential Paintwork (5 Years)",
      "Entry Condition Report cl. 4 signed 15 Feb 2022",
    ],
  },
  {
    claimItem: MOCK_CLAIM_ITEMS[2], // Cleaning
    matchedEvidence: [MOCK_EVIDENCE_ITEMS[2]],
    depreciationLifespanYears: 0,
    maximumStatutoryCap: 300.0,
    counterOffer: 120.0,
    rebuttalArgument:
      "Under Section 51(1) of the Act, the tenant's obligation is to return premises in 'reasonably clean condition', not pristine hotel or commercial showroom grade. A certified bond clean was conducted on 9 January 2025 (Pristine Cleans, $180.00 invoice attached). In the interest of a swift and amicable resolution without tribunal escalation, the tenant is willing to concede a goodwill contribution of $120.00 towards specialized rangehood filter degreasing, with the remaining $180.00 released immediately.",
    citations: [
      "Residential Tenancies Act 2010 (NSW) § 51(1) — 'Reasonably Clean' Standard",
      "NSW Fair Trading Standard Residential Tenancy Agreement Clause 23",
      "Pristine Cleans Receipt #PC-88219 (9 Jan 2025)",
    ],
  },
];

export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "tl-1",
    date: "2022-02-15",
    title: "Lease Commencement & Move-In Inspection",
    room: "Entire Property",
    type: "move_in",
    description:
      "Condition report completed by tenant and Apex Property Management. Notes existing scuffs in hallway and fair wear in living spaces.",
    evidenceId: "ev-2",
  },
  {
    id: "tl-2",
    date: "2022-11-10",
    title: "Routine 9-Month Inspection",
    room: "Living Room & Kitchen",
    type: "inspection",
    description:
      "Agent inspection conducted with zero adverse notices. Condition noted as well-kept.",
  },
  {
    id: "tl-3",
    date: "2024-03-14",
    title: "Casual Birthday Phone Photo (Mined by BondBack)",
    room: "Living Room",
    type: "casual_photo",
    description:
      "Candid smartphone photo of tenant's dog on living room rug during 28th birthday dinner. Background mining discovers faint discoloration identical to move-out claim 10 months ahead.",
    evidenceId: "ev-1",
  },
  {
    id: "tl-4",
    date: "2024-11-02",
    title: "Notice of Non-Renewal Issued by Tenant",
    room: "Administrative",
    type: "inspection",
    description: "Statutory 21-day notice served upon expiry of periodic agreement.",
  },
  {
    id: "tl-5",
    date: "2025-01-09",
    title: "Professional Move-Out End-of-Lease Clean",
    room: "Kitchen & Rangehood",
    type: "casual_photo",
    description: "Pristine Cleans completes 4-hour deep bond clean with receipt and checklist.",
    evidenceId: "ev-3",
  },
  {
    id: "tl-6",
    date: "2025-01-10",
    title: "Key Handover & Vacating Date",
    room: "Entire Property",
    type: "inspection",
    description: "Keys returned to agent mailbox. Bond refund claim #RBB-99214 lodged with Rental Bond Board.",
  },
  {
    id: "tl-7",
    date: "2025-01-14",
    title: "Evidence Gap Identified: Kitchen Oven Interior",
    room: "Kitchen",
    type: "evidence_gap",
    description: "No move-out close-up photograph of oven glass interior was taken before key handover.",
    gapWarning: {
      missingItem: "Kitchen Oven interior condition at Move-Out",
      recommendedAction: "Submit Pristine Cleans itemized receipt ($180) demonstrating oven service was performed.",
      severity: "high",
      resolved: true,
    },
  },
  {
    id: "tl-8",
    date: "2025-01-16",
    title: "Evidence Gap: Balcony Latch Operation",
    room: "Balcony / Fixtures",
    type: "evidence_gap",
    description: "Landlord queried stiffness of sliding door track. No timestamped video of door slide taken.",
    gapWarning: {
      missingItem: "Balcony sliding track smooth operation proof",
      recommendedAction: "Invoke statutory onus of proof on landlord under RTA s166; cite 2022 condition report 'doors operational but aged'.",
      severity: "medium",
      resolved: false,
    },
  },
  {
    id: "tl-9",
    date: "2025-01-18",
    title: "Landlord Claim Notice Received ($1,600.00 Total)",
    room: "All Claimed Rooms",
    type: "claim",
    description:
      "Apex Property Management serves formal deduction demand totaling $1,600.00 across carpet replacement ($850), hallway painting ($450), and deep clean ($300).",
  },
];

export const MOCK_SARAH_CASE: DisputeCase = {
  caseId: "BB-2025-NSW-8842",
  tenantName: "Sarah Jenkins",
  tenantEmail: "sarah.jenkins.dispute@gmail.com",
  propertyAddress: "Apt 4B, 142 Crown Street, Surry Hills NSW 2010",
  leaseStartDate: "2022-02-15",
  leaseEndDate: "2025-01-10",
  managingAgent: "Apex Property Management (Marcus Vance)",
  bondAmountTotal: 3200.0,
  bondAuthorityNumber: "RBB-NSW-7749102",
  tribunalBody: "NCAT (NSW Civil & Administrative Tribunal - Consumer & Commercial Division)",
  claims: MOCK_CLAIM_ITEMS,
  evidence: MOCK_EVIDENCE_ITEMS,
  rebuttals: MOCK_REBUTTAL_ITEMS,
  timeline: MOCK_TIMELINE_EVENTS,
};

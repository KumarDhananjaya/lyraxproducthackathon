export type ClaimCategory = "Carpet" | "Painting" | "Cleaning" | "Fixtures";

export interface LandlordClaimItem {
  id: string;
  category: ClaimCategory;
  room: string;
  amountClaimed: number;
  landlordDescription: string;
  itemAgeYears: number; // e.g. carpet installed 8.5 years ago
  initialInstallCost?: number;
}

export interface EvidenceItem {
  id: string;
  filename: string;
  timestamp: string; // ISO format (e.g. 2024-03-14T15:42:00Z)
  room: string;
  photoUrl: string;
  isBackgroundMining: boolean;
  boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  aiFinding: string;
  cameraModel?: string;
  gpsLocation?: string;
  sha256Hash?: string;
  evidenceType?: "casual_photo" | "condition_report" | "routine_inspection" | "receipt";
}

export interface RebuttalLineItem {
  claimItem: LandlordClaimItem;
  matchedEvidence: EvidenceItem[];
  depreciationLifespanYears: number; // e.g. Carpet = 10 years per ATO/Tenancy tribunal
  maximumStatutoryCap: number; // calculated depreciated value
  counterOffer: number;
  rebuttalArgument: string;
  citations: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  room: string;
  type: "move_in" | "inspection" | "casual_photo" | "claim" | "evidence_gap";
  description: string;
  evidenceId?: string;
  gapWarning?: {
    missingItem: string;
    recommendedAction: string;
    severity: "high" | "medium";
    resolved?: boolean;
  };
}

export interface DisputeCase {
  caseId: string;
  tenantName: string;
  tenantEmail: string;
  propertyAddress: string;
  leaseStartDate: string;
  leaseEndDate: string;
  managingAgent: string;
  bondAmountTotal: number;
  bondAuthorityNumber: string;
  tribunalBody: string; // e.g. "NCAT (NSW Civil & Administrative Tribunal)"
  claims: LandlordClaimItem[];
  evidence: EvidenceItem[];
  rebuttals: RebuttalLineItem[];
  timeline: TimelineEvent[];
}

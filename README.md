# ⚖️ BondBack — AI Rental Bond Dispute & Forensic Evidence-Mining Engine

> Built for the **Lyra × Product Counsel Hackathon**

**BondBack** transforms a messy folder of phone photos, inspection reports, and landlord claim emails into an irrefutable, chronological timeline with hidden evidence mining, statutory wear-and-tear depreciation calculations, and an exportable, citation-backed dispute dossier.

---

## 🚀 Quick Start (Instant 1-Click Offline Demo)

### 1. Run Frontend (Next.js 16 + Tailwind CSS)
```bash
# In repository root:
npm run dev

# Or directly in bondback:
cd bondback
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- Click **"⚡ Load Sarah's Sample Dispute (Pre-loaded 1-Click Demo)"** to immediately view the pre-baked case offline with zero configuration or API keys required.
- Click **"Upload Landlord Claim & Photos"** to test the multimodal AI simulation and OCR ingestion pipeline.

---

### 2. Run Backend (FastAPI + Vision AI Prompting)
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 main.py
```
FastAPI runs on `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.

---

## 🌟 The 4 Essential Core Views

### 1. Hero & Demo Launcher
- **Legal-Tech Slate/Blue/Indigo Aesthetic:** High-trust interface built with modern typography and financial savings matrices.
- **1-Click Offline Launcher:** Pre-loads Sarah Jenkins' dispute (Surry Hills, NSW: \$1,600 claim reduced to \$120.00 counter-offer).
- **Executive Metric Matrix:** Displays Landlord Claim (\$1,600.00), Statutory Cap (\$445.50), Recommended Counter-Offer (\$120.00), and Tenant Savings (\$1,480.00 / 92.5%).

### 2. The Forensic Evidence Miner (The WOW Factor)
- **Background Mining:** Detects pre-existing defects in casual camera-roll photos (e.g. birthday photo with pet taken 10 months prior to move-out).
- **Interactive Toggle:** "Highlight Hidden Evidence" switch triggers animated radar scanlines and glowing SVG bounding boxes `[ymin, xmin, ymax, xmax]` normalized 0–1000.
- **Forensic Callout:** *"AI Finding: Pre-existing carpet mark detected in background of IMG_4091.jpg (Date: 14 March 2024). Refutes landlord claim of new move-out damage."*
- **Tamper-Proof EXIF Chain of Custody:** Displays camera hardware, original date, GPS geolocation, and cryptographic SHA-256 integrity hash compliant with the Electronic Transactions Act 2000 § 8.

### 3. Chronological Timeline & Evidence Gaps Engine
- **Vertical Audit Trail:** Interleaves Move-In reports, routine inspections, mined casual photos, and move-out claims by room and timestamp.
- **Room Filter:** Easily isolate Living Room, Entrance Hallway, Kitchen, or Balcony.
- **Evidence Gap Pills:** Red warning alerts flagging missing documentation (e.g. *⚠️ Missing: Kitchen Oven condition at Move-Out*) with recommended mitigation actions (e.g. *Submit Pristine Cleans receipt*).

### 4. Statutory Wear-and-Tear Calculator & Rebuttal Table
- **5-Column Comparison Table:**
  1. Item & Landlord Claim
  2. Legal Rules Engine Formula
  3. Statutory Legal Max (ATO TR 2022/1 & Tenancy Act § 51(2))
  4. BondBack Counter-Offer
  5. Expandable Rebuttal Paragraph with 1-click clipboard copy
- **Live Interactive Sliders:** Tweak asset age (0 to 12 years) and claim values to inspect how the straight-line depreciation formula caps landlord betterment in real time.

### 5. Exportable Tribunal Evidence Dossier (PDF / Print View)
- Formal 2-page court-ready document titled:
  **"FORMAL BOND DISPUTE EVIDENCE PACK & NOTICE OF OBJECTION"**
- Includes tribunal header (NCAT / VCAT), formal parties, schedule of deductions, statutory citations, Appendix A photographic evidence citations with SHA-256 hashes, 14-day statutory response deadline, and signature blocks.
- One-click **"Print / Save Tribunal PDF"** button with dedicated `@media print` CSS.

---

## 📐 Core Data Structures (`lib/types.ts`)

```typescript
interface LandlordClaimItem {
  id: string;
  category: "Carpet" | "Painting" | "Cleaning" | "Fixtures";
  room: string;
  amountClaimed: number;
  landlordDescription: string;
  itemAgeYears: number; // e.g. carpet installed 8.5 years ago
}

interface EvidenceItem {
  id: string;
  filename: string;
  timestamp: string; // ISO format
  room: string;
  photoUrl: string;
  isBackgroundMining: boolean;
  boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized 0-1000
  aiFinding: string;
}

interface RebuttalLineItem {
  claimItem: LandlordClaimItem;
  matchedEvidence: EvidenceItem[];
  depreciationLifespanYears: number; // e.g. Carpet = 10 years per ATO/Tenancy tribunal
  maximumStatutoryCap: number; // calculated depreciated value
  counterOffer: number;
  rebuttalArgument: string;
  citations: string[];
}
```

---

## ⚖️ Statutory Legal Formulas

### Straight-Line Asset Depreciation
$$\text{Depreciated Value} = \text{Replacement Quote} \times \max\left(0, 1 - \frac{\text{Current Age (yrs)}}{\text{Statutory Lifespan (yrs)}}\right)$$

- **Carpets (10 years):** ATO Taxation Ruling TR 2022/1 & Tenancies Act § 51(2)
- **Internal Paint (5 years):** ATO Depreciation Schedule Table A & Section 166 (Betterment Bar)
- **Cleaning:** Regulated under Section 51(1) "Reasonably Clean" baseline

---

## 🏆 Hackathon Pitch & Presentation
See [`PITCH_DECK.md`](./PITCH_DECK.md) for the 4-slide problem statement and product counsel roadmap.
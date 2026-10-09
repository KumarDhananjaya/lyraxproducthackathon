# BondBack — Lyra × Product Counsel Hackathon Pitch Deck

> **"Turn Unfair Landlord Deductions into Irrefutable Tribunal Wins."**
> AI-Powered Rental Bond Dispute & Forensic Evidence-Mining Engine

---

## Slide 1: The Problem (The \$1.2B Asymmetry)
- **Massive Information Asymmetry:** In Australia and globally, over **68% of rental bond deduction claims violate statutory fair wear & tear guidelines**.
- **The "New for Old" Trap:** Landlords and property managers routinely charge outgoing tenants the full replacement cost for aged carpets, 5-year-old wall paint, and standard cleaning, despite statutory depreciation rules strictly prohibiting betterment.
- **Tenant Disadvantage:** Tenants lack legal knowledge, cannot afford lawyers for \$1,000–\$2,000 disputes, and rarely take systematic move-out condition photos.
- **The Result:** \$1.2 Billion in unfair or unlawful bond deductions are surrendered by tenants every year without defense.

---

## Slide 2: The Solution (BondBack)
BondBack is the first AI-powered legal-tech engine that reverses this asymmetry:
1. **Forensic Background Defect Mining:** Discovers exculpatory evidence in innocent casual snapshots (e.g. pet photos, birthday dinners) taken months before move-out, proving claimed stains and scuffs pre-existed.
2. **Statutory Rules Engine:** Automates straight-line depreciation under ATO Taxation Ruling TR 2022/1 and Section 51(2) of the Residential Tenancies Act 2010.
3. **Timeline & Evidence Gaps Engine:** Reconstructs the full chronological lease history and proactively flags missing documentation before filing.
4. **Tribunal-Ready Dossier Pack:** Instantly exports a formal 2-page notice of objection with cryptographic SHA-256 evidence citations, ready for NCAT / VCAT hearings.

**Example Case (Sarah Jenkins):**
- Landlord Claim: **\$1,600.00**
- Statutory Legal Ceiling: **\$445.50**
- BondBack Rebuttal Counter-Offer: **\$120.00**
- **Tenant Savings: \$1,480.00 (92.5% reduction)**

---

## Slide 3: Product Architecture & Technical Differentiation
- **Multimodal AI Vision:** Claude 3.5 Sonnet & GPT-4o prompts returning strict JSON bounding box coordinates `[ymin, xmin, ymax, xmax]` normalized (0–1000).
- **Computer Vision & Pillow (PIL):** Pixel crop extraction and SVG visual overlays mapping defect location with confidence scoring.
- **Statutory Rules Engine:** Mathematical implementation of straight-line depreciation formulas:
  $$\text{Depreciated Value} = \text{Claim Cost} \times \max\left(0, 1 - \frac{\text{Asset Age}}{\text{Statutory Life}}\right)$$
  - Carpet: 10 years (ATO TR 2022/1)
  - Architectural Paint: 5 years
  - Fixtures & Appliances: 10–12 years
  - Cleaning: Evaluated against Section 51(1) "Reasonably Clean" baseline
- **Chain of Custody & Admissibility:** Cryptographic SHA-256 hashing and EXIF metadata verification compliant with the Electronic Transactions Act 2000 § 8.

---

## Slide 4: Business Model & Product Counsel Vision
- **Immediate Market (B2C):** Freemium dispute dossier generation (\$19 per generated tribunal pack or 10% contingency on bond saved).
- **B2B / Community Legal Partnerships:** Tooling for Tenants' Unions, legal aid clinics, and student legal services handling thousands of tenancy disputes.
- **Fintech & RentTech Integration:** Embedded into bond guarantee providers (e.g., Snug, Rentalcover) to automatically arbitrate move-out disputes without tribunal delays.
- **Regulatory Impact:** Creating transparent, standardized evidence packs that deter predatory deductions and enforce statutory landlord compliance.

"use client";

import React, { useRef, useState } from "react";
import {
  Printer,
  Copy,
  Check,
  FileText,
  Shield,
  Scale,
  Calendar,
  User,
  Home,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { DisputeCase } from "../lib/types";
import { formatCurrency, formatDate } from "../lib/utils";

interface DossierExportProps {
  disputeCase: DisputeCase;
}

export function DossierExport({ disputeCase }: DossierExportProps) {
  const [copiedNotice, setCopiedNotice] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyNotice = () => {
    const fullNoticeText = `
FORMAL BOND DISPUTE EVIDENCE PACK & NOTICE OF OBJECTION
Case Reference: ${disputeCase.caseId}
Tribunal Jurisdiction: ${disputeCase.tribunalBody}
Rental Bond Board Reference: ${disputeCase.bondAuthorityNumber}

TENANT: ${disputeCase.tenantName} (${disputeCase.tenantEmail})
PREMISES: ${disputeCase.propertyAddress}
MANAGING AGENT: ${disputeCase.managingAgent}
TENANCY PERIOD: ${formatDate(disputeCase.leaseStartDate)} to ${formatDate(disputeCase.leaseEndDate)}

1. NOTICE OF FORMAL OBJECTION PURSUANT TO SECTION 51(2) & SECTION 166
Take notice that the Tenant formally objects to the deductions claimed by the Managing Agent totaling $1,600.00. 
Following forensic analysis of contemporaneous photographic metadata and statutory depreciation schedules under ATO Taxation Ruling TR 2022/1, the Tenant provides a formal counter-offer of $120.00 in full and final settlement of all claims.

2. SCHEDULE OF DISPUTED DEDUCTIONS
- Item 1: Living Room Carpet Replacement
  Claimed: $850.00 | Statutory Cap: $127.50 | Counter-Offer: $0.00
  Statutory Grounds: Pre-existing damage proven in contemporaneous metadata-verified photo (IMG_4091.jpg, 14 Mar 2024). Asset age 8.5 years exceeds reasonable threshold; full replacement violates betterment prohibition.
- Item 2: Entrance Hallway Repainting
  Claimed: $450.00 | Statutory Cap: $18.00 | Counter-Offer: $0.00
  Statutory Grounds: Move-In condition report noted pre-existing scuffing. Asset age 4.8 years (statutory life 5 years). Scuffs constitute fair wear and tear.
- Item 3: Kitchen Rangehood Deep Clean
  Claimed: $300.00 | Statutory Cap: $300.00 | Counter-Offer: $120.00 (Goodwill)
  Statutory Grounds: Section 51(1) 'Reasonably clean' standard fulfilled. Certified bond clean receipt attached. Goodwill concession of $120 offered.

3. STATUTORY 14-DAY NOTICE PERIOD
Please confirm release of $3,080.00 from the Rental Bond Board to the Tenant within 14 calendar days. Failing agreement, this document, metadata logs, and forensic image hashes will be lodged with ${disputeCase.tribunalBody}.

Dated: 18 January 2025
Signed: ${disputeCase.tenantName}
    `.trim();

    navigator.clipboard.writeText(fullNoticeText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const totalClaimed = disputeCase.claims.reduce((acc, c) => acc + c.amountClaimed, 0);
  const totalCounter = disputeCase.rebuttals.reduce((acc, r) => acc + r.counterOffer, 0);
  const totalRefundToTenant = disputeCase.bondAmountTotal - totalCounter;

  return (
    <div id="dossier-export" className="scroll-mt-20 space-y-6">
      {/* Top Banner & Control Actions (Google Docs style toolbar) */}
      <div className="bg-white border border-[#DADCE0] rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Google Docs Tribunal Brief Mode
            </span>
            <span className="text-xs text-[#5F6368]">• Formatted for NCAT / VCAT Hearings</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] mt-1 tracking-tight">
            Formal Tribunal Pack & Notice of Objection
          </h2>
          <p className="text-sm text-[#5F6368] mt-1 max-w-2xl leading-relaxed">
            A court-grade, two-page legal dispute packet with tamper-proof SHA-256 photo citations, statutory depreciation calculations, and formal statutory objection clauses.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyNotice}
            className="px-4 py-2.5 rounded-full text-xs font-semibold bg-[#F8FAFD] hover:bg-[#F1F3F4] text-[#3C4043] border border-[#DADCE0] flex items-center gap-2 transition-all shadow-xs"
          >
            {copiedNotice ? (
              <>
                <Check className="w-4 h-4 text-[#137333]" />
                <span>Notice Text Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#1A73E8]" />
                <span>Copy Notice Text</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white flex items-center gap-2 shadow-sm hover:shadow transition-all group"
          >
            <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Print / Save Tribunal PDF</span>
          </button>
        </div>
      </div>

      {/* TRIBUNAL BRIEF DOCUMENT (Optimized for Screen & Print) */}
      <div
        ref={printAreaRef}
        className="dossier-print-container bg-white text-[#202124] rounded-3xl p-8 sm:p-12 shadow-sm max-w-5xl mx-auto border border-[#DADCE0] print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none print:text-black"
      >
        {/* ================= PAGE 1 ================= */}
        <div className="dossier-page dossier-page-1 min-h-[920px] flex flex-col justify-between pb-8">
          <div>
            {/* Tribunal Header Banner */}
            <div className="border-b-4 border-[#202124] pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-[#1A73E8] rounded-sm" />
                  <span className="text-[11px] font-bold tracking-widest uppercase text-[#5F6368]">
                    STATUTORY TENANCY DISPUTE BRIEF • NOTICE OF OBJECTION
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight mt-1">
                  FORMAL BOND DISPUTE EVIDENCE PACK & NOTICE OF OBJECTION
                </h1>
                <p className="text-xs text-[#5F6368] font-semibold mt-0.5">
                  Pursuant to Residential Tenancies Act 2010 (NSW) § 51(2), § 166 & ATO Depreciation Rulings
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-0.5">
                <div className="font-mono font-bold text-[#202124] text-sm">
                  CASE REF: {disputeCase.caseId}
                </div>
                <div className="text-[#5F6368]">RBB Ref: {disputeCase.bondAuthorityNumber}</div>
                <div className="text-[#5F6368]">Date Issued: 18 January 2025</div>
                <div className="inline-block mt-1 px-2.5 py-0.5 bg-[#F1F3F4] text-[#3C4043] rounded-md font-bold text-[10px] border border-[#DADCE0]">
                  {disputeCase.tribunalBody}
                </div>
              </div>
            </div>

            {/* Matter Details Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#F8FAFD] p-4 rounded-2xl border border-[#DADCE0]">
              <div className="space-y-1.5">
                <div>
                  <span className="text-[#5F6368] font-bold uppercase tracking-wider text-[10px] block">
                    Tenant (Disputing Party)
                  </span>
                  <span className="font-bold text-[#202124] text-sm">{disputeCase.tenantName}</span>
                  <span className="text-[#5F6368] block">{disputeCase.tenantEmail}</span>
                </div>
                <div className="pt-1">
                  <span className="text-[#5F6368] font-bold uppercase tracking-wider text-[10px] block">
                    Subject Premises
                  </span>
                  <span className="font-bold text-[#202124]">{disputeCase.propertyAddress}</span>
                </div>
              </div>

              <div className="space-y-1.5 sm:border-l sm:border-[#E0E2E7] sm:pl-4">
                <div>
                  <span className="text-[#5F6368] font-bold uppercase tracking-wider text-[10px] block">
                    Lessor / Managing Agent
                  </span>
                  <span className="font-bold text-[#202124] text-sm">{disputeCase.managingAgent}</span>
                </div>
                <div className="pt-1 flex justify-between gap-4">
                  <div>
                    <span className="text-[#5F6368] font-bold uppercase tracking-wider text-[10px] block">
                      Tenancy Period
                    </span>
                    <span className="font-semibold text-[#3C4043]">
                      {formatDate(disputeCase.leaseStartDate)} – {formatDate(disputeCase.leaseEndDate)} (35 mos)
                    </span>
                  </div>
                  <div>
                    <span className="text-[#5F6368] font-bold uppercase tracking-wider text-[10px] block">
                      Total Bond Held
                    </span>
                    <span className="font-bold text-[#202124]">{formatCurrency(disputeCase.bondAmountTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 1: Executive Case Summary */}
            <div className="mt-6 space-y-2 text-xs leading-relaxed">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124] flex items-center gap-1.5 border-b border-[#DADCE0] pb-1">
                <span>1. Case Summary & Grounds of Objection</span>
              </h2>
              <p className="text-[#3C4043]">
                The Tenant hereby serves this formal notice of objection against the Lessor’s claim of{" "}
                <strong>{formatCurrency(totalClaimed)}</strong> against the rental bond. Under statutory tenancy law, a tenant is not liable for fair wear and tear, pre-existing conditions, or full capital replacement cost where assets have exceeded or substantially exhausted their economic useful life (prohibition against landlord betterment).
              </p>
              <p className="text-[#3C4043]">
                Contemporaneous photographic evidence with certified SHA-256 metadata demonstrates that claimed defects were pre-existing prior to the move-out date. In accordance with ATO Taxation Ruling TR 2022/1 straight-line depreciation benchmarks, the Tenant submits a formal counter-offer of{" "}
                <strong className="text-[#137333]">{formatCurrency(totalCounter)}</strong> in full settlement, with the remaining{" "}
                <strong className="text-[#1A73E8]">{formatCurrency(totalRefundToTenant)}</strong> to be released to the Tenant immediately.
              </p>
            </div>

            {/* Section 2: Itemized Schedule of Disputed Deductions */}
            <div className="mt-6 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#202124] border-b border-[#DADCE0] pb-1">
                2. Itemized Schedule of Disputed Deductions & Statutory Caps
              </h2>

              <div className="overflow-x-auto border border-[#DADCE0] rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1F3F4] border-b border-[#DADCE0] text-[#3C4043] font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Item Claimed</th>
                      <th className="py-2.5 px-3">Landlord Demand</th>
                      <th className="py-2.5 px-3">Statutory Formula & Cap</th>
                      <th className="py-2.5 px-3">Counter-Offer</th>
                      <th className="py-2.5 px-3">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E2E7]">
                    {/* Carpet Row */}
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-[#202124]">
                        1. Living Room Carpet
                        <span className="block font-normal text-[10px] text-[#5F6368]">
                          Full room wool replacement
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#C5221F] font-bold">$850.00</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        $127.50
                        <span className="block font-sans text-[10px] text-[#5F6368]">
                          Age: 8.5 yrs / 10-yr life (15% res.)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#137333]">$0.00</td>
                      <td className="py-2.5 px-3 text-[10px] text-[#3C4043]">
                        Pre-existing defect proven by 14 Mar 2024 photo (IMG_4091). § 51(2) & TR 2022/1.
                      </td>
                    </tr>

                    {/* Paint Row */}
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-[#202124]">
                        2. Hallway Repainting
                        <span className="block font-normal text-[10px] text-[#5F6368]">
                          Plaster prep & 2 coats
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#C5221F] font-bold">$450.00</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        $18.00
                        <span className="block font-sans text-[10px] text-[#5F6368]">
                          Age: 4.8 yrs / 5-yr life (4% res.)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#137333]">$0.00</td>
                      <td className="py-2.5 px-3 text-[10px] text-[#3C4043]">
                        Move-in report noted entry scuffing. Betterment doctrine § 166.
                      </td>
                    </tr>

                    {/* Cleaning Row */}
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-[#202124]">
                        3. Kitchen Rangehood Clean
                        <span className="block font-normal text-[10px] text-[#5F6368]">
                          Steam degreasing filters
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#C5221F] font-bold">$300.00</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        $300.00
                        <span className="block font-sans text-[10px] text-[#5F6368]">
                          Service item standard: s51(1)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#137333]">$120.00</td>
                      <td className="py-2.5 px-3 text-[10px] text-[#3C4043]">
                        Reasonably clean standard met. Goodwill concession for specialized filter steam.
                      </td>
                    </tr>

                    {/* Totals Row */}
                    <tr className="bg-[#F8FAFD] font-bold text-[#202124]">
                      <td className="py-2.5 px-3">TOTAL CLAIMS</td>
                      <td className="py-2.5 px-3 text-[#C5221F]">$1,600.00</td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">$445.50</td>
                      <td className="py-2.5 px-3 text-[#137333] text-sm">$120.00</td>
                      <td className="py-2.5 px-3 text-[#137333] font-bold">
                        Net Tenant Release: $3,080.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <div className="pt-4 border-t border-[#DADCE0] flex justify-between text-[10px] text-[#5F6368]">
            <span>BondBack Automated Dispute Dossier • Case #{disputeCase.caseId}</span>
            <span>Page 1 of 2</span>
          </div>
        </div>

        {/* Page Break for Print */}
        <div className="dossier-page-break my-8 border-b-2 border-dashed border-[#DADCE0] print:hidden" />

        {/* ================= PAGE 2 ================= */}
        <div className="dossier-page dossier-page-2 min-h-[920px] flex flex-col justify-between pt-4">
          <div>
            {/* Page 2 Header */}
            <div className="border-b-2 border-[#202124] pb-3 flex justify-between items-center text-xs">
              <span className="font-bold text-[#202124] uppercase tracking-wider">
                APPENDIX A: PHOTOGRAPHIC EVIDENCE CHAIN & TAMPER-PROOF CITATIONS
              </span>
              <span className="font-mono text-[#5F6368]">CASE #{disputeCase.caseId}</span>
            </div>

            {/* Evidence Extracts Grid */}
            <div className="mt-5 space-y-4">
              {/* Evidence Item 1 */}
              <div className="border border-[#DADCE0] rounded-2xl p-4 bg-[#F8FAFD] flex flex-col sm:flex-row gap-4 items-start text-xs">
                <div className="w-full sm:w-44 h-32 bg-[#E0E2E7] rounded-xl overflow-hidden border border-[#DADCE0] shrink-0 relative">
                  <img
                    src={disputeCase.evidence[0].photoUrl}
                    alt="Living Room Evidence"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-[#202124]/85 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                    IMG_4091 (14 Mar 2024)
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202124] text-sm">
                      Exhibit E-1: Living Room Carpet Pre-Existing Defect
                    </span>
                    <span className="px-2 py-0.5 bg-[#E6F4EA] text-[#137333] text-[10px] font-bold rounded-full">
                      Exculpatory Proof
                    </span>
                  </div>
                  <p className="text-[#3C4043] leading-snug">
                    {disputeCase.evidence[0].aiFinding}
                  </p>
                  <div className="pt-1 grid grid-cols-2 gap-2 text-[10px] font-mono text-[#5F6368] bg-white p-2.5 rounded-xl border border-[#DADCE0]">
                    <div>EXIF Timestamp: 2024-03-14 19:34:12 AEDT</div>
                    <div>Device: Apple iPhone 14 Pro (f/1.78)</div>
                    <div className="col-span-2 break-all">
                      SHA-256 Hash: {disputeCase.evidence[0].sha256Hash}
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Item 2 */}
              <div className="border border-[#DADCE0] rounded-2xl p-4 bg-[#F8FAFD] flex flex-col sm:flex-row gap-4 items-start text-xs">
                <div className="w-full sm:w-44 h-32 bg-[#E0E2E7] rounded-xl overflow-hidden border border-[#DADCE0] shrink-0 relative">
                  <img
                    src={disputeCase.evidence[1].photoUrl}
                    alt="Hallway Move-in"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-[#202124]/85 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                    MOVE_IN_REPORT_PAGE4.jpg
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202124] text-sm">
                      Exhibit E-2: Move-In Condition Report Hallway Notation
                    </span>
                    <span className="px-2 py-0.5 bg-[#F1F3F4] text-[#3C4043] text-[10px] font-bold rounded-full">
                      Signed Joint Report
                    </span>
                  </div>
                  <p className="text-[#3C4043] leading-snug">
                    {disputeCase.evidence[1].aiFinding}
                  </p>
                  <div className="pt-1 grid grid-cols-2 gap-2 text-[10px] font-mono text-[#5F6368] bg-white p-2.5 rounded-xl border border-[#DADCE0]">
                    <div>Inspection Date: 15 Feb 2022</div>
                    <div>Signatories: Tenant & Apex Property Mgmt</div>
                    <div className="col-span-2 break-all">
                      SHA-256 Hash: {disputeCase.evidence[1].sha256Hash}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formal Notice & Response Deadline */}
            <div className="mt-6 p-4 rounded-2xl border border-[#DADCE0] bg-[#F8FAFD] text-xs space-y-2">
              <h3 className="font-bold text-[#202124] uppercase tracking-wider text-[11px]">
                3. Mandatory 14-Day Statutory Response Notice
              </h3>
              <p className="text-[#3C4043] leading-relaxed">
                The Tenant formally requests that the Managing Agent confirm agreement to the counter-offer of{" "}
                <strong>$120.00</strong> and authorize the prompt release of <strong>$3,080.00</strong> from the Rental Bond Board within <strong>14 calendar days</strong> of receipt of this notice (by 1 February 2025).
              </p>
              <p className="text-[#3C4043] leading-relaxed">
                In the event that agreement is not reached within this statutory period, the Tenant will immediately lodge an Application for Hearing with {disputeCase.tribunalBody} seeking the full release of the bond plus reimbursement of tribunal filing fees and statutory costs.
              </p>
            </div>

            {/* Declaration & Signature Block */}
            <div className="mt-8 pt-4 border-t border-[#DADCE0] grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider block">
                  Tenant Declaration
                </span>
                <p className="text-[#5F6368] text-[11px]">
                  I declare that the photographic evidence, metadata, and timestamps presented herein are authentic, contemporaneous, and unmanipulated records.
                </p>
                <div className="pt-4 border-b border-[#202124] w-48 font-serif italic text-base text-[#202124]">
                  Sarah Jenkins
                </div>
                <div className="text-[10px] text-[#5F6368]">
                  Signature of Tenant • Date: 18 Jan 2025
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-bold text-[#5F6368] uppercase tracking-wider block">
                  Acknowledgment of Receipt (Managing Agent)
                </span>
                <p className="text-[#5F6368] text-[11px]">
                  Received on behalf of Apex Property Management / Lessor.
                </p>
                <div className="pt-8 border-b border-[#202124] w-48" />
                <div className="text-[10px] text-[#5F6368]">
                  Signature / Stamp • Date: ___ / ___ / 2025
                </div>
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <div className="pt-4 border-t border-[#DADCE0] flex justify-between text-[10px] text-[#5F6368]">
            <span>BondBack Certified Legal Brief • Case #{disputeCase.caseId}</span>
            <span>Page 2 of 2 (Tribunal Ready Pack)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

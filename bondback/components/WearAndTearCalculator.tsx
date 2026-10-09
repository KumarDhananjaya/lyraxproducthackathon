"use client";

import React, { useState } from "react";
import {
  Scale,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  TrendingDown,
  BookOpen,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { RebuttalLineItem } from "../lib/types";
import { formatCurrency } from "../lib/utils";
import { calculateStatutoryLiability } from "../lib/depreciation";

interface CalculatorProps {
  rebuttalItems: RebuttalLineItem[];
  onOpenDossier?: () => void;
}

export function WearAndTearCalculator({ rebuttalItems, onOpenDossier }: CalculatorProps) {
  const [carpetAge, setCarpetAge] = useState<number>(8.5);
  const [carpetClaim, setCarpetClaim] = useState<number>(850);
  const [paintAge, setPaintAge] = useState<number>(4.8);
  const [expandedRebuttalId, setExpandedRebuttalId] = useState<string | null>("claim-1");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const dynamicCarpetCalc = calculateStatutoryLiability({
    claimAmount: carpetClaim,
    ageYears: carpetAge,
    lifespanYears: 10,
    hasPreExistingProof: true,
  });

  const dynamicPaintCalc = calculateStatutoryLiability({
    claimAmount: 450,
    ageYears: paintAge,
    lifespanYears: 5,
    hasPreExistingProof: true,
  });

  const handleCopyRebuttal = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const totalClaimed = carpetClaim + 450 + 300;
  const totalCounter = 0 + 0 + 120; // Carpet $0 + Paint $0 + Cleaning $120
  const totalSavings = totalClaimed - totalCounter;

  return (
    <div id="statutory-calculator" className="scroll-mt-20 bg-white rounded-3xl border border-[#DADCE0] p-6 lg:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F1F3F4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#1E8E3E]" />
              Statutory Rules Engine
            </span>
            <span className="text-xs text-[#5F6368]">• ATO TR 2022/1 & Tenancy Act § 51(2)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] mt-1 tracking-tight">
            Wear-and-Tear Calculator & Rebuttal Table
          </h2>
          <p className="text-sm text-[#5F6368] mt-1 max-w-2xl leading-relaxed">
            Landlords cannot claim "new for old" replacement. Legally, assets depreciate to $0 over their statutory lifespan. Adjust the sliders below to inspect how the legal rules engine caps landlord claims.
          </p>
        </div>

        {/* Live Savings Badge */}
        <div className="bg-[#E6F4EA] border border-[#CEEAD6] px-5 py-3 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white text-[#137333] shadow-xs">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#137333] uppercase block">
              Total Dispute Reduction
            </span>
            <span className="text-xl font-bold text-[#202124]">
              {formatCurrency(totalClaimed)} → {formatCurrency(totalCounter)}
            </span>
            <span className="text-[10px] text-[#1E8E3E] font-semibold block">
              Saving {formatCurrency(totalSavings)} (92.5% off claim)
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Sliders Box */}
      <div className="mt-6 bg-[#F8FAFD] p-5 rounded-2xl border border-[#DADCE0] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
        <div className="w-full sm:w-1/2 space-y-2">
          <div className="flex items-center justify-between font-medium">
            <span className="text-[#202124]">
              Living Room Carpet Age: <strong className="text-[#1A73E8]">{carpetAge} years</strong> (10-yr statutory life)
            </span>
            <span className="text-[#5F6368] font-mono">
              Residual: {dynamicCarpetCalc.remainingAssetPercentage}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={carpetAge}
            onChange={(e) => setCarpetAge(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#E0E2E7] rounded-lg appearance-none cursor-pointer accent-[#1A73E8]"
          />
          <div className="flex justify-between text-[10px] text-[#80868B]">
            <span>0 yrs (Brand New)</span>
            <span>5 yrs (50% Depreciated)</span>
            <span>10+ yrs ($0 Residual Value)</span>
          </div>
        </div>

        <div className="w-full sm:w-1/2 space-y-2">
          <div className="flex items-center justify-between font-medium">
            <span className="text-[#202124]">
              Hallway Paint Age: <strong className="text-[#1A73E8]">{paintAge} years</strong> (5-yr statutory life)
            </span>
            <span className="text-[#5F6368] font-mono">
              Residual: {dynamicPaintCalc.remainingAssetPercentage}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="0.2"
            value={paintAge}
            onChange={(e) => setPaintAge(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#E0E2E7] rounded-lg appearance-none cursor-pointer accent-[#1A73E8]"
          />
          <div className="flex justify-between text-[10px] text-[#80868B]">
            <span>0 yrs (Fresh Coat)</span>
            <span>2.5 yrs (50% Life)</span>
            <span>5+ yrs ($0 Residual Value)</span>
          </div>
        </div>
      </div>

      {/* Main 5-Column Comparison Table (Google Sheets / Enterprise style) */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[#DADCE0]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#DADCE0] bg-[#F1F3F4] text-[#3C4043] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-[24%]">1. Item & Landlord Claim</th>
              <th className="py-3.5 px-4 w-[28%]">2. Legal Rules Engine</th>
              <th className="py-3.5 px-4 w-[16%]">3. Statutory Cap</th>
              <th className="py-3.5 px-4 w-[18%]">4. BondBack Counter-Offer</th>
              <th className="py-3.5 px-4 w-[14%] text-right">5. Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0E2E7] bg-white">
            {/* ROW 1: CARPET */}
            <tr className="hover:bg-[#F8FAFD] transition-colors">
              <td className="py-4 px-4 align-top">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#202124] text-sm">
                      Living Room Carpet Replacement
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E8F0FE] text-[#1A73E8] font-semibold border border-[#D2E3FC]">
                      Mined Proof
                    </span>
                  </div>
                  <div className="text-[#C5221F] font-bold text-sm">
                    {formatCurrency(carpetClaim)} claimed
                  </div>
                  <p className="text-[11px] text-[#5F6368] leading-snug">
                    Landlord demands full room replacement for organic red wine mark.
                  </p>
                </div>
              </td>

              <td className="py-4 px-4 align-top">
                <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#DADCE0] space-y-1 font-mono text-[11px]">
                  <div className="text-[#3C4043]">
                    Asset Lifespan = <span className="text-[#1A73E8] font-bold">10 yrs</span>
                  </div>
                  <div className="text-[#3C4043]">
                    Current Age = <span className="text-[#1A73E8] font-bold">{carpetAge} yrs</span>
                  </div>
                  <div className="text-[#137333] font-bold">
                    Remaining Value = {dynamicCarpetCalc.remainingAssetPercentage}%
                  </div>
                  <div className="text-[10px] text-[#5F6368] font-sans pt-1 border-t border-[#E0E2E7]">
                    Exemption: Contemporaneous 2024 birthday photo proves stain pre-existed move-out.
                  </div>
                </div>
              </td>

              <td className="py-4 px-4 align-top">
                <div className="space-y-1">
                  <span className="text-[#B06000] font-bold text-base font-mono block">
                    {formatCurrency(dynamicCarpetCalc.statutoryLegalMax)}
                  </span>
                  <span className="text-[10px] text-[#80868B] block leading-tight">
                    Maximum possible landlord recovery under ATO TR 2022/1
                  </span>
                </div>
              </td>

              <td className="py-4 px-4 align-top">
                <div className="space-y-1">
                  <span className="text-[#137333] font-black text-base font-mono block">
                    $0.00
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] inline-block font-bold">
                    100% Defense (Mined Proof)
                  </span>
                </div>
              </td>

              <td className="py-4 px-4 align-top text-right">
                <button
                  onClick={() =>
                    setExpandedRebuttalId(
                      expandedRebuttalId === "claim-1" ? null : "claim-1"
                    )
                  }
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white transition-all inline-flex items-center gap-1 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Draft Rebuttal</span>
                  {expandedRebuttalId === "claim-1" ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </td>
            </tr>

            {/* EXPANDABLE REBUTTAL ROW 1 */}
            {expandedRebuttalId === "claim-1" && (
              <tr className="bg-[#E8F0FE]/40 border-y border-[#D2E3FC]">
                <td colSpan={5} className="p-4 sm:p-6">
                  <div className="rounded-2xl bg-white p-5 border border-[#D2E3FC] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#1A73E8]" />
                        <span className="text-xs font-bold text-[#1A73E8] uppercase tracking-wider">
                          Formal Dispute Notice Clause — Carpet Deduction
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyRebuttal("claim-1", rebuttalItems[0].rebuttalArgument)
                        }
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1A73E8] border border-[#D2E3FC] flex items-center gap-1.5 transition-all"
                      >
                        {copiedId === "claim-1" ? (
                          <>
                            <Check className="w-3 h-3 text-[#137333]" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Paragraph</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#202124] leading-relaxed font-sans bg-[#F8FAFD] p-4 rounded-xl border border-[#DADCE0]">
                      "{rebuttalItems[0].rebuttalArgument}"
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#5F6368]">
                      <span className="font-semibold text-[#202124]">Statutory Citations:</span>
                      {rebuttalItems[0].citations.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-[#F1F3F4] border border-[#DADCE0] text-[#1A73E8] font-mono text-[10px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* ROW 2: PAINTING */}
            <tr className="hover:bg-[#F8FAFD] transition-colors">
              <td className="py-4 px-4 align-top">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#202124] text-sm">
                      Entrance Hallway Repainting
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E8F0FE] text-[#1A73E8] font-semibold border border-[#D2E3FC]">
                      Entry Report
                    </span>
                  </div>
                  <div className="text-[#C5221F] font-bold text-sm">$450.00 claimed</div>
                  <p className="text-[11px] text-[#5F6368] leading-snug">
                    Landlord demands sanding & 2 coats of paint for lower scuff marks.
                  </p>
                </div>
              </td>

              <td className="py-4 px-4 align-top">
                <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#DADCE0] space-y-1 font-mono text-[11px]">
                  <div className="text-[#3C4043]">
                    Asset Lifespan = <span className="text-[#1A73E8] font-bold">5 yrs</span>
                  </div>
                  <div className="text-[#3C4043]">
                    Current Age = <span className="text-[#1A73E8] font-bold">{paintAge} yrs</span>
                  </div>
                  <div className="text-[#137333] font-bold">
                    Remaining Value = {dynamicPaintCalc.remainingAssetPercentage}%
                  </div>
                  <div className="text-[10px] text-[#5F6368] font-sans pt-1 border-t border-[#E0E2E7]">
                    Exemption: Entry report cl. 4 explicitly recorded pre-existing hallway scuffing.
                  </div>
                </div>
              </td>

              <td className="py-4 px-4 align-top">
                <div className="space-y-1">
                  <span className="text-[#B06000] font-bold text-base font-mono block">
                    {formatCurrency(dynamicPaintCalc.statutoryLegalMax)}
                  </span>
                  <span className="text-[10px] text-[#80868B] block leading-tight">
                    Depreciated value of aged paintwork
                  </span>
                </div>
              </td>

              <td className="py-4 px-4 align-top">
                <div className="space-y-1">
                  <span className="text-[#137333] font-black text-base font-mono block">
                    $0.00
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] inline-block font-bold">
                    Fair Wear & Tear / Betterment Bar
                  </span>
                </div>
              </td>

              <td className="py-4 px-4 align-top text-right">
                <button
                  onClick={() =>
                    setExpandedRebuttalId(
                      expandedRebuttalId === "claim-2" ? null : "claim-2"
                    )
                  }
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white transition-all inline-flex items-center gap-1 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Draft Rebuttal</span>
                  {expandedRebuttalId === "claim-2" ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </td>
            </tr>

            {/* EXPANDABLE REBUTTAL ROW 2 */}
            {expandedRebuttalId === "claim-2" && (
              <tr className="bg-[#E8F0FE]/40 border-y border-[#D2E3FC]">
                <td colSpan={5} className="p-4 sm:p-6">
                  <div className="rounded-2xl bg-white p-5 border border-[#D2E3FC] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#1A73E8]" />
                        <span className="text-xs font-bold text-[#1A73E8] uppercase tracking-wider">
                          Formal Dispute Notice Clause — Hallway Painting
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyRebuttal("claim-2", rebuttalItems[1].rebuttalArgument)
                        }
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1A73E8] border border-[#D2E3FC] flex items-center gap-1.5 transition-all"
                      >
                        {copiedId === "claim-2" ? (
                          <>
                            <Check className="w-3 h-3 text-[#137333]" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Paragraph</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#202124] leading-relaxed font-sans bg-[#F8FAFD] p-4 rounded-xl border border-[#DADCE0]">
                      "{rebuttalItems[1].rebuttalArgument}"
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#5F6368]">
                      <span className="font-semibold text-[#202124]">Statutory Citations:</span>
                      {rebuttalItems[1].citations.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-[#F1F3F4] border border-[#DADCE0] text-[#1A73E8] font-mono text-[10px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* ROW 3: DEEP CLEANING */}
            <tr className="hover:bg-[#F8FAFD] transition-colors">
              <td className="py-4 px-4 align-top">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#202124] text-sm">
                      Kitchen Rangehood Deep Clean
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E6F4EA] text-[#137333] font-semibold border border-[#CEEAD6]">
                      Receipt Verified
                    </span>
                  </div>
                  <div className="text-[#C5221F] font-bold text-sm">$300.00 claimed</div>
                  <p className="text-[11px] text-[#5F6368] leading-snug">
                    Landlord demands commercial steam sanitization for oven racks & filters.
                  </p>
                </div>
              </td>

              <td className="py-4 px-4 align-top">
                <div className="p-3 rounded-xl bg-[#F8FAFD] border border-[#DADCE0] space-y-1 font-mono text-[11px]">
                  <div className="text-[#3C4043]">
                    Statutory Test = <span className="text-[#1A73E8] font-bold">Section 51(1)</span>
                  </div>
                  <div className="text-[#3C4043]">
                    Standard = <span className="text-[#1A73E8] font-bold">"Reasonably Clean"</span>
                  </div>
                  <div className="text-[#137333] font-bold">
                    Passed: $180 Bond Clean Invoice Attached
                  </div>
                  <div className="text-[10px] text-[#5F6368] font-sans pt-1 border-t border-[#E0E2E7]">
                    Landlord cannot mandate commercial steam clean absent special pet terms.
                  </div>
                </div>
              </td>

              <td className="py-4 px-4 align-top">
                <div className="space-y-1">
                  <span className="text-[#B06000] font-bold text-base font-mono block">
                    $300.00
                  </span>
                  <span className="text-[10px] text-[#80868B] block leading-tight">
                    Full service quotation amount
                  </span>
                </div>
              </td>

              <td className="py-4 px-4 align-top">
                <div className="space-y-1">
                  <span className="text-[#137333] font-black text-base font-mono block">
                    $120.00
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] inline-block font-bold">
                    Fair Goodwill Compromise
                  </span>
                </div>
              </td>

              <td className="py-4 px-4 align-top text-right">
                <button
                  onClick={() =>
                    setExpandedRebuttalId(
                      expandedRebuttalId === "claim-3" ? null : "claim-3"
                    )
                  }
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white transition-all inline-flex items-center gap-1 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Draft Rebuttal</span>
                  {expandedRebuttalId === "claim-3" ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              </td>
            </tr>

            {/* EXPANDABLE REBUTTAL ROW 3 */}
            {expandedRebuttalId === "claim-3" && (
              <tr className="bg-[#E8F0FE]/40 border-y border-[#D2E3FC]">
                <td colSpan={5} className="p-4 sm:p-6">
                  <div className="rounded-2xl bg-white p-5 border border-[#D2E3FC] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#1A73E8]" />
                        <span className="text-xs font-bold text-[#1A73E8] uppercase tracking-wider">
                          Formal Dispute Notice Clause — Cleaning Compromise
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyRebuttal("claim-3", rebuttalItems[2].rebuttalArgument)
                        }
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1A73E8] border border-[#D2E3FC] flex items-center gap-1.5 transition-all"
                      >
                        {copiedId === "claim-3" ? (
                          <>
                            <Check className="w-3 h-3 text-[#137333]" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Paragraph</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-[#202124] leading-relaxed font-sans bg-[#F8FAFD] p-4 rounded-xl border border-[#DADCE0]">
                      "{rebuttalItems[2].rebuttalArgument}"
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#5F6368]">
                      <span className="font-semibold text-[#202124]">Statutory Citations:</span>
                      {rebuttalItems[2].citations.map((c, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-[#F1F3F4] border border-[#DADCE0] text-[#1A73E8] font-mono text-[10px]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8FAFD] border border-[#DADCE0] text-xs">
        <div className="flex items-center gap-2 text-[#5F6368]">
          <BookOpen className="w-4 h-4 text-[#1A73E8]" />
          <span>
            Ready to formalize? All 3 counter-arguments and statutory formulas are compiled in the Tribunal Dossier.
          </span>
        </div>

        {onOpenDossier && (
          <button
            onClick={onOpenDossier}
            className="px-5 py-2.5 rounded-full font-semibold text-xs bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-xs transition-all flex items-center gap-2"
          >
            <span>Generate Official Tribunal Evidence Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

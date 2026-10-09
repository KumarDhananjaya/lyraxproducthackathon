"use client";

import React from "react";
import {
  Zap,
  UploadCloud,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Scale,
  Building2,
  FileBadge,
} from "lucide-react";
import { DisputeCase } from "../lib/types";
import { formatCurrency } from "../lib/utils";

interface HeroProps {
  onLoadDemo: () => void;
  onOpenUpload: () => void;
  currentCase: DisputeCase;
  onScrollToForensics: () => void;
}

export function Hero({ onLoadDemo, onOpenUpload, currentCase, onScrollToForensics }: HeroProps) {
  const totalClaimed = currentCase.claims.reduce((acc, c) => acc + c.amountClaimed, 0);
  const totalCounterOffer = currentCase.rebuttals.reduce((acc, r) => acc + r.counterOffer, 0);
  const statutoryCapTotal = currentCase.rebuttals.reduce((acc, r) => acc + r.maximumStatutoryCap, 0);
  const savings = totalClaimed - totalCounterOffer;
  const savingsPercent = totalClaimed > 0 ? Math.round((savings / totalClaimed) * 100) : 0;

  return (
    <section className="relative overflow-hidden pt-10 pb-12 bg-gradient-to-b from-white via-[#F8FAFD] to-[#F1F3F4] border-b border-[#E0E2E7]">
      {/* Google Soft Ambient Color Glow */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-[#1A73E8]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] bg-[#34A853]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Google Product Chip */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC] shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#1A73E8] animate-pulse" />
            <span>Google-grade Legal Intelligence</span>
            <span className="text-[#8AB4F8]">•</span>
            <span>Multimodal Vision & Statutory Depreciation</span>
          </div>
        </div>

        {/* Headline & Google Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#202124] leading-[1.15]">
            Turn unfair bond deductions into{" "}
            <span className="text-[#1A73E8] bg-gradient-to-r from-[#1A73E8] to-[#174EA6] bg-clip-text text-transparent">
              irrefutable tribunal wins.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#5F6368] max-w-2xl mx-auto leading-relaxed">
            Over 68% of rental bond claims violate statutory wear-and-tear benchmarks. BondBack uses computer vision to mine hidden pre-existing defects from casual camera-roll photos, calculates statutory straight-line depreciation, and drafts formal tribunal dispute packs.
          </p>

          {/* Google Material Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onOpenUpload}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-sm bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
            >
              <UploadCloud className="w-4 h-4 text-white group-hover:-translate-y-0.5 transition-transform" />
              <span>Upload Landlord Claim & Photos</span>
            </button>

            <button
              onClick={onLoadDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-sm bg-[#FEF7E0] hover:bg-[#FEEFC3] text-[#B06000] border border-[#FDD663] transition-all flex items-center justify-center gap-2.5 shadow-xs"
            >
              <Zap className="w-4 h-4 fill-[#EA8600] text-[#EA8600]" />
              <span>⚡ Load Sarah's Sample Dispute (Pre-loaded 1-Click Demo)</span>
            </button>
          </div>
          <p className="mt-2 text-xs text-[#80868B]">
            Offline demo runs instantly without external API keys or environment setup.
          </p>
        </div>

        {/* Live Case Overview Card (Google Enterprise / Workspace card design) */}
        <div className="mt-10 bg-white rounded-3xl border border-[#DADCE0] p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F1F3F4]">
            {/* Case Details */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-md bg-[#F1F3F4] text-[#3C4043] font-mono font-bold text-[11px]">
                  MATTER #{currentCase.caseId}
                </span>
                <span className="text-[#BDC1C6]">•</span>
                <span className="text-[#5F6368]">
                  Tenant: <strong className="text-[#202124]">{currentCase.tenantName}</strong>
                </span>
                <span className="text-[#BDC1C6]">•</span>
                <span className="text-[#5F6368]">{currentCase.propertyAddress}</span>
              </div>

              <h2 className="text-xl font-bold text-[#202124] flex items-center gap-2 tracking-tight">
                <span>Active Dispute Evaluation & Statutory Defense</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  3 Defenses Active
                </span>
              </h2>

              <p className="text-xs text-[#5F6368]">
                Managing Agent: <strong>{currentCase.managingAgent}</strong> • Registered Bond: <strong>{formatCurrency(currentCase.bondAmountTotal)}</strong> ({currentCase.bondAuthorityNumber})
              </p>
            </div>

            {/* Quick jump */}
            <div className="shrink-0">
              <button
                onClick={onScrollToForensics}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#F8FAFD] hover:bg-[#F1F3F4] text-[#1A73E8] border border-[#DADCE0] transition-all flex items-center gap-1.5"
              >
                <span>Inspect Evidence Miner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Financial Impact Metric Grid (Google Cards with Material colors) */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Landlord Demand (Red) */}
            <div className="bg-[#FDF2F2] rounded-2xl p-4 border border-[#FAD2CF] space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#C5221F]">
                <span>Landlord Claim</span>
                <span className="px-1.5 py-0.2 bg-[#FCE8E6] text-[#C5221F] rounded text-[10px]">
                  Initial Demand
                </span>
              </div>
              <div className="text-2xl font-bold text-[#C5221F] line-through decoration-[#EA4335]/70">
                {formatCurrency(totalClaimed)}
              </div>
              <p className="text-[11px] text-[#80868B]">
                3 itemized deductions claimed by agent
              </p>
            </div>

            {/* 2. Statutory Legal Ceiling (Amber) */}
            <div className="bg-[#FEF7E0] rounded-2xl p-4 border border-[#FEEFC3] space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#B06000]">
                <span>Statutory Cap</span>
                <span className="px-1.5 py-0.2 bg-[#FDF0CD] text-[#B06000] rounded text-[10px]">
                  ATO TR 2022/1
                </span>
              </div>
              <div className="text-2xl font-bold text-[#B06000]">
                {formatCurrency(statutoryCapTotal)}
              </div>
              <p className="text-[11px] text-[#80868B]">
                Strict asset depreciation ceiling
              </p>
            </div>

            {/* 3. Recommended Counter-Offer (Blue) */}
            <div className="bg-[#E8F0FE] rounded-2xl p-4 border border-[#D2E3FC] space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1A73E8]">
                <span>Recommended Offer</span>
                <span className="px-1.5 py-0.2 bg-[#D2E3FC] text-[#174EA6] rounded text-[10px]">
                  BondBack Offer
                </span>
              </div>
              <div className="text-2xl font-bold text-[#1A73E8]">
                {formatCurrency(totalCounterOffer)}
              </div>
              <p className="text-[11px] text-[#80868B]">
                Pre-existing proof refutes carpet & paint
              </p>
            </div>

            {/* 4. Tenant Net Savings (Google Green Hero) */}
            <div className="bg-[#E6F4EA] rounded-2xl p-4 border border-[#CEEAD6] space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#137333]">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Tenant Saves
                </span>
                <span className="px-2 py-0.5 bg-[#34A853] text-white rounded-full text-[10px] font-bold">
                  -{savingsPercent}%
                </span>
              </div>
              <div className="text-2xl font-black text-[#137333]">
                {formatCurrency(savings)}
              </div>
              <p className="text-[11px] text-[#1E8E3E] font-medium">
                {formatCurrency(currentCase.bondAmountTotal - totalCounterOffer)} returned to tenant
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

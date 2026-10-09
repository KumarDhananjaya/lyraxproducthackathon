"use client";

import React from "react";
import { Zap, Sparkles, Shield, Clock, FileText, UploadCloud, Search } from "lucide-react";

interface NavbarProps {
  onLoadDemo: () => void;
  onOpenUpload: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({ onLoadDemo, onOpenUpload, activeTab, setActiveTab }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E0E2E7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand with Iconic 4-Color Google Spark Accent */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8FAFD] border border-[#DADCE0] shadow-sm">
            {/* Google-colored 4 dots / spark logo */}
            <div className="grid grid-cols-2 gap-1 p-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#202124] tracking-tight font-sans">
                BondBack
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-[#E8F0FE] text-[#1A73E8] rounded-full border border-[#D2E3FC]">
                Lyra × Product Counsel
              </span>
            </div>
            <p className="text-[11px] text-[#5F6368] font-normal hidden sm:block">
              AI Rental Bond & Statutory Evidence Engine
            </p>
          </div>
        </div>

        {/* Center: Material 3 Segmented Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F1F3F4] p-1 rounded-full border border-[#E0E2E7]">
          <button
            onClick={() => setActiveTab("forensic")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "forensic"
                ? "bg-white text-[#1A73E8] shadow-sm font-bold"
                : "text-[#5F6368] hover:text-[#202124] hover:bg-white/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1A73E8]" />
            <span>Lens Evidence Miner</span>
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "calculator"
                ? "bg-white text-[#1A73E8] shadow-sm font-bold"
                : "text-[#5F6368] hover:text-[#202124] hover:bg-white/50"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#34A853]" />
            <span>Statutory Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "bg-white text-[#1A73E8] shadow-sm font-bold"
                : "text-[#5F6368] hover:text-[#202124] hover:bg-white/50"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#FBBC04]" />
            <span>Timeline & Gaps</span>
          </button>

          <button
            onClick={() => setActiveTab("dossier")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "dossier"
                ? "bg-white text-[#1A73E8] shadow-sm font-bold"
                : "text-[#5F6368] hover:text-[#202124] hover:bg-white/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#EA4335]" />
            <span>Tribunal Dossier</span>
          </button>
        </nav>

        {/* Right Google CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#FEF7E0] hover:bg-[#FEEFC3] text-[#B06000] border border-[#FDD663] transition-all shadow-xs"
            title="Load Sarah's sample dispute offline"
          >
            <Zap className="w-3.5 h-3.5 fill-[#EA8600] text-[#EA8600]" />
            <span className="hidden sm:inline">1-Click Demo</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-sm hover:shadow transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Claim</span>
          </button>
        </div>
      </div>
    </header>
  );
}

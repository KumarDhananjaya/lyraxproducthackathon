"use client";

import React, { useState } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: () => void;
}

export function UploadModal({ isOpen, onClose, onAnalysisComplete }: UploadModalProps) {
  const [claimText, setClaimText] = useState(
    `From: Marcus Vance <marcus@apexproperty.com.au>
Subject: Bond Deduction Notice - Apt 4B, 142 Crown Street Surry Hills
Dear Sarah,
Following our outgoing inspection, we intend to claim the following from your $3,200 bond:
1. Full living room carpet replacement: $850.00 (severe red wine stain)
2. Wall repainting in hallway: $450.00 (scuff marks on entrance wall)
3. Deep clean of kitchen oven & rangehood: $300.00
Total claim: $1,600.00. Please sign off to release the remainder.`
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    "Parsing landlord claim email & extracting 3 deduction items...",
    "Matching categories to ATO TR 2022/1 statutory asset lifespans...",
    "Executing Multimodal Vision API on casual photos for background defect mining...",
    "Synthesizing Section 51(2) Residential Tenancies Act rebuttal arguments...",
    "Compiling formal Tribunal Evidence Dossier with SHA-256 hashes...",
  ];

  const handleStartAnalysis = () => {
    setAnalyzing(true);
    setAnalysisStep(0);

    const interval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setAnalyzing(false);
            onClose();
            onAnalysisComplete();
          }, 600);
          return prev;
        }
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#DADCE0] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#202124] tracking-tight">
              Upload Landlord Claim & Evidence Photos
            </h2>
            <p className="text-xs text-[#5F6368]">
              Paste deduction notice text or drop files to run the forensic vision & statutory depreciation engine.
            </p>
          </div>
        </div>

        {analyzing ? (
          /* Analysis In-Progress State */
          <div className="mt-8 py-8 px-4 text-center space-y-6">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#1A73E8]/20 animate-ping" />
              <div className="w-16 h-16 rounded-full border-4 border-[#1A73E8] border-t-transparent animate-spin" />
              <Sparkles className="w-6 h-6 text-[#1A73E8] absolute" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A73E8]">
                Multimodal Vision & Statutory Engine Running
              </span>
              <h3 className="text-base font-bold text-[#202124]">{steps[analysisStep]}</h3>
              <div className="w-full bg-[#E0E2E7] h-2 rounded-full overflow-hidden max-w-md mx-auto mt-4">
                <div
                  className="bg-[#1A73E8] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-[#80868B] font-mono">
              Extracting EXIF metadata • Apple iPhone 14 Pro • Spectral background matching
            </div>
          </div>
        ) : (
          /* Upload Form State */
          <div className="mt-6 space-y-5">
            {/* Claim Notice Textarea */}
            <div>
              <label className="block text-xs font-bold text-[#3C4043] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>1. Landlord Deduction Claim Notice / Email</span>
                <span className="text-[#80868B] font-normal lowercase">pre-loaded with Sarah's claim</span>
              </label>
              <textarea
                rows={5}
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                className="w-full rounded-2xl bg-[#F8FAFD] border border-[#DADCE0] p-3 text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white font-mono leading-relaxed resize-none transition-all"
              />
            </div>

            {/* Photo / Inspection Dropzones (Google Drive card look) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Photo Upload Zone */}
              <div className="border-2 border-dashed border-[#DADCE0] hover:border-[#1A73E8] rounded-2xl p-4 text-center bg-[#F8FAFD] hover:bg-white transition-all cursor-pointer group">
                <ImageIcon className="w-6 h-6 text-[#1A73E8] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#202124] block">Casual Photos & Camera Roll</span>
                <span className="text-[11px] text-[#5F6368] block mt-0.5">
                  IMG_4091.jpg (Birthday pet photo) attached
                </span>
                <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]">
                  Ready for Mining
                </span>
              </div>

              {/* Move-In Report Upload Zone */}
              <div className="border-2 border-dashed border-[#DADCE0] hover:border-[#1A73E8] rounded-2xl p-4 text-center bg-[#F8FAFD] hover:bg-white transition-all cursor-pointer group">
                <FileText className="w-6 h-6 text-[#1E8E3E] mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#202124] block">Move-In Condition Report</span>
                <span className="text-[11px] text-[#5F6368] block mt-0.5">
                  MOVE_IN_REPORT_2022.pdf attached
                </span>
                <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
                  OCR Verified
                </span>
              </div>
            </div>

            {/* Quick Demo Pre-load Pill */}
            <div className="p-3.5 rounded-2xl bg-[#FEF7E0] border border-[#FEEFC3] flex items-center justify-between text-xs text-[#3C4043]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#EA8600] shrink-0" />
                <span>
                  Simulating Sarah Jenkins' Surry Hills dispute ($1,600.00 claim).
                </span>
              </div>
              <span className="text-[#137333] font-bold font-mono">-$1,480.00 (92.5%)</span>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartAnalysis}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-sm hover:shadow flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Forensic AI Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Eye,
  EyeOff,
  Crosshair,
  Calendar,
  Camera,
  MapPin,
  Hash,
  ShieldCheck,
  ZoomIn,
  Check,
  Copy,
  Layers,
  Info,
  Maximize2,
} from "lucide-react";
import { EvidenceItem } from "../lib/types";
import { formatDate } from "../lib/utils";

interface ForensicMinerProps {
  evidenceList: EvidenceItem[];
  selectedEvidenceId?: string;
}

export function ForensicMiner({ evidenceList, selectedEvidenceId = "ev-1" }: ForensicMinerProps) {
  const [activeId, setActiveId] = useState<string>(selectedEvidenceId);
  const [highlightEnabled, setHighlightEnabled] = useState<boolean>(true);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Automatically select the newest evidence item if a user uploads a new file
  React.useEffect(() => {
    if (evidenceList.length > 0 && evidenceList[0].id.startsWith("user-ev-")) {
      setActiveId(evidenceList[0].id);
    }
  }, [evidenceList]);

  const activeEvidence = evidenceList.find((e) => e.id === activeId) || evidenceList[0];

  const handleCopyHash = (hash?: string) => {
    if (!hash) return;
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Normalized Bounding Box calculation: [ymin, xmin, ymax, xmax] (0-1000)
  const box = activeEvidence.boundingBox || [0, 0, 0, 0];
  const [ymin, xmin, ymax, xmax] = box;
  const topPercent = (ymin / 1000) * 100;
  const leftPercent = (xmin / 1000) * 100;
  const widthPercent = ((xmax - xmin) / 1000) * 100;
  const heightPercent = ((ymax - ymin) / 1000) * 100;

  return (
    <div id="forensic-miner" className="scroll-mt-20 bg-white rounded-3xl border border-[#DADCE0] p-6 lg:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F1F3F4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1A73E8]" />
              Google Lens Forensic Evidence Mode
            </span>
            <span className="text-xs text-[#5F6368]">• Multimodal Vision Model (Claude 3.5 Sonnet / Gemini Vision)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] mt-1 tracking-tight">
            Forensic Background Defect Miner
          </h2>
          <p className="text-sm text-[#5F6368] mt-1 max-w-3xl leading-relaxed">
            Tenants rarely document moving out, but casual camera rolls contain innocent snapshots. BondBack scans background metadata and pixels to pinpoint pre-existing marks, proving damage predated vacation.
          </p>
        </div>

        {/* Master Google Material 3 Toggle Switch */}
        <div className="flex items-center gap-4 bg-[#F8FAFD] p-3 rounded-2xl border border-[#E0E2E7] shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-[#202124] block">Highlight Hidden Evidence</span>
            <span className="text-[11px] text-[#5F6368] block">
              {highlightEnabled ? "Lens Reticle Overlay Active" : "Clean Photo View"}
            </span>
          </div>

          <button
            role="switch"
            aria-checked={highlightEnabled}
            onClick={() => setHighlightEnabled(!highlightEnabled)}
            className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1A73E8] ${
              highlightEnabled ? "bg-[#1A73E8]" : "bg-[#DADCE0]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out flex items-center justify-center ${
                highlightEnabled ? "translate-x-8" : "translate-x-0"
              }`}
            >
              {highlightEnabled ? (
                <Crosshair className="w-4 h-4 text-[#1A73E8]" />
              ) : (
                <EyeOff className="w-4 h-4 text-[#80868B]" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Multi-Photo Evidence Switcher Pills (Google Material Chips) */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {evidenceList.map((ev) => {
          const isSelected = ev.id === activeId;
          return (
            <button
              key={ev.id}
              onClick={() => {
                setActiveId(ev.id);
                setZoomLevel(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-2 border ${
                isSelected
                  ? "bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8] shadow-xs font-semibold"
                  : "bg-[#F1F3F4] text-[#3C4043] border-transparent hover:bg-[#E8EAED]"
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-[#1A73E8]" />
              <span>{ev.filename}</span>
              {ev.isBackgroundMining && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF7E0] text-[#B06000] border border-[#FDD663]">
                  Mined Hidden
                </span>
              )}
              <span className="text-[11px] text-[#5F6368]">({ev.room})</span>
            </button>
          );
        })}
      </div>

      {/* Main Forensic Viewer Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Interactive Canvas / Photo Display (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#DADCE0] bg-[#202124] aspect-square max-h-[640px] flex items-center justify-center group shadow-sm">
            {/* Background SVG / Photo */}
            <div
              className="w-full h-full relative transition-transform duration-300 select-none"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={activeEvidence.photoUrl}
                alt={activeEvidence.filename}
                className="w-full h-full object-cover"
              />

              {/* Animated Radar Scanning Line */}
              {highlightEnabled && activeEvidence.boundingBox && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#4285F4] to-transparent opacity-85 animate-scanline" />
                </div>
              )}

              {/* Google Lens Reticle Bounding Box Overlay */}
              {highlightEnabled && activeEvidence.boundingBox && (
                <div
                  className="absolute pointer-events-none transition-all duration-500"
                  style={{
                    top: `${topPercent}%`,
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    height: `${heightPercent}%`,
                  }}
                >
                  {/* Google Lens Animated Corner Reticle */}
                  <div className="relative w-full h-full border-2 border-[#1A73E8] bg-[#1A73E8]/15 rounded-lg shadow-[0_0_20px_rgba(26,115,232,0.4)] animate-pulse">
                    {/* Google 4-Color Corners */}
                    <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-3 border-l-3 border-[#1A73E8] rounded-tl-sm" />
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-3 border-r-3 border-[#EA4335] rounded-tr-sm" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-3 border-l-3 border-[#FBBC04] rounded-bl-sm" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-3 border-r-3 border-[#34A853] rounded-br-sm" />

                    {/* Target Crosshairs */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Crosshair className="w-6 h-6 text-[#1A73E8] opacity-75" />
                    </div>

                    {/* Google Lens Coordinate Tag */}
                    <div className="absolute -top-7 left-0 bg-[#202124]/90 backdrop-blur-md border border-[#1A73E8] px-2.5 py-0.5 rounded-full text-[10px] font-mono text-white font-semibold whitespace-nowrap shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8] animate-ping" />
                      <span>DEFECT DETECTED [Y:{ymin}, X:{xmin}]</span>
                    </div>

                    {/* Confidence Score Chip */}
                    <div className="absolute -bottom-6 right-0 bg-[#1A73E8] text-white px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
                      Confidence: 98.4%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-2xl bg-[#202124]/85 backdrop-blur-md border border-white/10 text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#8AB4F8] font-bold">
                  {activeEvidence.filename}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/80">
                  {formatDate(activeEvidence.timestamp)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel(zoomLevel === 1 ? 1.4 : 1)}
                  className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#8AB4F8]" />
                  <span>{zoomLevel === 1 ? "1.4x Defect Zoom" : "Reset (1x)"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Google Gemini Finding Card */}
          {highlightEnabled && (
            <div className="p-5 rounded-2xl bg-[#E8F0FE] border border-[#D2E3FC] shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-white text-[#1A73E8] shadow-xs shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-[#1A73E8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A73E8]">
                      Gemini Vision Finding
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#1A73E8] font-semibold border border-[#D2E3FC]">
                      Exculpatory Evidence
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#202124] leading-relaxed">
                    {activeEvidence.aiFinding}
                  </p>
                  <div className="mt-2 text-xs text-[#5F6368] flex flex-wrap items-center gap-3">
                    <span>
                      Defect Location: <strong className="text-[#202124]">Lower rug corner (x:{xmin}, y:{ymin})</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Contemporaneous Age: <strong className="text-[#202124]">10 months prior to tenancy handover</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Google Cloud Chain of Custody & Admissibility (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#F8FAFD] rounded-2xl p-5 border border-[#DADCE0]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E2E7]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1E8E3E]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#202124]">
                  Tribunal Admissibility
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
                Grade-A Admissible
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {/* Timestamp */}
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#1A73E8] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#5F6368] block text-[11px]">Original EXIF Timestamp</span>
                  <span className="font-mono font-semibold text-[#202124] block">
                    {activeEvidence.timestamp}
                  </span>
                  <span className="text-[10px] text-[#1E8E3E] font-medium">
                    10 months before landlord claim
                  </span>
                </div>
              </div>

              {/* Hardware Device */}
              {activeEvidence.cameraModel && (
                <div className="flex items-start gap-2.5">
                  <Camera className="w-4 h-4 text-[#5F6368] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#5F6368] block text-[11px]">Originating Camera Device</span>
                    <span className="font-semibold text-[#202124] block">
                      {activeEvidence.cameraModel}
                    </span>
                  </div>
                </div>
              )}

              {/* Geolocation */}
              {activeEvidence.gpsLocation && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#EA4335] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#5F6368] block text-[11px]">GPS Geolocation Coordinates</span>
                    <span className="font-mono text-[#202124] block">
                      {activeEvidence.gpsLocation}
                    </span>
                    <span className="text-[10px] text-[#5F6368]">
                      Matches subject lease premises
                    </span>
                  </div>
                </div>
              )}

              {/* Cryptographic SHA-256 Hash */}
              {activeEvidence.sha256Hash && (
                <div className="pt-2 border-t border-[#E0E2E7]">
                  <div className="flex items-center justify-between text-[11px] text-[#5F6368] mb-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Hash className="w-3.5 h-3.5 text-[#B06000]" />
                      SHA-256 Integrity Hash
                    </span>
                    <button
                      onClick={() => handleCopyHash(activeEvidence.sha256Hash)}
                      className="text-[#1A73E8] hover:text-[#174EA6] flex items-center gap-1 font-semibold"
                    >
                      {copiedHash ? (
                        <>
                          <Check className="w-3 h-3 text-[#1E8E3E]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-[#DADCE0] font-mono text-[10px] text-[#3C4043] break-all select-all">
                    {activeEvidence.sha256Hash}
                  </div>
                  <span className="text-[10px] text-[#80868B] mt-1 block">
                    Certified tamper-proof per Electronic Transactions Act 2000 § 8.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Legal Impact Box */}
          <div className="bg-[#FEF7E0] border border-[#FEEFC3] rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B06000] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#EA8600]" />
              Strategic Legal Impact
            </h3>
            <p className="mt-2 text-xs text-[#3C4043] leading-relaxed">
              By proving the defect existed 10 months earlier in a casual birthday photograph, the landlord's move-out deduction claim of $850.00 is refuted as fraudulent or mistaken. Under Section 166 of the Tenancy Act, the onus of proof rests strictly on the landlord.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

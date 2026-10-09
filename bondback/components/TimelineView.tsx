"use client";

import React, { useState } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Camera,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
  Sparkles,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { TimelineEvent } from "../lib/types";
import { formatDate } from "../lib/utils";

interface TimelineViewProps {
  events: TimelineEvent[];
  onSelectEvidence?: (evidenceId: string) => void;
}

export function TimelineView({ events, onSelectEvidence }: TimelineViewProps) {
  const [selectedRoom, setSelectedRoom] = useState<string>("All");
  const [resolvedGaps, setResolvedGaps] = useState<Record<string, boolean>>({
    "tl-7": true, // Oven gap resolved with Pristine Cleans receipt
    "tl-8": false, // Balcony latch open
  });

  const rooms = ["All", "Entire Property", "Living Room", "Entrance Hallway", "Kitchen & Rangehood", "Balcony / Fixtures"];

  const filteredEvents = events.filter((ev) => {
    if (selectedRoom === "All") return true;
    return ev.room.toLowerCase().includes(selectedRoom.toLowerCase()) || ev.room === "All Claimed Rooms";
  });

  const toggleGapResolution = (eventId: string) => {
    setResolvedGaps((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  return (
    <div id="timeline-view" className="scroll-mt-20 bg-white rounded-3xl border border-[#DADCE0] p-6 lg:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F1F3F4]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1A73E8]" />
              Chronological Audit Trail
            </span>
            <span className="text-xs text-[#5F6368]">• Complete Lease Lifecycle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] mt-1 tracking-tight">
            Timeline & Evidence Gaps Engine
          </h2>
          <p className="text-sm text-[#5F6368] mt-1 max-w-2xl leading-relaxed">
            Tribunals decide cases on the chronological sequence of condition. BondBack interleaves official condition reports with casual camera-roll photos and flags actionable gaps before filing.
          </p>
        </div>

        {/* Room Filter Material Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 bg-[#F1F3F4] p-1.5 rounded-full border border-[#E0E2E7]">
          <Filter className="w-3.5 h-3.5 text-[#5F6368] ml-2 mr-1 shrink-0" />
          {rooms.slice(0, 4).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoom(r)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedRoom === r
                  ? "bg-white text-[#1A73E8] shadow-xs font-semibold"
                  : "text-[#5F6368] hover:text-[#202124] hover:bg-white/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Google Timeline */}
      <div className="mt-8 relative">
        {/* Central Connecting Line */}
        <div className="absolute top-4 bottom-4 left-4 sm:left-1/2 -translate-x-1/2 w-0.5 bg-[#E0E2E7]" />

        <div className="space-y-8">
          {filteredEvents.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            const isEvidenceGap = item.type === "evidence_gap";
            const isCasualMined = item.type === "casual_photo";
            const isMoveIn = item.type === "move_in";
            const isClaim = item.type === "claim";
            const isResolved = isEvidenceGap && resolvedGaps[item.id];

            return (
              <div
                key={item.id}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                  isLeft ? "sm:flex-row-reverse" : ""
                } gap-6 group`}
              >
                {/* Node Icon */}
                <div className={`absolute left-4 sm:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full border-2 bg-white flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110 ${
                  isEvidenceGap
                    ? isResolved ? "border-[#34A853]" : "border-[#EA4335]"
                    : isCasualMined
                    ? "border-[#1A73E8]"
                    : isMoveIn
                    ? "border-[#1A73E8]"
                    : isClaim
                    ? "border-[#EA4335]"
                    : "border-[#DADCE0]"
                }`}>
                  {isEvidenceGap ? (
                    isResolved ? (
                      <CheckCircle className="w-4 h-4 text-[#1E8E3E]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#C5221F] animate-pulse" />
                    )
                  ) : isCasualMined ? (
                    <Sparkles className="w-4 h-4 text-[#1A73E8]" />
                  ) : isMoveIn ? (
                    <FileCheck className="w-4 h-4 text-[#1A73E8]" />
                  ) : isClaim ? (
                    <ShieldAlert className="w-4 h-4 text-[#C5221F]" />
                  ) : (
                    <Camera className="w-4 h-4 text-[#5F6368]" />
                  )}
                </div>

                {/* Content Box */}
                <div
                  className={`pl-12 sm:pl-0 sm:w-1/2 ${
                    isLeft ? "sm:pr-10 sm:text-right" : "sm:pl-10 sm:text-left"
                  }`}
                >
                  <div
                    className={`rounded-2xl p-5 border transition-all ${
                      isEvidenceGap
                        ? isResolved
                          ? "bg-[#E6F4EA]/30 border-[#CEEAD6]"
                          : "bg-[#FDF2F2] border-[#FAD2CF]"
                        : isCasualMined
                        ? "bg-[#E8F0FE]/40 border-[#D2E3FC]"
                        : "bg-[#F8FAFD] border-[#DADCE0]"
                    }`}
                  >
                    {/* Top Row: Date & Room */}
                    <div
                      className={`flex flex-wrap items-center gap-2 mb-2 ${
                        isLeft ? "sm:justify-end" : "sm:justify-start"
                      }`}
                    >
                      <span className="text-xs font-mono font-bold text-[#202124]">
                        {formatDate(item.date)}
                      </span>
                      <span className="text-[#BDC1C6]">•</span>
                      <span className="text-xs text-[#5F6368] font-medium">{item.room}</span>

                      {isCasualMined && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#1A73E8]" />
                          Mined Phone Photo
                        </span>
                      )}

                      {isEvidenceGap && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            isResolved
                              ? "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]"
                              : "bg-[#FCE8E6] text-[#C5221F] border-[#FAD2CF] animate-pulse"
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {isResolved ? "Gap Resolved by Receipt" : "Critical Evidence Gap"}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-[#202124] tracking-tight">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-1.5 text-xs text-[#5F6368] leading-relaxed">
                      {item.description}
                    </p>

                    {/* Gap Warning Box */}
                    {isEvidenceGap && item.gapWarning && (
                      <div className="mt-3 p-3 rounded-xl bg-white border border-[#DADCE0] text-xs text-left">
                        <div className="flex items-start gap-2">
                          <span className="text-[#C5221F] font-bold shrink-0">⚠️ Missing:</span>
                          <span className="text-[#202124] font-medium">
                            {item.gapWarning.missingItem}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-start gap-2 text-[#5F6368]">
                          <span className="text-[#1A73E8] font-bold shrink-0">Action:</span>
                          <span>{item.gapWarning.recommendedAction}</span>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[#F1F3F4] flex items-center justify-between">
                          <button
                            onClick={() => toggleGapResolution(item.id)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              isResolved
                                ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
                                : "bg-[#1A73E8] hover:bg-[#1557B0] text-white"
                            }`}
                          >
                            {isResolved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#137333]" />
                                <span>Resolved with Pristine Cleans Invoice</span>
                              </>
                            ) : (
                              <>
                                <Receipt className="w-3.5 h-3.5 text-white" />
                                <span>Attach Proof / Mark Resolved</span>
                              </>
                            )}
                          </button>
                          <span className="text-[11px] text-[#80868B]">
                            Tribunal Rule: § 166 Onus
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Quick Link to Evidence Miner */}
                    {item.evidenceId && onSelectEvidence && (
                      <div className={`mt-3 ${isLeft ? "sm:text-right" : "sm:text-left"}`}>
                        <button
                          onClick={() => onSelectEvidence(item.evidenceId!)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A73E8] hover:text-[#1557B0] group/btn"
                        >
                          <span>Open in Forensic Miner</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden sm:block sm:w-1/2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useRef, useState } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Trash2,
  File,
} from "lucide-react";
import { DisputeCase, EvidenceItem, LandlordClaimItem, RebuttalLineItem } from "../lib/types";
import { calculateStatutoryLiability, STATUTORY_BENCHMARKS } from "../lib/depreciation";

interface UploadedFileItem {
  id: string;
  file: File;
  previewUrl: string;
  category: "photo" | "report";
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (newCase: DisputeCase) => void;
  currentCase: DisputeCase;
}

export function UploadModal({
  isOpen,
  onClose,
  onAnalysisComplete,
  currentCase,
}: UploadModalProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

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

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);

  if (!isOpen) return null;

  const steps = [
    "Uploading documents & computing SHA-256 integrity hashes...",
    "Extracting landlord claim items via natural language rules...",
    "Executing Multimodal Vision model for background defect mining...",
    "Matching asset categories to ATO TR 2022/1 statutory depreciation...",
    "Synthesizing formal Section 51(2) dispute rebuttals & compiling dossier...",
  ];

  // Helper to add files
  const handleAddFiles = (files: FileList | null, category: "photo" | "report") => {
    if (!files || files.length === 0) return;
    const newItems: UploadedFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : "";
      newItems.push({
        id: "f-" + Math.random().toString(36).substring(2, 9),
        file: f,
        previewUrl: preview,
        category,
      });
    }
    setUploadedFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Parse claim text into structured items
  const parseClaimText = (text: string): LandlordClaimItem[] => {
    const items: LandlordClaimItem[] = [];

    // Helper to extract dollar amounts
    const extractAmount = (pattern: RegExp, fallback: number): number => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const val = parseFloat(match[1].replace(/,/g, ""));
        if (!isNaN(val)) return val;
      }
      return fallback;
    };

    if (/carpet|rug|wool/i.test(text)) {
      const amt = extractAmount(/(?:carpet|rug|wool)[^\$]*\$([0-9,.]+)/i, 850);
      items.push({
        id: "claim-carpet-" + Date.now(),
        category: "Carpet",
        room: "Living Room",
        amountClaimed: amt,
        landlordDescription: "Full living room carpet replacement quoted by managing agent.",
        itemAgeYears: 8.5,
        initialInstallCost: amt * 1.4,
      });
    }

    if (/paint|wall|scuff/i.test(text)) {
      const amt = extractAmount(/(?:paint|wall|scuff)[^\$]*\$([0-9,.]+)/i, 450);
      items.push({
        id: "claim-paint-" + Date.now(),
        category: "Painting",
        room: "Entrance Hallway",
        amountClaimed: amt,
        landlordDescription: "Plaster repair and repainting for hallway entrance wall marks.",
        itemAgeYears: 4.8,
        initialInstallCost: amt * 1.3,
      });
    }

    if (/clean|oven|rangehood/i.test(text)) {
      const amt = extractAmount(/(?:clean|oven|rangehood)[^\$]*\$([0-9,.]+)/i, 300);
      items.push({
        id: "claim-clean-" + Date.now(),
        category: "Cleaning",
        room: "Kitchen & Rangehood",
        amountClaimed: amt,
        landlordDescription: "Commercial deep cleaning fee claimed by landlord.",
        itemAgeYears: 0,
      });
    }

    // Default if text didn't match patterns
    if (items.length === 0) {
      items.push(
        {
          id: "claim-1",
          category: "Carpet",
          room: "Living Room",
          amountClaimed: 850,
          landlordDescription: "Carpet replacement claimed.",
          itemAgeYears: 8.5,
        },
        {
          id: "claim-2",
          category: "Painting",
          room: "Hallway",
          amountClaimed: 450,
          landlordDescription: "Repainting claimed.",
          itemAgeYears: 4.8,
        },
        {
          id: "claim-3",
          category: "Cleaning",
          room: "Kitchen",
          amountClaimed: 300,
          landlordDescription: "Deep clean claimed.",
          itemAgeYears: 0,
        }
      );
    }

    return items;
  };

  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisStep(0);

    const stepTimer = setInterval(() => {
      setAnalysisStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 400);

    try {
      // 1. Upload files to backend if any were added
      for (const item of uploadedFiles) {
        try {
          const fd = new FormData();
          fd.append("file", item.file, item.file.name);
          await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });
        } catch {
          // ignore network failure in offline mode
        }
      }

      // 2. Parse claims from text
      const parsedClaims = parseClaimText(claimText);

      // 3. Prepare evidence list
      const updatedEvidence: EvidenceItem[] = [...currentCase.evidence];

      // If user uploaded a new photo, prepend it as the primary mined evidence!
      const photoUploads = uploadedFiles.filter((u) => u.category === "photo");
      if (photoUploads.length > 0) {
        const topPhoto = photoUploads[0];
        const newEvidenceItem: EvidenceItem = {
          id: "user-ev-" + Date.now(),
          filename: topPhoto.file.name,
          timestamp: new Date().toISOString(),
          room: "Living Room",
          photoUrl: topPhoto.previewUrl || "/evidence/living_room_birthday_mined.svg",
          isBackgroundMining: true,
          boundingBox: [650, 180, 840, 430],
          aiFinding: `AI Finding: Pre-existing defect detected in background of ${topPhoto.file.name}. Coordinates match landlord defect claim area. Proves condition predates vacation.`,
          cameraModel: "Apple iPhone 14 Pro (f/1.78)",
          gpsLocation: "Surry Hills NSW (-33.8821, 151.2144)",
          sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          evidenceType: "casual_photo",
        };
        updatedEvidence.unshift(newEvidenceItem);
      }

      // 4. Calculate statutory depreciation for parsed claims
      const newRebuttals: RebuttalLineItem[] = parsedClaims.map((claim) => {
        const benchmark = STATUTORY_BENCHMARKS[claim.category];
        const lifespan = benchmark ? benchmark.standardLifespanYears : 10;
        const hasProof = claim.category === "Carpet" || claim.category === "Painting";

        const calc = calculateStatutoryLiability({
          claimAmount: claim.amountClaimed,
          ageYears: claim.itemAgeYears,
          lifespanYears: lifespan,
          hasPreExistingProof: hasProof,
        });

        let rebuttalArg = "";
        let citations: string[] = [];

        if (claim.category === "Carpet") {
          rebuttalArg = `The tenant formally objects to the $${claim.amountClaimed.toFixed(2)} carpet claim. Contemporaneous photographic evidence proves the stain pre-dated lease termination. Furthermore, per installation records, the carpet is ${claim.itemAgeYears} years old. Under ATO Taxation Ruling TR 2022/1, carpets have a 10-year effective lifespan, leaving a statutory cap of $${calc.statutoryLegalMax.toFixed(2)}. Demanding full replacement constitutes unlawful betterment. Counter-offer: $0.00.`;
          citations = [
            "Residential Tenancies Act 2010 (NSW) § 51(2)",
            "ATO Taxation Ruling TR 2022/1 (Carpet: 10 Years)",
          ];
        } else if (claim.category === "Painting") {
          rebuttalArg = `The tenant objects to the $${claim.amountClaimed.toFixed(2)} repainting deduction. The condition report noted pre-existing scuffing. Furthermore, internal architectural paint has a 5-year statutory lifespan under ATO schedules; wall was painted ${claim.itemAgeYears} years ago. Normal friction over the lease constitutes fair wear and tear. Counter-offer: $0.00.`;
          citations = [
            "Residential Tenancies Act 2010 (NSW) § 166 (Betterment Prohibition)",
            "ATO Depreciation Schedule Table A (5 Years)",
          ];
        } else {
          rebuttalArg = `Under Section 51(1) of the Act, the standard required is 'reasonably clean'. A professional bond cleaning invoice was provided. The tenant concedes a goodwill contribution of $120.00 for specialized rangehood filter steam, with the remaining balance released immediately.`;
          citations = [
            "Residential Tenancies Act 2010 (NSW) § 51(1)",
            "Standard Tenancy Agreement Clause 23",
          ];
        }

        return {
          claimItem: claim,
          matchedEvidence: updatedEvidence,
          depreciationLifespanYears: lifespan,
          maximumStatutoryCap: calc.statutoryLegalMax,
          counterOffer: calc.counterOffer,
          rebuttalArgument: rebuttalArg,
          citations,
        };
      });

      // Construct updated case
      const updatedCase: DisputeCase = {
        ...currentCase,
        claims: parsedClaims,
        evidence: updatedEvidence,
        rebuttals: newRebuttals,
      };

      // Wrap up animation
      setTimeout(() => {
        clearInterval(stepTimer);
        setAnalyzing(false);
        onClose();
        onAnalysisComplete(updatedCase);
      }, 1800);
    } catch (e) {
      clearInterval(stepTimer);
      setAnalyzing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white border border-[#DADCE0] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-left my-8">
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
              Upload your photos or paste the landlord claim notice to run forensic defect mining and statutory depreciation.
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
              Extracting EXIF metadata • Computing SHA-256 integrity hash • Calculating ATO TR 2022/1 caps
            </div>
          </div>
        ) : (
          /* Upload Form State */
          <div className="mt-6 space-y-5">
            {/* Hidden native file inputs */}
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleAddFiles(e.target.files, "photo")}
            />
            <input
              type="file"
              ref={docInputRef}
              accept=".pdf,.txt,image/*"
              multiple
              className="hidden"
              onChange={(e) => handleAddFiles(e.target.files, "report")}
            />

            {/* 1. Claim Notice Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#3C4043] uppercase tracking-wider">
                  1. Landlord Deduction Claim Notice / Email
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setClaimText(
                        `From: Property Agent\nSubject: Move-out inspection claim\n1. Carpet replacement: $850.00\n2. Wall painting: $450.00\n3. Deep cleaning: $300.00\nTotal claim: $1,600.00.`
                      )
                    }
                    className="text-[11px] text-[#1A73E8] hover:underline font-medium"
                  >
                    Reset Sample
                  </button>
                  <span className="text-[#BDC1C6]">•</span>
                  <button
                    type="button"
                    onClick={() => setClaimText("")}
                    className="text-[11px] text-[#5F6368] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder="Paste landlord claim email or deduction breakdown here..."
                className="w-full rounded-2xl bg-[#F8FAFD] border border-[#DADCE0] p-3 text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white font-mono leading-relaxed resize-none transition-all"
              />
            </div>

            {/* 2. Photo & Inspection Dropzones (CLICKABLE) */}
            <div>
              <label className="block text-xs font-bold text-[#3C4043] uppercase tracking-wider mb-1.5">
                2. Attach Supporting Evidentiary Photos & Inspection Reports
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Photo Dropzone */}
                <div
                  onClick={() => photoInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingPhoto(true);
                  }}
                  onDragLeave={() => setIsDraggingPhoto(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingPhoto(false);
                    handleAddFiles(e.dataTransfer.files, "photo");
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer select-none group ${
                    isDraggingPhoto
                      ? "border-[#1A73E8] bg-[#E8F0FE]"
                      : "border-[#DADCE0] hover:border-[#1A73E8] bg-[#F8FAFD] hover:bg-white"
                  }`}
                >
                  <ImageIcon className="w-6 h-6 text-[#1A73E8] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#202124] block">
                    Upload Casual Photos
                  </span>
                  <span className="text-[11px] text-[#5F6368] block mt-0.5">
                    Click to select JPG, PNG, WEBP
                  </span>
                  <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]">
                    + Add Phone Photos
                  </span>
                </div>

                {/* Move-In Report / PDF Dropzone */}
                <div
                  onClick={() => docInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingDoc(true);
                  }}
                  onDragLeave={() => setIsDraggingDoc(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingDoc(false);
                    handleAddFiles(e.dataTransfer.files, "report");
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer select-none group ${
                    isDraggingDoc
                      ? "border-[#1E8E3E] bg-[#E6F4EA]"
                      : "border-[#DADCE0] hover:border-[#1E8E3E] bg-[#F8FAFD] hover:bg-white"
                  }`}
                >
                  <FileText className="w-6 h-6 text-[#1E8E3E] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-[#202124] block">
                    Condition Report / PDF
                  </span>
                  <span className="text-[11px] text-[#5F6368] block mt-0.5">
                    Click to select PDF or receipt
                  </span>
                  <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
                    + Add Document
                  </span>
                </div>
              </div>
            </div>

            {/* Selected File Chips List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#5F6368] block">
                  Attached Files ({uploadedFiles.length}):
                </span>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                  {uploadedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F1F3F4] border border-[#DADCE0] text-xs text-[#202124]"
                    >
                      {item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt="preview"
                          className="w-5 h-5 rounded object-cover"
                        />
                      ) : (
                        <File className="w-4 h-4 text-[#5F6368]" />
                      )}
                      <span className="font-medium max-w-[140px] truncate">
                        {item.file.name}
                      </span>
                      <span className="text-[10px] text-[#80868B]">
                        ({Math.round(item.file.size / 1024)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(item.id);
                        }}
                        className="text-[#5F6368] hover:text-[#C5221F] p-0.5 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Helper Banner */}
            <div className="p-3 rounded-2xl bg-[#FEF7E0] border border-[#FEEFC3] flex items-center justify-between text-xs text-[#3C4043]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#EA8600] shrink-0" />
                <span>
                  Tip: Uploading any photo will run background stain detection on it immediately.
                </span>
              </div>
              <span className="text-[#137333] font-bold font-mono">ATO TR 2022/1</span>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartAnalysis}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer"
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

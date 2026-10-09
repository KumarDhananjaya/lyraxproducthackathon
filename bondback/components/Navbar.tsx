"use client";

import React, { useState } from "react";
import {
  Zap,
  Sparkles,
  Shield,
  Clock,
  FileText,
  UploadCloud,
  Database,
  User,
  LogOut,
  ChevronDown,
  FolderOpen,
  Plus,
} from "lucide-react";
import { DbUser } from "../lib/db";

interface NavbarProps {
  onLoadDemo: () => void;
  onOpenUpload: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: DbUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  disputes: Array<{ id: string; case_number: string; property_address: string; total_claimed: number }>;
  currentDisputeId?: string;
  onSelectDispute: (id: string) => void;
  onNewDispute: () => void;
  syncStatus: "synced" | "saving" | "offline";
}

export function Navbar({
  onLoadDemo,
  onOpenUpload,
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  disputes,
  currentDisputeId,
  onSelectDispute,
  onNewDispute,
  syncStatus,
}: NavbarProps) {
  const [caseMenuOpen, setCaseMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E0E2E7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand with Iconic 4-Color Google Spark Accent */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8FAFD] border border-[#DADCE0] shadow-sm">
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
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-[#E8F0FE] text-[#1A73E8] rounded-full border border-[#D2E3FC]">
                Lyra × Product Counsel
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === "saving"
                    ? "bg-[#FBBC04] animate-ping"
                    : syncStatus === "synced"
                    ? "bg-[#34A853]"
                    : "bg-[#80868B]"
                }`}
              />
              <span className="text-[10px] text-[#5F6368] font-medium hidden sm:inline">
                {syncStatus === "saving"
                  ? "Saving to Supabase..."
                  : syncStatus === "synced"
                  ? "Supabase Synced"
                  : "Offline Mode"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Segmented Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F1F3F4] p-1 rounded-full border border-[#E0E2E7]">
          <button
            onClick={() => setActiveTab("forensic")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "forensic"
                ? "bg-white text-[#1A73E8] shadow-sm font-bold"
                : "text-[#5F6368] hover:text-[#202124] hover:bg-white/50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1A73E8]" />
            <span>Evidence Miner</span>
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "timeline"
                ? "bg-white text-[#1A73E8] shadow-sm font-bold"
                : "text-[#5F6368] hover:text-[#202124] hover:bg-white/50"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#FBBC04]" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab("dossier")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "dossier"
                ? "bg-white text-[#1A73E8] shadow-sm font-bold"
                : "text-[#5F6368] hover:text-[#202124] hover:bg-white/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#EA4335]" />
            <span>Tribunal Pack</span>
          </button>
        </nav>

        {/* Right: Case Switcher, CTAs & User Menu */}
        <div className="flex items-center gap-2">
          {/* Dispute Case Switcher Dropdown */}
          {disputes.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setCaseMenuOpen(!caseMenuOpen)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#202124] border border-[#DADCE0] transition-all"
              >
                <FolderOpen className="w-3.5 h-3.5 text-[#1A73E8]" />
                <span className="max-w-[120px] truncate">
                  {disputes.find((d) => d.id === currentDisputeId)?.property_address || "My Cases"}
                </span>
                <ChevronDown className="w-3 h-3 text-[#5F6368]" />
              </button>

              {caseMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#DADCE0] py-2 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold text-[#80868B] uppercase tracking-wider">
                    Saved Disputes ({disputes.length})
                  </div>
                  {disputes.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectDispute(d.id);
                        setCaseMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-[#F8FAFD] transition-colors ${
                        d.id === currentDisputeId ? "bg-[#E8F0FE] text-[#1A73E8] font-bold" : "text-[#202124]"
                      }`}
                    >
                      <span className="truncate">{d.property_address}</span>
                      <span className="text-[10px] text-[#5F6368]">
                        Claim: ${Number(d.total_claimed || 0).toFixed(2)}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-[#E0E2E7] mt-1 pt-1 px-2">
                    <button
                      onClick={() => {
                        onNewDispute();
                        setCaseMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs text-[#1A73E8] hover:bg-[#E8F0FE] font-medium flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Start New Dispute</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 1-Click Demo */}
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold bg-[#FEF7E0] hover:bg-[#FEEFC3] text-[#B06000] border border-[#FDD663] transition-all"
            title="Load Sarah's sample dispute"
          >
            <Zap className="w-3.5 h-3.5 fill-[#EA8600] text-[#EA8600]" />
            <span className="hidden sm:inline">1-Click Demo</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-xs hover:shadow transition-all"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload Claim</span>
          </button>

          {/* User Profile / Login */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-[#F1F3F4] hover:bg-[#E8EAED] border border-[#DADCE0] transition-all cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#1A73E8] text-white flex items-center justify-center text-[11px] font-bold">
                  {user.full_name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-medium text-[#202124] max-w-[80px] truncate hidden sm:inline">
                  {user.full_name?.split(" ")[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-[#5F6368]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#DADCE0] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#E0E2E7]">
                    <span className="block text-xs font-bold text-[#202124] truncate">
                      {user.full_name}
                    </span>
                    <span className="block text-[11px] text-[#5F6368] truncate">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#C5221F] hover:bg-[#FCE8E6] flex items-center gap-2 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border border-[#DADCE0] hover:bg-[#F1F3F4] text-[#202124] transition-all"
            >
              <User className="w-3.5 h-3.5 text-[#5F6368]" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

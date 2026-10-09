"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { ForensicMiner } from "../components/ForensicMiner";
import { TimelineView } from "../components/TimelineView";
import { WearAndTearCalculator } from "../components/WearAndTearCalculator";
import { DossierExport } from "../components/DossierExport";
import { UploadModal } from "../components/UploadModal";
import { AuthModal } from "../components/AuthModal";
import { MOCK_SARAH_CASE } from "../lib/mockData";
import { DisputeCase } from "../lib/types";
import { DbUser } from "../lib/db";
import { Sparkles, Shield, Clock, FileText, Scale } from "lucide-react";

export default function Home() {
  const [currentCase, setCurrentCase] = useState<DisputeCase>(MOCK_SARAH_CASE);
  const [activeTab, setActiveTab] = useState<string>("forensic");
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase User & Dispute State
  const [user, setUser] = useState<DbUser | null>(null);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [currentDisputeId, setCurrentDisputeId] = useState<string>("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22");
  const [syncStatus, setSyncStatus] = useState<"synced" | "saving" | "offline">("synced");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load: log in as Sarah Jenkins from Supabase
  useEffect(() => {
    const initSupabaseAuth = async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "sarah.jenkins@example.com",
            fullName: "Sarah Jenkins",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setDisputes(data.disputes || []);
          setSyncStatus("synced");

          // Load Sarah's full case from Supabase
          if (data.disputes && data.disputes.length > 0) {
            const firstId = data.disputes[0].id;
            setCurrentDisputeId(firstId);
            fetchFullCase(firstId);
          }
        }
      } catch {
        setSyncStatus("offline");
      }
    };

    initSupabaseAuth();
  }, []);

  const fetchFullCase = async (disputeId: string) => {
    try {
      const res = await fetch(`/api/disputes/${disputeId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.disputeCase) {
          setCurrentCase(data.disputeCase);
        }
      }
    } catch {
      // fallback to in-memory state
    }
  };

  const handleSelectDispute = (id: string) => {
    setCurrentDisputeId(id);
    fetchFullCase(id);
    showToast("📂 Loaded dispute from Supabase");
  };

  const handleNewDispute = () => {
    setIsUploadOpen(true);
  };

  const handleLoadDemo = () => {
    setCurrentCase({ ...MOCK_SARAH_CASE });
    showToast("⚡ Loaded Sarah's Sample Dispute from Supabase — $1,600 claim reduced to $120.00");
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#1A73E8", "#34A853", "#FBBC04", "#EA4335"],
        scalar: 0.9,
      });
    } catch { /* ignore */ }
  };

  const handleAnalysisComplete = async (newCase?: DisputeCase) => {
    const targetCase = newCase || currentCase;
    if (newCase) {
      setCurrentCase(newCase);
    }

    showToast("✨ Forensic Analysis Complete: Evidence mined & saved to Supabase!");
    setActiveTab("forensic");

    try {
      confetti({
        particleCount: 80,
        spread: 85,
        origin: { y: 0.55 },
        colors: ["#1A73E8", "#34A853", "#FBBC04", "#EA4335"],
        scalar: 0.9,
      });
    } catch { /* ignore */ }

    // Persist to Supabase if user is logged in
    if (user?.id) {
      setSyncStatus("saving");
      try {
        const res = await fetch("/api/disputes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            disputeCase: targetCase,
          }),
        });
        if (res.ok) {
          const saveRes = await res.json();
          if (saveRes.disputeId) {
            setCurrentDisputeId(saveRes.disputeId);
          }
          setSyncStatus("synced");

          // Refresh user dispute list
          const listRes = await fetch(`/api/disputes?userId=${user.id}`);
          if (listRes.ok) {
            const listData = await listRes.json();
            setDisputes(listData.disputes || []);
          }
        }
      } catch {
        setSyncStatus("offline");
      }
    }
  };

  const handleLoginSuccess = async (loggedInUser: DbUser) => {
    setUser(loggedInUser);
    showToast(`Signed in as ${loggedInUser.full_name}`);
    try {
      const res = await fetch(`/api/disputes?userId=${loggedInUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
        if (data.disputes && data.disputes.length > 0) {
          handleSelectDispute(data.disputes[0].id);
        }
      }
    } catch {
      // ignore
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const tabs = [
    {
      id: "forensic",
      label: "Lens Evidence Miner",
      sublabel: "The WOW Factor",
      icon: Sparkles,
      color: "#1A73E8",
      bgActive: "#E8F0FE",
    },
    {
      id: "calculator",
      label: "Statutory Calculator",
      sublabel: "Wear & Tear Engine",
      icon: Scale,
      color: "#137333",
      bgActive: "#E6F4EA",
    },
    {
      id: "timeline",
      label: "Timeline & Gaps",
      sublabel: "Audit Trail",
      icon: Clock,
      color: "#B06000",
      bgActive: "#FEF7E0",
    },
    {
      id: "dossier",
      label: "Tribunal Dossier",
      sublabel: "PDF Export",
      icon: FileText,
      color: "#C5221F",
      bgActive: "#FCE8E6",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-[#202124] flex flex-col selection:bg-[#1A73E8] selection:text-white">
      {/* Toast Notification — Google Material Snackbar style */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-[#202124] text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-2.5 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-[#8AB4F8]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        onLoadDemo={handleLoadDemo}
        onOpenUpload={() => setIsUploadOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          setUser(null);
          showToast("Signed out");
        }}
        disputes={disputes}
        currentDisputeId={currentDisputeId}
        onSelectDispute={handleSelectDispute}
        onNewDispute={handleNewDispute}
        syncStatus={syncStatus}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onLoadDemo={handleLoadDemo}
          onOpenUpload={() => setIsUploadOpen(true)}
          currentCase={currentCase}
          onScrollToForensics={() => scrollToSection("forensic-miner")}
        />

        {/* Google Workspace View Switcher — Card-style tab selectors */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-white border-[#DADCE0] shadow-sm"
                      : "bg-white border-[#E0E2E7] hover:bg-[#F8FAFD] hover:border-[#C5C7CA]"
                  }`}
                >
                  {/* Colored top bar indicator */}
                  <div
                    className={`absolute top-0 left-4 right-4 h-0.5 rounded-full transition-all ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-30"
                    }`}
                    style={{ backgroundColor: tab.color }}
                  />

                  <div
                    className={`p-2 rounded-xl transition-colors ${
                      isActive ? "" : "bg-[#F1F3F4]"
                    }`}
                    style={isActive ? { backgroundColor: tab.bgActive } : {}}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: isActive ? tab.color : "#5F6368" }}
                    />
                  </div>

                  <div>
                    <span
                      className={`text-xs font-bold block leading-tight ${
                        isActive ? "text-[#202124]" : "text-[#3C4043]"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span className="text-[11px] text-[#80868B] block mt-0.5">{tab.sublabel}</span>
                  </div>

                  {isActive && (
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5"
                      style={{ backgroundColor: tab.bgActive, color: tab.color }}
                    >
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section Content */}
          <div className="space-y-8">
            {activeTab === "forensic" && (
              <ForensicMiner evidenceList={currentCase.evidence} />
            )}

            {activeTab === "calculator" && (
              <WearAndTearCalculator
                rebuttalItems={currentCase.rebuttals}
                onOpenDossier={() => setActiveTab("dossier")}
              />
            )}

            {activeTab === "timeline" && (
              <TimelineView
                events={currentCase.timeline}
                onSelectEvidence={(evId) => {
                  setActiveTab("forensic");
                  setTimeout(() => scrollToSection("forensic-miner"), 50);
                }}
              />
            )}

            {activeTab === "dossier" && (
              <DossierExport disputeCase={currentCase} />
            )}
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
        currentCase={currentCase}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer — Google Product Footer style */}
      <footer className="mt-16 border-t border-[#E0E2E7] bg-white py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#F8FAFD] border border-[#DADCE0]">
                <div className="grid grid-cols-2 gap-1 p-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1A73E8]" />
                  <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                  <span className="w-2 h-2 rounded-full bg-[#FBBC04]" />
                  <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                </div>
              </div>
              <div>
                <span className="font-bold text-sm text-[#202124]">BondBack</span>
                <p className="text-[11px] text-[#5F6368]">
                  Lyra × Product Counsel Hackathon • Supabase Connected
                </p>
              </div>
            </div>

            {/* Compliance Chips */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {[
                "Supabase PostgreSQL (Sydney)",
                "ATO TR 2022/1 Compliant",
                "Residential Tenancies Act 2010 § 51(2)",
                "Electronic Transactions Act 2000 § 8",
                "NCAT / VCAT Tribunal Ready",
              ].map((label) => (
                <span
                  key={label}
                  className="px-2.5 py-1 rounded-full bg-[#F1F3F4] text-[#5F6368] border border-[#E0E2E7] font-medium"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="text-right text-[11px] text-[#80868B]">
              <span className="block font-medium">Built for Lyra × Product Counsel 2025</span>
              <span className="block">AI Legal-Tech for Rental Tenants</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

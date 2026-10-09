"use client";

import React, { useState } from "react";
import { X, Shield, Sparkles, Check, ArrowRight, User, Mail, Database } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { id: string; email: string; full_name: string; avatar_url?: string }) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("sarah.jenkins@example.com");
  const [fullName, setFullName] = useState("Sarah Jenkins");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (customEmail?: string, customName?: string) => {
    setLoading(true);
    setError(null);

    const targetEmail = customEmail || email;
    const targetName = customName || fullName;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, fullName: targetName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Could not sign in to Supabase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#DADCE0] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo & Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#F8FAFD] border border-[#DADCE0]">
            <div className="grid grid-cols-2 gap-1 p-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#202124] tracking-tight">Sign in to BondBack</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#34A853]" />
              <span className="text-[11px] text-[#5F6368]">Supabase Cloud Connected</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-[#FCE8E6] border border-[#FAD2CF] text-[#C5221F] text-xs">
            {error}
          </div>
        )}

        {/* 1-Click Fast Demo Login Button */}
        <button
          type="button"
          onClick={() => handleLogin("sarah.jenkins@example.com", "Sarah Jenkins")}
          disabled={loading}
          className="w-full mb-4 p-3.5 rounded-2xl border-2 border-[#1A73E8] bg-[#E8F0FE] hover:bg-[#D2E3FC] text-[#1A73E8] font-semibold text-xs transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-left">
            <Sparkles className="w-4 h-4 text-[#1A73E8]" />
            <div>
              <span className="block font-bold text-[#1A73E8]">1-Click Demo Login (Sarah Jenkins)</span>
              <span className="block text-[11px] text-[#5F6368] font-normal">Pre-loaded case with $1,480 tribunal savings</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E0E2E7]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-[#80868B] text-[10px] font-semibold tracking-wider">
              Or sign in with email
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-3.5"
        >
          <div>
            <label className="block text-[11px] font-bold text-[#3C4043] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#80868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full rounded-2xl bg-[#F8FAFD] border border-[#DADCE0] pl-10 pr-4 py-2.5 text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#3C4043] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#80868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenant@example.com"
                className="w-full rounded-2xl bg-[#F8FAFD] border border-[#DADCE0] pl-10 pr-4 py-2.5 text-xs text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1A73E8] focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-full text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating with Supabase...</span>
            ) : (
              <>
                <span>Continue to BondBack</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="mt-5 pt-4 border-t border-[#E0E2E7] flex items-center justify-center gap-1.5 text-[11px] text-[#5F6368]">
          <Database className="w-3.5 h-3.5 text-[#137333]" />
          <span>Encrypted PostgreSQL storage on Supabase Sydney (ap-southeast-2)</span>
        </div>
      </div>
    </div>
  );
}

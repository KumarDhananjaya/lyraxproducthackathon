import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BondBack — Rental Bond Dispute & Forensic Evidence-Mining Engine",
  description:
    "AI-powered rental bond dispute and forensic evidence-mining engine for tenants facing unfair deductions. Compliant with ATO TR 2022/1 and Residential Tenancies statutory wear-and-tear rules.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#F8FAFD] text-[#202124] font-sans selection:bg-[#1A73E8] selection:text-white">
        {children}
      </body>
    </html>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Scale } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Logo from "@/components/Logo";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold text-blue-800">
            <Scale className="h-3.5 w-3.5 text-blue-600" />
            Legal & Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Effective Date: September 2026 • Agreement governing use of MediVault Platform
          </p>
        </div>

        {/* Section 1: Acceptance */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-teal-600" /> 1. Acceptance of Terms
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            By creating an account, accessing, or using the <strong>MediVault</strong> web application and associated services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not access or use the platform.
          </p>
        </section>

        {/* Section 2: Clinical Disclaimer */}
        <section className="space-y-3 p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
          <h2 className="text-lg font-bold text-amber-950 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-700" /> 2. Medical & Emergency Disclaimer
          </h2>
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>MediVault is a digital medical data exchange and records management infrastructure, NOT an emergency medical service provider.</strong> In the event of a medical emergency, call your local emergency services (e.g. 911 / 112 / 108) or proceed immediately to the nearest hospital emergency room.
          </p>
        </section>

        {/* Section 3: User Roles & Responsibilities */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-600" /> 3. Stakeholder Obligations
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <strong className="text-slate-800">Patients:</strong> You are responsible for safeguarding your credentials, verifying practitioner identity prior to granting OTP access, and ensuring accurate medical history inputs.
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <strong className="text-slate-800">Doctors & Clinicians:</strong> You warrant that you hold valid, unrevoked medical licensure and will only access patient files with informed consent for legitimate diagnostic and therapeutic purposes.
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <strong className="text-slate-800">Diagnostic Labs & Pharmacies:</strong> You warrant regulatory compliance, drug dispensing accuracy, and authentic validation of laboratory results published to patient vaults.
            </div>
          </div>
        </section>

        {/* Section 4: Termination */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" /> 4. Security & Account Termination
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            MediVault reserves the right to suspend or terminate accounts that violate medical ethics, attempt unauthorized penetration, forge prescriptions, or misuse the health data exchange.
          </p>
        </section>
      </main>
    </div>
  );
}

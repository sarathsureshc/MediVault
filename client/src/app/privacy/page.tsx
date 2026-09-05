"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Database, Eye, Cookie, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Logo from "@/components/Logo";

export default function PrivacyPolicyPage() {
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
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold text-teal-800">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            Healthcare Privacy Standard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            MediVault Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Last updated: September 2026 • Compliant with HIPAA, GDPR & Digital Health Data Standards
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-teal-600" /> 1. Privacy & Consent Framework
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            At <strong>MediVault</strong>, your Protected Health Information (PHI) and clinical data privacy are our highest priority. We operate on a strict <em>zero-unauthorized-access</em> model. Your medical records, prescriptions, and test results are only made accessible to verified healthcare professionals through explicit, two-factor OTP consent verified in real-time.
          </p>
        </section>

        {/* Section 2: Data We Collect */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Database className="h-5 w-5 text-teal-600" /> 2. Information We Collect and Process
          </h2>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5 leading-relaxed">
            <li><strong>Patient Identity Data:</strong> Full name, verified email, phone number, date of birth, gender, and unique Health Passport ID.</li>
            <li><strong>Medical Profile:</strong> Allergies, chronic diseases, past surgeries, and clinical consultation records.</li>
            <li><strong>Practitioner Credentials:</strong> Medical registration numbers, licensing IDs, clinic affiliations, and qualifications for doctors, laboratories, and pharmacies.</li>
            <li><strong>Session & Security Data:</strong> Cryptographic token hashes, timestamped audit logs of record accesses, and OTP transaction markers.</li>
          </ul>
        </section>

        {/* Section 3: Cookies & Session Storage Permissions */}
        <section className="space-y-3 p-5 rounded-2xl bg-teal-50/50 border border-teal-200">
          <h2 className="text-lg font-bold text-teal-950 flex items-center gap-2">
            <Cookie className="h-5 w-5 text-teal-700" /> 3. Cookies, Session Storage & Permissions
          </h2>
          <p className="text-sm text-teal-900 leading-relaxed">
            MediVault uses essential, privacy-first session mechanisms:
          </p>
          <ul className="list-disc pl-5 text-xs text-teal-800 space-y-1.5 leading-relaxed">
            <li><strong>HTTP-Only Refresh Cookies:</strong> Used exclusively for maintaining encrypted user authentication sessions. These cookies are marked <code>HttpOnly</code>, <code>Secure</code> (TLS/HTTPS), and <code>SameSite=Strict</code> to prevent Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF).</li>
            <li><strong>Local Storage:</strong> Stores short-lived JSON Web Tokens (JWT) and user display preferences strictly needed for UI navigation. We never store raw passwords or unencrypted medical payloads in browser storage.</li>
            <li><strong>No Tracking / No Third-Party Ads:</strong> MediVault does not use third-party tracking pixels, advertising cookies, or data-broker trackers.</li>
          </ul>
        </section>

        {/* Section 4: Data Sharing & Third Parties */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-teal-600" /> 4. How Health Data is Shared
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We will <strong>never</strong> sell, rent, or commercialize your personal or medical data. Data is only accessible across authorized clinical channels:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1 leading-relaxed">
            <li><strong>Doctors & Specialists:</strong> Only when you grant OTP access via QR scanning.</li>
            <li><strong>Diagnostic Labs:</strong> Only to publish authorized test results to your digital vault.</li>
            <li><strong>Pharmacies:</strong> Only to fulfill verified active prescriptions.</li>
          </ul>
        </section>

        {/* Section 5: Rights */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-teal-600" /> 5. Your Rights & Data Portability
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Under healthcare data protection regulations, you retain full ownership of your records. You have the right to inspect your profile, export your history, revoke practitioner access, and request account deletion at any time by contacting <a href="mailto:privacy@medivault.com" className="text-teal-600 font-semibold underline">privacy@medivault.com</a>.
          </p>
        </section>
      </main>
    </div>
  );
}

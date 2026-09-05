"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowLeft, Send, CheckCircle2, ShieldCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import Logo from "@/components/Logo";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full text-xs font-bold text-teal-800">
            <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
            MediVault Support Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Have questions about clinical integrations, security protocols, or account support? Our team is here to assist.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Left Column: Contact Cards */}
          <div className="md:col-span-5 space-y-4">
            <Card className="border border-slate-200/90 shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">General Support</strong>
                    <a href="mailto:support@medivault.com" className="text-xs text-teal-600 hover:underline">
                      support@medivault.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">Security & Compliance</strong>
                    <a href="mailto:security@medivault.com" className="text-xs text-blue-600 hover:underline">
                      security@medivault.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">Clinical Hotline</strong>
                    <span className="text-xs text-slate-600">+1 (800) 555-VAULT (8285)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs space-y-1 text-teal-900">
              <strong className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-600" /> HIPAA Security Response
              </strong>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                For urgent security vulnerability disclosures, our Cyber Security Incident Response Team monitors 24/7.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="md:col-span-7">
            <Card className="border border-slate-200/90 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900">Send an Inquiry</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Fill out the form below and we will respond within 1 business day.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {submitted ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Message Received</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Thank you for contacting MediVault support. An inquiry ticket has been opened.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)} className="text-xs">
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      label="Your Name *"
                      placeholder="e.g. Dr. Jane Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      label="Email Address *"
                      type="email"
                      placeholder="name@organization.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      label="Subject *"
                      placeholder="e.g. Clinical API integration / Security question"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                        Message / Details *
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Provide details about your query..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
                      />
                    </div>
                    <Button type="submit" variant="gradient" className="w-full flex items-center justify-center gap-1.5">
                      <Send className="h-4 w-4" /> Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

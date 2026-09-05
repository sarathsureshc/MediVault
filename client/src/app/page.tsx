"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Activity,
  FileText,
  Pill,
  CheckCircle2,
  Lock,
  Zap,
} from "lucide-react";
import Logo from "@/components/Logo";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-teal-100 dark:selection:bg-teal-900">
      <Navbar />

      <main className="flex flex-col items-center overflow-hidden">
        {/* Hero Section */}
        <section className="relative w-full pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center max-w-7xl mx-auto">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-teal-50/50 to-transparent dark:from-teal-950/20 dark:to-transparent -z-10 blur-3xl" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full blur-3xl -z-10" />
          <div className="absolute top-40 left-0 w-72 h-72 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl -z-10" />

          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-300 mb-8 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-teal-500 mr-2 animate-pulse"></span>
              Secure Healthcare Ecosystem
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-200 dark:to-zinc-400"
            >
              Your Health Data, <br />
              <span className="text-teal-600 dark:text-teal-400">
                Secure & Accessible.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10 leading-relaxed"
            >
              MediVault unifies Patients, Doctors, Labs, and Pharmacies in one
              secure platform. Experience the future of medical history
              management.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-teal-600 rounded-full hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-500/25 hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 hover:border-zinc-300 dark:text-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-all"
              >
                Log in
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats / Trust Section */}
        <section className="w-full py-12 border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Active Patients", value: "10k+" },
                { label: "Verified Doctors", value: "500+" },
                { label: "Lab Reports", value: "50k+" },
                { label: "Secure Transactions", value: "100%" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features / Roles Section */}
        <section
          id="features"
          className="w-full py-24 px-4 sm:px-6 lg:px-8 relative"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Designed for Everyone
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                A comprehensive ecosystem connecting every stakeholder in the
                healthcare journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Patients",
                  icon: Shield,
                  desc: "Securely store history. Grant OTP-based access.",
                  color: "blue",
                },
                {
                  title: "Doctors",
                  icon: Activity,
                  desc: "Instant access to records with patient consent.",
                  color: "emerald",
                },
                {
                  title: "Labs",
                  icon: FileText,
                  desc: "Upload test reports directly to digital profiles.",
                  color: "violet",
                },
                {
                  title: "Pharmacies",
                  icon: Pill,
                  desc: "Verify prescriptions and dispense accurately.",
                  color: "rose",
                },
              ].map((role, index) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-xl hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-300 group"
                >
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 bg-${role.color}-50 dark:bg-${role.color}-900/20`}
                  >
                    <role.icon
                      className={`h-7 w-7 text-${role.color}-600 dark:text-${role.color}-400`}
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">
                    {role.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm">
                    {role.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section
          id="how-it-works"
          className="w-full py-24 bg-zinc-900 text-white overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                  Why Choose MediVault?
                </h2>
                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                  We prioritize security, privacy, and ease of use. Your health
                  data belongs to you, and we make sure it stays that way while
                  being accessible when you need it most.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: Lock,
                      title: "Bank-Grade Security",
                      desc: "End-to-end encryption for all medical records.",
                    },
                    {
                      icon: Zap,
                      title: "Instant Access",
                      desc: "Retrieve your history in seconds, anywhere.",
                    },
                    {
                      icon: CheckCircle2,
                      title: "HIPAA Compliant",
                      desc: "Built adhering to global healthcare standards.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                          <item.icon className="h-6 w-6 text-teal-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="text-zinc-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 p-1">
                  <div className="h-full w-full rounded-[22px] bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]" />
                    <Shield className="h-32 w-32 text-teal-500 opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-white mb-2">
                          100%
                        </div>
                        <div className="text-teal-400 font-medium tracking-widest uppercase text-sm">
                          Secure
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-12 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Logo />
            </div>
            <p className="text-zinc-500 dark:text-zinc-500 text-sm">
              © {new Date().getFullYear()} MediVault. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-zinc-500 hover:text-teal-600 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-zinc-500 hover:text-teal-600 text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-zinc-500 hover:text-teal-600 text-sm transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

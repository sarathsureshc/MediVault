import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ServerStatusProvider } from "@/context/ServerStatusContext";
import ServerWakeupBanner from "@/components/ServerWakeupBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediVault - Your Health Data, Secure & Accessible",
  description:
    "Secure medical history management platform connecting Patients, Doctors, Labs, and Pharmacies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServerStatusProvider>
          <ServerWakeupBanner />
          <AuthProvider>{children}</AuthProvider>
        </ServerStatusProvider>
      </body>
    </html>
  );
}

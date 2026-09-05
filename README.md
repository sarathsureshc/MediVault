# MediVault — Secure Unified Healthcare Records Ecosystem

**MediVault** is a full-stack, enterprise-grade healthcare data exchange platform connecting **Patients**, **Doctors**, **Diagnostic Laboratories**, and **Pharmacies** under a zero-trust, consent-driven architecture.

---

## 🔑 Demo Login Credentials

For instant testing and evaluation, pre-seeded accounts are provided with realistic clinical data:

| Role | Email | Password | Preloaded Sample Clinical Data |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@medivault.com` | `password123` | Patient ID: `PAT-DEMO-001`<br>• Allergies: Penicillin, Peanuts<br>• Chronic: Mild Asthma<br>• Surgeries: Appendectomy (2021)<br>• Active Prescriptions & Lab Reports |
| **Doctor** | `doctor@medivault.com` | `password123` | Dr. Sarah Mitchell (Cardiology & Internal Medicine)<br>• Metro Health Medical Center<br>• Active availability schedule & consulting slots |
| **Diagnostic Lab** | `lab@medivault.com` | `password123` | Apex Diagnostic Laboratory<br>• License: `LAB-REG-98421`<br>• Upload history & PDF report management |
| **Pharmacy** | `pharmacy@medivault.com` | `password123` | MediCare Central Pharmacy<br>• License: `DL-PHM-77124`<br>• Prescription fulfillment & billing calculator |
| **Admin** | `admin@medivault.com` | `admin123` | Platform Administrator |

> 💡 **Tip:** You can also use the **⚡ Quick 1-Click Demo Logins** bar at the bottom of the [Login Page (`/login`)](http://localhost:3000/login) to autofill any role credentials with a single click!

---

## 🚀 Quick Setup & Seeding

### 1. Backend Server Setup
```bash
cd server
npm install
```

#### Seed Demo Profiles & Clinical Data
To populate the database with all demo profiles, appointments, prescriptions, and lab tests:
```bash
npm run seed:demo
```

#### Run the Backend Dev Server
```bash
npm run dev
# Running on http://localhost:5000 (API at http://localhost:5000/api/v1)
```

---

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
# Running on http://localhost:3000
```

---

## 🌟 Core Features & Workflows

### 1. Patient Portal
- **Digital Health Passport (QR)**: Unique Health Passport QR Code (`PAT-...`) with one-click copy and holographic card view.
- **Appointment Scheduling**: Real-time slot booking across verified specialists with built-in 256-bit encrypted checkout.
- **Medical History & Regimens**: Track allergies, chronic illnesses, active prescriptions, and completed laboratory PDF results.

### 2. Doctor Portal
- **QR / OTP Patient Authentication**: Scan patient QR code via live camera or enter ID $\rightarrow$ triggers OTP verification before unlocking patient medical files.
- **Clinical Consultation Suite**: Record diagnoses, generate multi-item medication regimens with dosage/duration, and recommend diagnostic tests.
- **Availability Scheduler**: Configure consultation days, session durations (15m–60m), and bookable time slots.

### 3. Diagnostic Laboratory Portal
- **Validated Report Publishing**: Directly publish test results, numeric values, technician observations, and external PDF report attachments to verified patient vaults.
- **Upload History**: Audit trail of all issued diagnostic reports.

### 4. Pharmacy & Dispensing Portal
- **Prescription Lookup**: Enter Patient ID to instantly retrieve active doctor-prescribed medications.
- **Interactive Dispensing Cart**: Adjust quantities, set unit prices, and auto-calculate invoice totals.
- **Billing & History**: Issue digital receipts and maintain financial dispense records.

---

## 🛡️ Security & Privacy Architecture

- **HIPAA & GDPR Standards**: Strict consent verification before granting clinician access to medical history.
- **Dual-Token Authentication**: JWT Access Token (short-lived) + `HttpOnly`, `SameSite=Strict`, `Secure` Refresh Token cookies.
- **Cryptographic OTPs**: 6-digit one-time consent codes salted and hashed with `bcryptjs`, valid for 5 minutes and deleted upon single use.
- **Role-Based Access Control (RBAC)**: Server-side middleware guards (`protect`, `restrictTo`) strictly enforcing role permissions.
- **HTTP Security**: `helmet()` headers, CORS origin whitelisting, and Zod input validation schemas.

---

## 📂 Project Structure

```text
MediVault/
├── client/                     # Next.js 16 (App Router) + TailwindCSS
│   ├── src/
│   │   ├── app/                # App routes (/dashboard, /login, /register, /privacy, /terms, etc.)
│   │   ├── components/         # UI components (Button, Card, Input, Sidebar, Navbar, Modals)
│   │   ├── context/            # AuthContext (state & session management)
│   │   └── lib/                # Axios API instance with auto-refresh interceptors
│   └── package.json
│
├── server/                     # Node.js + Express 5 + TypeScript + MongoDB (Mongoose)
│   ├── src/
│   │   ├── controllers/        # Business logic (auth, patient, doctor, lab, pharmacy, appointment)
│   │   ├── models/             # Mongoose schemas (User, Patient, Doctor, Lab, Pharmacy, etc.)
│   │   ├── routes/             # Express API endpoints (/api/v1/...)
│   │   ├── middlewares/        # Auth (JWT/RBAC), Error Handler, Zod Validation
│   │   ├── scripts/            # Seeders (seedDemoData.ts, seedAdmin.ts)
│   │   └── server.ts           # Server bootstrap & Google DNS resolver
│   └── package.json
└── README.md
```

---

## 📄 License & Compliance

© 2026 MediVault Ecosystem. All rights reserved. Built adhering to global digital healthcare and data protection standards.

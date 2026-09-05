import mongoose from "mongoose";
import dns from "dns";
import dotenv from "dotenv";

dotenv.config();

// Configure Google Public DNS
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  if (typeof (dns as any).setDefaultResultOrder === "function") {
    (dns as any).setDefaultResultOrder("ipv4first");
  }
} catch (err) {
  console.warn("DNS setup:", err);
}

import { config } from "../config";
import { User } from "../models/User";
import { Patient } from "../models/Patient";
import { Doctor } from "../models/Doctor";
import { Lab } from "../models/Lab";
import { Pharmacy } from "../models/Pharmacy";
import { DoctorAvailability } from "../models/DoctorAvailability";
import { Appointment } from "../models/Appointment";
import { Consultation } from "../models/Consultation";
import { TestResult } from "../models/TestResult";
import { MedicineIssue } from "../models/MedicineIssue";
import { Notification } from "../models/Notification";

const seedDemoData = async () => {
  try {
    console.log("Connecting to MongoDB for demo seeding...");
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB successfully.");

    // 1. Create or update Demo Admin
    const adminEmail = "admin@medivault.com";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        email: adminEmail,
        password: "admin123",
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Admin Demo Account created (admin@medivault.com / admin123)");
    } else {
      console.log("ℹ️ Admin account already exists.");
    }

    // 2. Create or update Demo Patient
    const patientEmail = "patient@medivault.com";
    let patientUser = await User.findOne({ email: patientEmail });
    let patientProfile;
    if (!patientUser) {
      patientUser = await User.create({
        email: patientEmail,
        password: "password123",
        role: "patient",
        isVerified: true,
      });
      patientProfile = await Patient.create({
        user: patientUser._id,
        fullName: "Alex Johnson",
        patientID: "PAT-DEMO-001",
        qrCodeData: "PAT-DEMO-001",
        age: 32,
        gender: "male",
        bloodGroup: "O+",
        phone: "+1 (555) 234-5678",
        address: "452 Pine Valley Road, Suite 4B",
        dateOfBirth: new Date("1994-05-14"),
        medicalHistory: {
          allergies: ["Penicillin", "Peanuts"],
          chronicDiseases: ["Mild Asthma"],
          pastSurgeries: ["Appendectomy (2021)"],
        },
      });
      console.log("✅ Patient Demo Account created (patient@medivault.com / password123)");
    } else {
      patientProfile = await Patient.findOne({ user: patientUser._id });
      console.log("ℹ️ Patient demo account exists.");
    }

    // 3. Create or update Demo Doctor
    const doctorEmail = "doctor@medivault.com";
    let doctorUser = await User.findOne({ email: doctorEmail });
    let doctorProfile;
    if (!doctorUser) {
      doctorUser = await User.create({
        email: doctorEmail,
        password: "password123",
        role: "doctor",
        isVerified: true,
      });
      doctorProfile = await Doctor.create({
        user: doctorUser._id,
        fullName: "Dr. Sarah Mitchell",
        specialization: "Cardiology & Internal Medicine",
        qualification: "MD, FACC, Harvard Medical",
        hospitalClinicName: "Metro Health Medical Center",
        consultationFee: 500,
        phone: "+1 (555) 876-5432",
        address: "100 Medical Center Way, Suite 305",
      });
      console.log("✅ Doctor Demo Account created (doctor@medivault.com / password123)");
    } else {
      doctorProfile = await Doctor.findOne({ user: doctorUser._id });
      console.log("ℹ️ Doctor demo account exists.");
    }

    // 4. Create or update Demo Lab
    const labEmail = "lab@medivault.com";
    let labUser = await User.findOne({ email: labEmail });
    let labProfile;
    if (!labUser) {
      labUser = await User.create({
        email: labEmail,
        password: "password123",
        role: "lab",
        isVerified: true,
      });
      labProfile = await Lab.create({
        user: labUser._id,
        labName: "Apex Diagnostic Laboratory",
        licenseNumber: "LAB-REG-98421",
        phone: "+1 (555) 345-6789",
        address: "742 Healthcare Blvd, Floor 2",
      });
      console.log("✅ Lab Demo Account created (lab@medivault.com / password123)");
    } else {
      labProfile = await Lab.findOne({ user: labUser._id });
      console.log("ℹ️ Lab demo account exists.");
    }

    // 5. Create or update Demo Pharmacy
    const pharmacyEmail = "pharmacy@medivault.com";
    let pharmacyUser = await User.findOne({ email: pharmacyEmail });
    let pharmacyProfile;
    if (!pharmacyUser) {
      pharmacyUser = await User.create({
        email: pharmacyEmail,
        password: "password123",
        role: "pharmacy",
        isVerified: true,
      });
      pharmacyProfile = await Pharmacy.create({
        user: pharmacyUser._id,
        pharmacyName: "MediCare Central Pharmacy",
        licenseNumber: "DL-PHM-77124",
        phone: "+1 (555) 987-1234",
        address: "101 Wellness Ave, Ground Floor",
      });
      console.log("✅ Pharmacy Demo Account created (pharmacy@medivault.com / password123)");
    } else {
      pharmacyProfile = await Pharmacy.findOne({ user: pharmacyUser._id });
      console.log("ℹ️ Pharmacy demo account exists.");
    }

    // 6. Create Doctor Availability for Upcoming Days
    if (doctorProfile) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingAvail = await DoctorAvailability.findOne({
        doctor: doctorProfile._id,
        date: today,
      });

      if (!existingAvail) {
        await DoctorAvailability.create({
          doctor: doctorProfile._id,
          date: today,
          timeSlots: [
            { time: "09:00 AM", duration: 30, isBooked: true },
            { time: "10:00 AM", duration: 30, isBooked: false },
            { time: "11:00 AM", duration: 30, isBooked: false },
            { time: "02:00 PM", duration: 30, isBooked: false },
            { time: "03:30 PM", duration: 30, isBooked: false },
          ],
        });
        console.log("✅ Doctor demo schedule & slots created.");
      }
    }

    // 7. Create Sample Clinical Transactions (Appointment, Consultation, Lab Result, Pharmacy Dispense)
    if (patientProfile && doctorProfile) {
      const existingApt = await Appointment.findOne({
        patient: patientProfile._id,
        doctor: doctorProfile._id,
      });

      if (!existingApt) {
        const aptDate = new Date();
        aptDate.setHours(0, 0, 0, 0);

        const appointment = await Appointment.create({
          doctor: doctorProfile._id,
          patient: patientProfile._id,
          date: aptDate,
          timeSlot: "09:00 AM",
          consultationType: "new",
          amount: 500,
          reason: "Routine cardiovascular checkup & seasonal allergy review",
          status: "confirmed",
          paymentStatus: "paid",
        });

        // Consultation record
        await Consultation.create({
          doctor: doctorProfile._id,
          patient: patientProfile._id,
          diagnosis: "Seasonal Allergic Bronchitis with Mild Asthma Flare",
          notes: "Patient advised to avoid known allergens. Keep inhaler on hand. Review in 2 weeks.",
          prescription: [
            { medicine: "Salbutamol Inhaler 100mcg", dosage: "2 puffs as needed", duration: "30 days" },
            { medicine: "Cetirizine 10mg", dosage: "1 tablet at night", duration: "10 days" },
            { medicine: "Montelukast 10mg", dosage: "1 tablet daily", duration: "14 days" },
          ],
          recommendedTests: ["Complete Blood Count (CBC)", "Peak Flow Spirometry"],
        });

        // Diagnostic Test Result from Lab
        if (labProfile) {
          await TestResult.create({
            lab: labProfile._id,
            patient: patientProfile._id,
            doctor: doctorProfile._id,
            testName: "Complete Blood Count (CBC)",
            resultValue: "Hemoglobin: 14.8 g/dL, Total WBC: 7,200 /mcL (Within Normal Limits)",
            reportUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            comments: "Normal hematological panel. Eosinophil count slightly elevated consistent with allergic response.",
          });
        }

        // Pharmacy Dispense Record
        if (pharmacyProfile) {
          await MedicineIssue.create({
            pharmacy: pharmacyProfile._id,
            patient: patientProfile._id,
            doctor: doctorProfile._id,
            medicines: [
              { name: "Salbutamol Inhaler 100mcg", quantity: 1, price: 180 },
              { name: "Cetirizine 10mg (10 tabs)", quantity: 1, price: 65 },
              { name: "Montelukast 10mg (14 tabs)", quantity: 1, price: 140 },
            ],
            totalAmount: 385,
            billUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          });
        }

        // Sample notifications
        await Notification.create({
          user: patientUser!._id,
          message: "Welcome to MediVault! Your demo digital health record is fully initialized.",
          type: "booking",
          isRead: false,
        });

        console.log("✅ Sample consultation, lab report, prescription, and pharmacy bill seeded.");
      }
    }

    console.log("\n=======================================================");
    console.log("🎉 ALL DEMO PROFILES & SAMPLE DATA SUCCESSFULLY READY!");
    console.log("=======================================================");
    console.log("Role        | Email                  | Password");
    console.log("-------------------------------------------------------");
    console.log("Patient     | patient@medivault.com  | password123");
    console.log("Doctor      | doctor@medivault.com   | password123");
    console.log("Lab         | lab@medivault.com      | password123");
    console.log("Pharmacy    | pharmacy@medivault.com | password123");
    console.log("Admin       | admin@medivault.com    | admin123");
    console.log("=======================================================\n");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error during demo seeding:", error);
    process.exit(1);
  }
};

seedDemoData();

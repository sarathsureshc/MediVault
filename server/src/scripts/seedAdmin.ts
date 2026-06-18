import mongoose from "mongoose";
import { User } from "../models/User";
import { config } from "../config";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB for seeding...");

    const adminEmail = "admin@medivault.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin account already exists.");
    } else {
      const admin = await User.create({
        email: adminEmail,
        password: "admin123", // Initial password
        role: "admin",
        isVerified: true,
      });
      console.log("Admin account created successfully!");
      console.log("Email: admin@medivault.com");
      console.log("Password: admin123");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();

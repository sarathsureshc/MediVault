import dns from "dns";

// Configure Google Public DNS (8.8.8.8, 8.8.4.4) for Node.js SRV resolution
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  if (typeof (dns as any).setDefaultResultOrder === "function") {
    (dns as any).setDefaultResultOrder("ipv4first");
  }
} catch (err) {
  console.warn("Failed to set Google DNS servers:", err);
}

import app from "./app";
import mongoose from "mongoose";
import { config } from "./config";

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // Use IPv4, skip trying IPv6
    });
    console.log("Connected to MongoDB successfully");

    app.listen(config.port as number, "0.0.0.0", () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();


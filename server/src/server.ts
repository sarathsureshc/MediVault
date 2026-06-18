import app from "./app";
import mongoose from "mongoose";
import { config } from "./config";
import dns from "dns";

// Set fallback DNS servers (Google and Cloudflare) to resolve Node.js/c-ares SRV lookup issues on Windows
if (config.nodeEnv === "development") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (err) {
    console.warn("Failed to set DNS servers:", err);
  }
}

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("Connected to MongoDB");

    app.listen(config.port as number, "0.0.0.0", () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

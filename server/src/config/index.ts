import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/medivault",
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:3000"],
  jwtSecret: process.env.JWT_SECRET || "supersecretkey",
  jwtAccessExpiration: "15m",
  jwtRefreshExpiration: "7d",
  nodeEnv: process.env.NODE_ENV || "development",
};

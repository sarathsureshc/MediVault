import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";
import patientRoutes from "./routes/patient.routes";
import doctorRoutes from "./routes/doctor.routes";
import consultationRoutes from "./routes/consultation.routes";
import labRoutes from "./routes/lab.routes";
import pharmacyRoutes from "./routes/pharmacy.routes";
import { globalErrorHandler } from "./middlewares/errorHandler";

const app: Application = express();

// CORS Middleware
const allowedOrigins = [
  ...(Array.isArray(config.corsOrigin) ? config.corsOrigin : [config.corsOrigin]),
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://medivaultdashboard.netlify.app",
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith(".netlify.app") ||
      cleanOrigin.includes("localhost") ||
      cleanOrigin.includes("127.0.0.1")
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import appointmentRoutes from "./routes/appointment.routes";
import notificationRoutes from "./routes/notification.routes";
import adminRoutes from "./routes/admin.routes";

// ... imports

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/consultations", consultationRoutes);
app.use("/api/v1/labs", labRoutes);
app.use("/api/v1/pharmacies", pharmacyRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "alive",
    timestamp: new Date().toISOString(),
    service: "MediVault Core Engine",
  });
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MEDIVAULT API",
    version: "1.0.0",
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;

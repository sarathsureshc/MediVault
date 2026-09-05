import { Router } from "express";
import {
  getAdminStats,
  getAllUsers,
  toggleBlockUser,
  toggleVerifyEntity,
} from "../controllers/admin.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = Router();

// Protect all admin routes: require authentication and admin role
router.use(protect, restrictTo("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/:userId/block", toggleBlockUser);
router.patch("/users/:userId/verify-entity", toggleVerifyEntity);

export default router;

import { Router } from "express";
import {
  getNotifications,
  markRead,
  markAllRead,
} from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getNotifications);            
// ✅ FIXED ROUTES
router.patch("/:id/read", authenticate, markRead);
router.patch("/read-all", authenticate, markAllRead);

export default router;

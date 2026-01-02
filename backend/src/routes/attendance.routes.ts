import { Router } from "express";
import {
  getAttendance,
  createAttendance,
  updateAttendance,
} from "../controllers/attendance.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getAttendance);
router.post("/", authenticate, createAttendance);
router.patch("/:id", authenticate, updateAttendance);

export default router;

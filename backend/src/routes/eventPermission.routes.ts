import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware"; //
import {
  applyEvent,
  getAllPermissions,
  updatePermission,
  deletePermission
} from "../controllers/eventPermission.controller"; //

const router = Router();

// GET all permissions for the dashboard
router.get("/", authenticate, getAllPermissions);

// POST new event application
router.post("/", authenticate, applyEvent);

// PATCH update/reschedule/cancel
router.patch("/:id", authenticate, updatePermission);

// DELETE record permanently
router.delete("/:id", authenticate, deletePermission);

export default router;
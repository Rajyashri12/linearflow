import { Router } from "express";
import {
  applyEventPermission,
  getEventPermissions,
  updateEventPermission,
} from "../controllers/approval.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * 🔐 All routes are protected
 * Firebase token must be valid
 */

// ✅ Committee Head → Apply for event permission
router.post(
  "/",
  authenticate,
  applyEventPermission
);

// ✅ Fetch permissions
// Committee Head → own events
// HOD → pending HOD approvals
// Principal → pending principal approvals
router.get(
  "/",
  authenticate,
  getEventPermissions
);

// ✅ Update permission
// HOD → approve / reject
// Principal → approve (collision logic)
// Committee Head → reschedule / cancel
router.patch(
  "/:id",
  authenticate,
  updateEventPermission
);

export default router;

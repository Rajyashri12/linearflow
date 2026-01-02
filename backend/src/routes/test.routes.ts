import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();

router.get(
  "/protected",
  authenticate,
  requireRole(["admin"]),
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

export default router;

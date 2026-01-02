import { Router } from "express";
import {
  getUsers,
  getUserByUid,
} from "../controllers/user.controller";

const router = Router();

// get users (filter by role)
router.get("/", getUsers);

// get user by firebase uid
router.get("/:uid", getUserByUid);

export default router;

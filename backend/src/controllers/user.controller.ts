import { Request, Response } from "express";

// GET ALL USERS (filter by role)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;

    // later → fetch from DB
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// GET USER BY FIREBASE UID
export const getUserByUid = async (
  req: Request,
  res: Response
) => {
  try {
    const { uid } = req.params;

    return res.json({
      uid,
      role: "student",
    });
  } catch (err) {
    return res.status(500).json({ message: "User not found" });
  }
};

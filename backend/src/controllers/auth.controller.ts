import { Request, Response } from "express";

// LOGIN (frontend already authenticates via Firebase)
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { uid, email } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ message: "UID and email required" });
    }

    // frontend already verified Firebase token
    return res.json({
      message: "Login successful",
      uid,
      email,
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
};

// REGISTER USER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { uid, email, role } = req.body;

    if (!uid || !email || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // DB insert will come later (Prisma)
    return res.status(201).json({
      message: "User registered",
      uid,
      email,
      role,
    });
  } catch (err) {
    return res.status(500).json({ message: "Register failed" });
  }
};

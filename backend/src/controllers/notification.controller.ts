import { Request, Response } from "express";
import prisma from "../config/db";

export const getNotifications = async (req: Request, res: Response) => {
  const { toRole } = req.query;

  const notifications = await prisma.notification.findMany({
    where: {
      toRole: String(toRole),
      read: false,
    },
    orderBy: { created_at: "desc" },
  });

  res.json(notifications);
};

export const markRead = async (req: Request, res: Response) => {
  const { id } = req.params; // ❌ NO Number()

  await prisma.notification.update({
    where: { id }, // string id
    data: { read: true },
  });

  res.json({ success: true });
};

export const markAllRead = async (req: Request, res: Response) => {
  const { toRole } = req.query;

  await prisma.notification.updateMany({
    where: {
      toRole: String(toRole),
      read: false,
    },
    data: { read: true },
  });

  res.json({ success: true });
};

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📌 GET ATTENDANCE
export const getAttendance = async (req: Request, res: Response) => {
  const { studentUid, approvalStatus } = req.query;

  const records = await prisma.attendance.findMany({
    where: {
      ...(studentUid && { studentUid: String(studentUid) }),
      ...(approvalStatus && { approvalStatus: String(approvalStatus) }),
    },
    orderBy: { id: "desc" },
  });

  res.json(records);
};

// 📌 CREATE ATTENDANCE
export const createAttendance = async (req: Request, res: Response) => {
  const { studentUid, studentName, eventId, status } = req.body;

  const record = await prisma.attendance.create({
    data: {
      studentUid,
      studentName,
      eventId,
      status,
      approvalStatus: "PENDING_ADMIN",
      adminRemark: null,
    },
  });

  res.json(record);
};

// 📌 UPDATE ATTENDANCE (ADMIN / HOD)
export const updateAttendance = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const updated = await prisma.attendance.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
};

import { api } from "./api";

export const markAttendance = async (
  studentUid: string,
  status: string
) => {
  return api.post("/attendance", {
    studentUid,
    date: new Date().toISOString().split("T")[0],
    status,
    approvalStatus: "PENDING_ADMIN",
  });
};

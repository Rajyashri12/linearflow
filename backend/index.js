import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();

/* ✅ CORS */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/* ✅ Load DB */
const DB_PATH = "db.json";
let db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

/* ✅ Dynamic GET routes */
Object.keys(db).forEach((key) => {
  app.get(`/${key}`, (req, res) => {
    res.json(db[key]);
  });
});

/* ✅ POST: Submit Attendance */
app.post("/attendance", (req, res) => {
  const attendance = req.body;

  if (!attendance || !attendance.userId || !attendance.eventId) {
    return res.status(400).json({ message: "Invalid attendance data" });
  }

  if (!db.attendance) {
    db.attendance = [];
  }

  const alreadyMarked = db.attendance.find(
    (a) =>
      a.userId === attendance.userId &&
      a.eventId === attendance.eventId
  );

  if (alreadyMarked) {
    return res.status(409).json({
      message: "Attendance already marked",
    });
  }

  const newAttendance = {
    ...attendance,
    approvalStatus: "PENDING_ADMIN",
    timestamp: new Date().toISOString(),
  };

  db.attendance.push(newAttendance);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

  res.status(201).json({
    message: "Attendance submitted successfully",
    attendance: newAttendance,
  });
});

/* ✅ PATCH: Admin Approve Attendance (FIX) */
app.patch("/attendance/approve", (req, res) => {
  const { userId, eventId } = req.body;

  if (!userId || !eventId) {
    return res.status(400).json({ message: "Missing identifiers" });
  }

  const record = db.attendance.find(
    (a) => a.userId === userId && a.eventId === eventId
  );

  if (!record) {
    return res.status(404).json({ message: "Attendance not found" });
  }

  record.approvalStatus = "APPROVED_ADMIN";
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

  res.json({
    message: "Attendance approved successfully",
    attendance: record,
  });
});

/* ✅ Health check */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ✅ Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Mock API running on port", PORT);
});

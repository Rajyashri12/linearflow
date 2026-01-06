import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();

/* ✅ CORS: allow Netlify + localhost */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

/* ✅ Load mock database */
const DB_PATH = "db.json";
let db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

/* ✅ Dynamic GET routes (users, events, etc.) */
Object.keys(db).forEach((key) => {
  app.get(`/${key}`, (req, res) => {
    res.json(db[key]);
  });
});

/* ✅ POST: Mark Attendance */
app.post("/attendance", (req, res) => {
  const attendance = req.body;

  if (!attendance || !attendance.userId || !attendance.eventId) {
    return res.status(400).json({
      message: "Invalid attendance data",
    });
  }

  /* ensure attendance array exists */
  if (!db.attendance) {
    db.attendance = [];
  }

  /* prevent duplicate attendance */
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
    timestamp: new Date().toISOString(),
  };

  db.attendance.push(newAttendance);

  /* persist to db.json (mock storage) */
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

  res.status(201).json({
    message: "Attendance submitted successfully",
    attendance: newAttendance,
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

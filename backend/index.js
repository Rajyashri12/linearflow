import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();

/* ✅ CORS FIX */
app.use(
  cors({
    origin: true,        // allows Netlify + localhost
    credentials: true,
  })
);

app.use(express.json());

const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));

Object.keys(db).forEach((key) => {
  app.get(`/${key}`, (req, res) => {
    res.json(db[key]);
  });
});

/* ✅ Health check (optional but useful) */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Mock API running on port", PORT);
});

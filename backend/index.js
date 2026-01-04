import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));

Object.keys(db).forEach((key) => {
  app.get(`/${key}`, (req, res) => {
    res.json(db[key]);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Mock API running on port", PORT);
});

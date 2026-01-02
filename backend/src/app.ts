import express from "express";
import cors from "cors";

import eventRoutes from "./routes/eventPermission.routes";
import attendanceRoutes from "./routes/attendance.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/eventPermissions", eventRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/notifications", notificationRoutes);

export default app;

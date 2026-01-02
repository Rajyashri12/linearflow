import { api } from "./api";

/**
 * Submits a new event request
 * Sets initial status to PENDING_HOD
 */
export const applyEventPermission = (data: any) =>
  api.post("/eventPermissions", {
    ...data,
    status: "PENDING_HOD",
    hodApprovals: [],
    principalStatus: "PENDING",
  });

/**
 * Fetches all event permissions
 * Used by Teacher, HOD, and Principal dashboards to monitor progress
 */
export const getEventPermissions = () => 
  api.get("/eventPermissions");

/**
 * Updates an existing event permission (Approve/Reject)
 */
export const updateEventPermission = (id: string, data: any) =>
  api.patch(`/eventPermissions/${id}`, data);
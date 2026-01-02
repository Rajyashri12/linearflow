import { api } from "./api";

// --- Notification Services ---

/**
 * Fetches only unread notifications for a specific role (e.g., 'HOD' or 'ADMIN').
 * JSON Server uses the query string to filter.
 */
export const getNotificationsByRole = (role: string) => 
  api.get(`/notifications?toRole=${role}&read=false`);

/**
 * Marks a single notification as read by its ID.
 */
export const markNotificationAsRead = (id: string | number) => 
  api.patch(`/notifications/${id}`, { read: true });

/**
 * Creates a new notification in the system.
 * This is called by the Committee Head when rescheduling or cancelling.
 */
export const createNotification = (data: { toRole: string; message: string }) => 
  api.post("/notifications", {
    ...data,
    read: false, // Always defaults to unread
    createdAt: new Date().toISOString() // Useful for sorting by newest
  });
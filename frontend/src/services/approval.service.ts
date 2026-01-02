import { api } from "./api";
import { createNotification } from "./notification.service";

/**
 * HOD Approval Logic
 * 1. Updates the event status.
 * 2. Notifies the Committee Head about the result.
 * 3. (Optional) If approved, notifies the Principal for final sign-off.
 */
export const approveByHOD = async (event: any) => {
  try {
    // 1. Update event status to APPROVED_BY_HOD or similar
    await api.patch(`/eventPermissions/${event.id}`, {
      status: "PENDING_PRINCIPAL", // Moves to the next stage
      hodApprovalDate: new Date().toISOString(),
    });

    // 2. Notify Committee Head
    await createNotification({
      toRole: "COMMITTEE_HEAD",
      message: `HOD Approved: "${event.title}" is now pending Principal approval.`,
    });

    // 3. Notify Principal
    await createNotification({
      toRole: "PRINCIPAL",
      message: `New Request: "${event.title}" requires your final approval.`,
    });
  } catch (error) {
    console.error("HOD Approval failed:", error);
    throw error;
  }
};

/**
 * Principal Final Approval Logic
 */
export const approveByPrincipal = async (event: any) => {
  try {
    await api.patch(`/eventPermissions/${event.id}`, {
      status: "APPROVED", // Final state
      principalStatus: "APPROVED",
      finalApprovalDate: new Date().toISOString(),
    });

    await createNotification({
      toRole: "COMMITTEE_HEAD",
      message: `Final Approval: "${event.title}" has been fully approved!`,
    });
  } catch (error) {
    console.error("Principal Approval failed:", error);
    throw error;
  }
};

/**
 * Rejection Logic (Can be used by HOD or Principal)
 */
export const rejectEvent = async (event: any, reason: string, rejectedByRole: string) => {
  try {
    await api.patch(`/eventPermissions/${event.id}`, {
      status: "REJECTED",
      rejectionReason: reason,
      rejectedBy: rejectedByRole,
    });

    await createNotification({
      toRole: "COMMITTEE_HEAD",
      message: `Event Rejected: "${event.title}" was rejected by ${rejectedByRole}. Reason: ${reason}`,
    });
  } catch (error) {
    console.error("Rejection failed:", error);
    throw error;
  }
};
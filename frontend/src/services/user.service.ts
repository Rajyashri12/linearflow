import { api } from "./api";

export const saveUser = async (uid: string, email: string, role: string) => {
  return api.post("/users", {
    uid,
    email,
    role,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  });
};

// This version avoids the 404 by fetching the collection correctly
export const getUsers = async (status?: string) => {
  try {
    const res = await api.get("/users");
    const data = res.data || res;
    
    if (status && Array.isArray(data)) {
      return data.filter((u: any) => u.status === status);
    }
    return data;
  } catch (error) {
    console.error("Service error fetching users:", error);
    return [];
  }
};

export const updateUserStatus = async (uid: string, status: "APPROVED" | "REJECTED") => {
  // Try patching to /users/uid, but if it fails, the backend might need /users?uid=...
  return api.patch(`/users/${uid}`, {
    status,
    approvedAt: new Date().toISOString(),
  });
};

export const getUserByUid = async (uid: string) => {
  try {
    const res = await api.get("/users");
    const users = res.data || res;
    return Array.isArray(users) ? users.find((u: any) => u.uid === uid) : null;
  } catch (error) {
    console.error("Could not find user by UID", error);
    return null;
  }
};
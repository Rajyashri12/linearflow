import { getAuth } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   AUTH HEADER HELPER
========================= */
const getAuthHeader = async (): Promise<Record<string, string>> => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return {};

  const token = await user.getIdToken(true); // 🔥 force refresh
  return {
    Authorization: `Bearer ${token}`,
  };
};

/* =========================
   API WRAPPER
========================= */
export const api = {
  /* ---------- GET ---------- */
  get: async (path: string) => {
    const headers = await getAuthHeader();

    const res = await fetch(`${API_URL}${path}`, {
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GET ${path} failed: ${text}`);
    }

    return res.json();
  },

  /* ---------- POST ---------- */
  post: async (path: string, data: any) => {
    const headers = await getAuthHeader();

    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`POST ${path} failed: ${text}`);
    }

    return res.json();
  },

  /* ---------- PATCH ---------- */
  patch: async (path: string, data?: any) => {
    const headers = await getAuthHeader();

    const res = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`PATCH ${path} failed: ${text}`);
    }

    return res.json();
  },

  /* ---------- DELETE ---------- */
  delete: async (path: string) => {
    const headers = await getAuthHeader();

    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`DELETE ${path} failed: ${text}`);
    }

    // DELETE often returns 204 No Content
    if (res.status === 204) return true;

    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return res.json();
    }

    return true;
  },
};

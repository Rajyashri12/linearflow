import { useContext } from "react";
import { useAuth } from "../context/AuthContext";

export const useUser = () => {
  const { user, loading } = useAuth();
  return { user, loading };
};

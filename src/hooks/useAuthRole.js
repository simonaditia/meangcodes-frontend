import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";

export function useAuthRole() {
  const { role, isAdmin, isAuthenticated } = useAuth();

  const value = useMemo(() => {
    return {
      role,
      isAdmin,
      isAuthenticated,
    };
  }, [isAdmin, isAuthenticated, role]);

  return value;
}

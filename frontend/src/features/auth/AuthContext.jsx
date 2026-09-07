import { useContext, createContext } from "react";
import { useGetCurrentUser } from "./hooks/useAuth.js";

const AuthContext = createContext(null);
function AuthProvider({ children }) {
  const {
    data: currentUser,
    isLoading,
    isError,
    isSuccess,
  } = useGetCurrentUser();

  const value = { currentUser, isLoading, isError, isSuccess };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
function useAuthContext() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuthContext };

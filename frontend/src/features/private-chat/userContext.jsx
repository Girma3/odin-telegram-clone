import React, { createContext, useContext } from "react";
import { useGetAllUsers } from "./hooks/useUser";
import { useAuthContext } from "../auth/AuthContext";

const UsersContext = createContext(null);

function UsersProvider({ children }) {
  const { currentUser, isSuccess } = useAuthContext();
  const queryEnabled = !!currentUser && isSuccess;

  if (!queryEnabled) return null;
  const {
    data: allUsers,
    isLoading,
    isError,
    isSuccess: isAllUsersSuccess,
  } = useGetAllUsers();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching users</div>;

  const value = {
    users: allUsers?.users || [],
    isLoading,
    isError,
    isSuccess,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

function useUsers() {
  return useContext(UsersContext);
}

export { UsersProvider, useUsers };

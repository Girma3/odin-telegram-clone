import React, { createContext, useContext } from "react";
import { useGetAllUsers } from "./hooks/useUser";
import { useAuthContext } from "../auth/AuthContext";

const UsersContext = createContext(null);

function UsersProvider({ children }) {
  const { currentUser, isSuccess: isAuthSuccess } = useAuthContext();

  // 1. Determine if the query should run
  const queryEnabled = !!currentUser && isAuthSuccess;

  // 2. Pass queryEnabled to your custom hook so it stays conditional internally
  // (Ensure your custom useGetAllUsers hook accepts an options object or passes this along)
  const {
    data: allUsers,
    isLoading,
    isError,
    isSuccess: isAllUsersSuccess,
  } = useGetAllUsers({ enabled: queryEnabled });

  // 3. Keep all conditional returns at the absolute bottom
  if (!queryEnabled) {
    return (
      <UsersContext.Provider
        value={{
          users: [],
          isLoading: false,
          isError: false,
          isSuccess: false,
        }}
      >
        {children}
      </UsersContext.Provider>
    );
  }

  if (isLoading) return <div>Loading users...</div>;
  if (isError) return <div>Error fetching users</div>;

  const value = {
    users: allUsers?.users || [],
    isLoading,
    isError,
    isSuccess: isAllUsersSuccess,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

function useUsers() {
  return useContext(UsersContext);
}

export { UsersProvider, useUsers };

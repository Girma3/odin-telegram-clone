import { useContext } from "react";
import { OnlineUsersContext } from "../OnlineUsersProvider";

function useOnlineUsers() {
  const context = useContext(OnlineUsersContext);
  if (!context) {
    throw new Error(
      "useOnlineUsers must be used within an OnlineUsersProvider",
    );
  }
  return context;
}
export default useOnlineUsers;

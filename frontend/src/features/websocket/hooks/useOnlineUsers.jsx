import { useContext } from "react";
import { OnlineUsersContext } from "../OnlineUsersProvider";

function useOnlineUsers() {
  return useContext(OnlineUsersContext);
}

export default useOnlineUsers;

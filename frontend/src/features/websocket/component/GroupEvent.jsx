import { useState } from "react";
import useWebSocketEvent from "../hooks/useWebsocketEvent";
/**register_group: registerGroupHandler,
  join_group: joinGroupHandler,
  leave_group: leaveGroupHandler,
  group_message: groupMessageHandler, */

function GroupEvent({ groupId, text = "Hello Group" }) {
  if (!groupId) return null;
  const payload = { groupId, text };
  const registerGroupPayload = { groupId };

  useWebSocketEvent("register_group", (registerGroupPayload) => {
    console.log("Received register_group event:", registerGroupPayload);
  });

  useWebSocketEvent("join_group", (registerGroupPayload) => {
    console.log("Received join_group event:", registerGroupPayload);
  });

  useWebSocketEvent("leave_group", (registerGroupPayload) => {
    console.log("Received leave_group event:", registerGroupPayload);
  });

  useWebSocketEvent("group_message", (payload) => {
    console.log("Received group_message event:", payload);
  });

  return (
    <div>
      <button
        onClick={() => {
          // send group message event
          useWebSocketEvent("group_message", payload);
        }}
      >
        Send Group Message
      </button>
    </div>
  );
}

export default GroupEvent;

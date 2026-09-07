import { useState } from "react";
import useWebSocketEvent from "../hooks/useWebsocketEvent";
/**
 *  get_private_room: getPrivateRoomHandler,
  private_message: privateChatHandler,
 */
function PrivateEvent({ roomId, userA, userB, text = "Hello Private" }) {
  const roomPayload = { roomId };
  const messagePayload = { userA, userB, text };
  useWebSocketEvent("get_private_room", (roomPayload) => {
    console.log("Received get_private_room event:", roomPayload);
  });

  useWebSocketEvent("private_message", (messagePayload) => {
    console.log("Received private_message event:", messagePayload);
  });
  console.log(
    "Listening for private events with payload:",
    roomPayload,
    messagePayload,
  );
  return (
    <div>
      <p>Private Event</p>
    </div>
  );
}

export default PrivateEvent;

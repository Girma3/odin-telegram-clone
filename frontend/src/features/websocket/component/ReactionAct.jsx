import { useState } from "react";
import useWebSocketEvent from "../hooks/useWebsocketEvent";

function ReactionAct({ roomType = "private", reaction, roomId, messageId }) {
  const [reaction, setReaction] = useState(null);
  //payload = {messageId, reaction, roomType, roomId}

  const payload = { messageId, reaction, roomType, roomId };
  console.log("Listening for reaction_act events with payload:", payload);
  useWebSocketEvent((payload) => {
    if (payload.roomType === roomType) {
      setReaction(payload.reaction);
    }
  });

  return <div>{reaction}</div>;
}

export default ReactionAct;

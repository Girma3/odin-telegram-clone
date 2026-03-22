import {
  getPrivateRoomHandler,
  privateChatHandler,
} from "./handlers/private-event-handler.js";
import {
  registerGroupHandler,
  joinGroupHandler,
  leaveGroupHandler,
  groupMessageHandler,
} from "./handlers/group-event-handlers.js";
import {
  typingInGroupHandler,
  typingInPrivateRoomHandler,
} from "./handlers/typing-handler.js";
import {
  userOnlineHandler,
  userOfflineHandler,
} from "./handlers/presence-handler.js";
import {
  groupMessageSeenHandler,
  privateMessageSeenHandler,
} from "./handlers/msg-seen-status.handler.js";
import {
  addReactionHandler,
  removeReactionHandler,
} from "./handlers/reaction-handler.js";
import {
  mentionNotificationHandler,
  replyNotificationHandler,
} from "./handlers/notification-handler.js";
const eventMap = {
  //private events
  get_private_room: getPrivateRoomHandler,
  private_message: privateChatHandler,
  // group events
  register_group: registerGroupHandler,
  join_group: joinGroupHandler,
  leave_group: leaveGroupHandler,
  group_message: groupMessageHandler,
  // typing events
  typing_in_group: typingInGroupHandler,
  typing_in_private: typingInPrivateRoomHandler,
  //presence events
  user_online: userOnlineHandler,
  user_offline: userOfflineHandler,
  //msg seen event
  message_seen_private: privateMessageSeenHandler,
  message_seen_group: groupMessageSeenHandler,
  //reaction event
  add_reaction: addReactionHandler,
  remove_reaction: removeReactionHandler,
  //notification event
  mention_notification: mentionNotificationHandler,
  reply_notification: replyNotificationHandler,
};

export { eventMap };

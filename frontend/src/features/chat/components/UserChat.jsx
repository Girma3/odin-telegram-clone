import { Link } from "react-router-dom";
import { useGetProfileByUser } from "../../profile/hooks/useProfile";
import {
  useGetConversation,
  useUnreadCount,
} from "../../private-chat/hooks/useUserChat";

import { useMemo } from "react";
import useOnlineUsers from "../../websocket/hooks/useOnlineUsers";

const STYLES = {
  chatHolder: `
    text-xs text-amber-100 cursor-pointer
    sm:w-full rounded-md bg-white/5 border-2 border-white/10 p-4 shadow-sm
    transition-all duration-300
     hover:shadow-[0_0_6px_rgba(59,130,246,0.6)]
    hover:border-blue-500/50 
  
  `,
  avatar: `
    rounded-full w-10 h-10 shadow-md object-cover ring-3
  `,
  name: `
    sm:text-xs text-[0.5rem] font-semibold text-amber-100
  `,
  message: `
    text-[0.5rem] text-amber-100 word-break
  `,
  notification: `
    flex items-center justify-center
    rounded-full w-4 h-4 bg-green-500 text-black
    text-[0.6rem] font-bold
  `,
};

const MAX_PREVIEW_LENGTH = 20;
const PLACEHOLDER_TEXT = "send message";

function UserChat({ user, currentUser }) {
  if (!user || !currentUser) return null;
  if (user.isDeleted) return null;
  if (user.id === currentUser.id) return null; //user can't chat with self
  const { id: currentUserId } = currentUser;
  const { id, status, username } = user;

  const {
    data: profile,
    isError: isProfileError,
    isLoading: isProfileLoading,
  } = useGetProfileByUser(id);
  const { data: privateChats, isLoading: isPrivateChatLoading } =
    useGetConversation(id);

  //sender is user and receiver is current user
  const unreadMessages = useUnreadCount(currentUserId, id, privateChats, {
    enabled: !!privateChats,
  });
  const { onlineUsers } = useOnlineUsers();
  const isOnline = onlineUsers.includes(id);
  if (isPrivateChatLoading || isProfileLoading) return <div>Loading...</div>;

  const lastMessage = privateChats
    ? privateChats[privateChats?.length - 1]
    : null;
  //
  const previewText = getPreviewText(lastMessage);

  return (
    <li
      className={`${STYLES.chatHolder} animate-slideUp duration-200 ease-in-out`}
    >
      <Link
        to={`/chat/${id}`}
        className="flex justify-between items-center w-full"
        state={{ user: user, profile: profile, privateChats: privateChats }}
      >
        <div className="flex items-center gap-2">
          <img
            src={profile?.avatarUrl}
            alt={`${username}'s profile`}
            loading="lazy"
            className={`${
              STYLES.avatar
            } ${isOnline ? "ring-green-500" : "ring-gray-500"}`}
          />
          <div>
            <p className={STYLES.name}>{username}</p>
            <p className={STYLES.message}>{previewText}</p>
          </div>
        </div>
        {unreadMessages > 0 && (
          <span
            className={STYLES.notification}
            aria-label={`${unreadMessages} unread messages`}
          >
            {unreadMessages}
          </span>
        )}
      </Link>
    </li>
  );
}

function getPreviewText(lastMessage) {
  if (!lastMessage?.text?.trim()) return PLACEHOLDER_TEXT;
  const text = lastMessage.text.trim();
  return text.length > MAX_PREVIEW_LENGTH
    ? `${text.slice(0, MAX_PREVIEW_LENGTH)}...`
    : text;
}

export default UserChat;

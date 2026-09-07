import {
  useLocation,
  useParams,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { IoCheckmarkOutline } from "react-icons/io5";
import { BsCheck2All } from "react-icons/bs";
import { CiMenuKebab } from "react-icons/ci";
import { toast } from "react-toastify";

import {
  useDeleteChat,
  useEdit,
  useGetConversation,
  useGetConversations,
  useMarkConversationRead,
  useSendPrivateMessage,
} from "../hooks/useUserChat";
import { usePrivateTyping } from "../../websocket/hooks/useTyping";
import ChatInput from "../../chat/components/ChatInput";
import KebabMenu from "../../chat/components/KebabMenu";
import { getTheTime } from "../../../services/helperFns";
import useMessageSeen from "../../websocket/hooks/useMsgSeen";
import useOnlineUsers from "../../websocket/hooks/useOnlineUsers";
import { useAuthContext } from "../../auth/AuthContext";

function ChatSingle() {
  const location = useLocation();
  const { id: chatId } = useParams();
  const { currentUser } = useAuthContext();
  const { onProfileOpen } = useOutletContext();

  const messagesEndRef = useRef(null);
  const lastMarkedChatId = useRef(null);

  const { user, privateChats = [], profile } = location.state || {};

  const navigate = useNavigate();
  const { data: conversations } = useGetConversations();

  //fetch live data
  const { data: fetchConvo } = useGetConversation(chatId, {
    enabled: !!chatId,
  });

  const allChats = fetchConvo || privateChats;
  const [hovered, setHovered] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editChat, setEditChat] = useState(null);

  // Typing state configuration
  const { typingUsers, emitTyping } = usePrivateTyping(chatId, currentUser?.id);
  const otherTypingUsers = useMemo(
    () => (typingUsers || []).filter((userId) => userId !== currentUser?.id),
    [typingUsers, currentUser?.id],
  );

  const { markSeen } = useMessageSeen({
    messageId: chatId,
    fromUserId: currentUser?.id,
  });

  const sendMsgMutation = useSendPrivateMessage();
  const deleteChatMutation = useDeleteChat();
  const editChatMutation = useEdit();

  const markMsgMutation = useMarkConversationRead({
    onSuccess: () => {
      lastMarkedChatId.current = chatId;
    },
  });

  // Automated layout anchor snapping to latest message frame
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [allChats?.length, scrollToBottom]);

  const handleMarkAsRead = useCallback(() => {
    if (!allChats || !chatId || !currentUser?.id) return;
    if (lastMarkedChatId.current === chatId) return;

    const hasUnread = allChats.some(
      (msg) => !msg.read && msg.senderId !== currentUser.id,
    );
    if (hasUnread) {
      markMsgMutation.mutate(chatId);
    }
  }, [allChats, chatId, currentUser?.id, markMsgMutation]);

  useEffect(() => {
    if (lastMarkedChatId.current !== chatId) {
      markSeen();
    }
    handleMarkAsRead();
  }, [chatId, markSeen, handleMarkAsRead]);

  const handleMessageSubmit = useCallback(
    async (data) => {
      const textContent = data.text?.trim();
      if (!textContent && !data.imgUrl) return;

      const payload = {
        senderId: currentUser.id,
        receiverId: chatId,
        text: textContent || null,
        imgUrl: data.imgUrl || null,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] == null) delete payload[key];
      });
      try {
        await sendMsgMutation.mutateAsync(payload);
      } catch (err) {
        toast({
          type: "error",
          message: "Error sending message",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [currentUser?.id, chatId, sendMsgMutation],
  );

  const handleEditChat = useCallback(
    async (data) => {
      if (!editChat) return;
      const textContent = data.text?.trim();

      const payload = {
        text: textContent || null,
        imgUrl: data.imgUrl || null,
        receiverId: chatId,
        senderId: currentUser.id,
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] == null) delete payload[key];
      });

      try {
        await editChatMutation.mutateAsync({
          chatId: editChat.id,
          data: payload,
        });
        setEditChat(null);
      } catch (err) {
        toast({
          type: "error",
          message: "Error editing message",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [editChat, chatId, currentUser?.id, editChatMutation],
  );

  const handleDeleteChat = useCallback(
    async (messageId) => {
      if (!messageId) return;
      try {
        await deleteChatMutation.mutateAsync(messageId);
      } catch (err) {
        toast({
          type: "error",
          message: "Error deleting message",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setOpenMenuId(null);
    },
    [deleteChatMutation],
  );

  const handleSelectedEditChat = useCallback((chat) => {
    setEditChat(chat);
    setOpenMenuId(null);
  }, []);
  const handleMenuToggle = useCallback((messageId, e) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === messageId ? null : messageId));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setOpenMenuId(null);
  }, []);

  const { onlineUsers } = useOnlineUsers();
  const isOnline = onlineUsers?.includes(chatId);

  if (!user) return null;
  const isClickedUserTyping = otherTypingUsers.includes(chatId);
  const { username } = user;
  const avatarUrl = profile?.avatarUrl;
  const bio = profile?.bio;

  return (
    <div
      className="flex flex-col h-[calc(100vh-40px)] w-full max-w-4xl mx-auto bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative"
      onMouseEnter={() => setHovered(true)}
      onTouchStart={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => setHovered(true)}
    >
      {/* Top Banner Channel Profile Meta Block */}
      <div className="p-4 flex items-center gap-3 bg-neutral-900/60 backdrop-blur-md border-b border-white/5 z-10">
        <button
          onClick={() => navigate(-1)}
          aria-label="Navigate to previous index directory"
          className="md:hidden p-2 -ml-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all shrink-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        <button
          title={`Show ${username}'s profile`}
          onClick={() => onProfileOpen?.({ type: "user", user, profile })}
          className="focus:outline-none active:scale-95 transition-transform shrink-0"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 font-bold uppercase text-sm">
              {username.slice(0, 2)}
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-neutral-100 truncate">
            {username}
          </h3>
          <p className="text-xs text-neutral-400 truncate mt-0.5">
            {isClickedUserTyping ? (
              <span className="text-amber-400 font-medium animate-pulse">
                is typing...
              </span>
            ) : isOnline ? (
              <span className="text-emerald-400 font-medium">Online</span>
            ) : (
              <span className="text-neutral-500">Offline</span>
            )}
          </p>
        </div>
      </div>

      {/* Main Conversation Stream View Node Panel */}
      <div className="flex-1  overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar bg-neutral-900/10">
        {allChats.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-neutral-500 text-sm italic tracking-wide">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          allChats.map((msg) => {
            const isCurrentUser = msg.senderId === currentUser?.id;
            const isMsgMenuOpen = openMenuId === msg.id;
            const isDeleted = msg.sender?.isDeleted;
            return (
              <div
                key={msg.id}
                className={`flex py-1 w-full items-end gap-2  group/msg ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                {/* Text Bubble Bubble Node Layout */}
                <div
                  className={`relative max-w-sm px-3.5 py-2 rounded-2xl text-[14.5px] leading-relaxed shadow-md transition-all ${
                    isCurrentUser
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-neutral-800 text-neutral-100 rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {msg.text?.trim() ? msg.text : "Empty message"}
                  </p>
                  {/* Metadata Row Hook inside message text layout context */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-60 select-none">
                    <span>{getTheTime(msg?.created)}</span>
                    {isCurrentUser && (
                      <span className="shrink-0">
                        {msg.read ? (
                          <BsCheck2All className="w-3.5 h-3.5 text-emerald-300 fill-current" />
                        ) : (
                          <IoCheckmarkOutline className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>{" "}
                  {/* Kebab Action Dropdown Menu Portal */}
                  <div className="relative ">
                    {isMsgMenuOpen && (
                      <div className="absolute right-0 -bottom-7 mb-1 z-20 shadow-xl bg-neutral-950 border border-white/10 rounded-xl overflow-hidden min-w-30 animate-fade-in">
                        <KebabMenu
                          onEdit={() => handleSelectedEditChat(msg)}
                          onDelete={() => handleDeleteChat(msg.id)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Action Toggle Trigger Button */}
                <div className="w-5">
                  {isCurrentUser && hovered && (
                    <button
                      aria-label="Open message menu"
                      onClick={(e) => handleMenuToggle(msg.id, e)}
                      type="button"
                      className="p-1  group rounded-full hover:bg-white/5 text-neutral-500 hover:text-neutral-200 transition-all  group-hover/msg:opacity-100"
                    >
                      <CiMenuKebab
                        aria-hidden="true"
                        className="w-5 h-5  group-hover:scale-105 fill-green-400 transition-all"
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Composer */}
      {editChat ? (
        <div className="space-y-2 rounded-xl bg-violet-950/10 border border-violet-500/20 p-3 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center justify-between text-xs font-semibold text-violet-400 px-1">
            <span>Editing Active Chat</span>
            <button
              onClick={() => {
                setEditChat(null);
              }}
              className="hover:underline text-zinc-500 hover:text-zinc-300"
            >
              Cancel edit
            </button>
          </div>
          <ChatInput onSubmit={handleEditChat} editChat={editChat?.text} />
        </div>
      ) : (
        <ChatInput onSubmit={handleMessageSubmit} />
      )}
    </div>
  );
}

export default ChatSingle;

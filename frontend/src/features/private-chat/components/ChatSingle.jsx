import { IoCheckmarkOutline } from "react-icons/io5";
import { BsCheck2All } from "react-icons/bs";
import { useParams } from "react-router-dom";
import {
  useDeleteChat,
  useEdit,
  useGetConversation,
  useSendPrivateMessage,
} from "../hooks/useUserChat";
import { useUsers } from "../userContext";
import ChatInput from "../../chat/components/ChatInputv1";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import KebabMenu from "../../chat/components/KebabMenu";
import { toast } from "react-toastify";
import { getTheTime } from "../../../services/helperFns";

const chatHolderStyle = `text-xs text-amber-100 h-max w-max
 rounded-sm  bg-white/5 border border-white/10 p-1 shadow-sm 
 transition-all duration-300 hover:shadow-[0_0_6px_rgba(59,130,246,0.6)]
  hover:border-blue-500/50 cursor-pointer`;
const imgStyle = `rounded-full w-10 h-10  object-cover ring-2  shadow-md`;

const ownerChat = `text-xs text-amber-100 h-max w-max
 rounded-sm  border border-white/10 p-1 shadow-sm 
 transition-all duration-300 hover:shadow-[0_0_16px#f5e53799)]
  hover:border-red-500 cursor-pointer`;
const iconStyle = ` fill-green-600 w-3 h-3  cursor-pointer`;

function ChatSingle({ currentUser }) {
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emoji, setEmoji] = useState(null);
  const [editChat, setEditChat] = useState(null);
  if (!currentUser) return null;

  // Get all messages between currentUser and clickedUser
  let chatId = useParams().id;
  const {
    users,
    isLoading,
    isSuccess: isAllUsersSuccess,
    isError: isAllUsersError,
  } = useUsers();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();
  const sendMsgMutation = useSendPrivateMessage({
    onSuccess: () => {
      reset();
    },
    onError: () => {
      reset();
    },
  });
  const handleSendMsg = (data) => {
    sendMsgMutation.mutate(data);
  };

  const handleMessageSubmit = (data) => {
    const { userMsg, imgUrl } = data;
    if (!userMsg && !imgUrl) return;

    const payload = {
      senderId: currentUser.id,
      receiverId: chatId,
      text: userMsg,
      imgUrl,
    };
    //remove undefined values
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });
    //if neither text nor img  present return
    if (!payload.text.trim() && !payload.imgUrl) return;
    handleSendMsg(payload);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isAllUsersError) return <p>Error fetching users</p>;
  if (!isAllUsersSuccess || !users) return null;

  const clickedUser = users.find((user) => user.id === chatId);

  if (!clickedUser) return null;
  let selectedUserId = clickedUser.id;

  const {
    data: privateChats,
    isSuccess: isPrivateChatsSuccess,
    isError: isPrivateChatsError,
  } = useGetConversation(selectedUserId);

  if (!privateChats || isPrivateChatsError)
    return <p>Error fetching messages</p>;
  // const conversation = privateChats.filter(
  //   (chat) =>
  //     (chat.senderId === currentUser.id &&
  //       chat.receiverId === clickedUser.id) ||
  //     (chat.senderId === clickedUser.id && chat.receiverId === currentUser.id),
  // );

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setMenuOpen(false);
  };
  // //edit and delete chat
  const deleteChatMutation = useDeleteChat({
    onSuccess: () => {
      toast({
        type: "success",
        message: "Chat deleted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        type: "error",
        message: "Error deleting chat",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
  const editChatMutation = useEdit({
    onSuccess: () => {
      toast({
        type: "success",
        message: "Chat Edited successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: () => {
      toast({
        type: "error",
        message: "Error editing chat",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleDeleteChat = (chatId) => {
    if (!chatId) return;
    deleteChatMutation.mutate(chatId);
  };
  const handleEditChat = (data) => {
    if (!editChat) return;
    const { userMsg: text, imgUrl } = data;

    const payload = {
      text,
      imgUrl,
      receiverId: selectedUserId,
      senderId: currentUser.id,
    };
    //remove null
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null) {
        delete payload[key];
      }
    });
    const chatId = editChat.id;
    editChatMutation.mutate({ chatId, data: payload });
    setEditChat(null);
  };
  const handleSelectedEditChat = (chat) => {
    setEditChat(chat);
  };

  return (
    <div
      className="flex flex-col space-y-2 relative"
      onMouseEnter={() => setHovered(true)}
      onTouchStart={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {privateChats.length === 0 && (
        <p className="text-gray-400 italic">
          No messages yet. Start the conversation!
        </p>
      )}
      {privateChats.map((msg) => {
        const isCurrentUser = msg.senderId === currentUser.id;
        return (
          <div
            key={msg.id}
            className={`flex items-start ${
              isCurrentUser ? "justify-end" : "justify-start"
            }`}
          >
            {!isCurrentUser && (
              <img
                src={clickedUser.profile.avatarUrl}
                alt={clickedUser.name}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            <p
              className={`px-3 py-2 rounded-lg max-w-xs ${
                isCurrentUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.text && msg.text.trim() !== "" ? msg.text : "send message"}
            </p>
            {msg.read === false ? (
              <IoCheckmarkOutline aria-hidden="true" />
            ) : (
              <BsCheck2All
                className="fill-green-400"
                aria-hidden="true"
                className="fill-green-400"
              />
            )}

            {isCurrentUser && hovered && (
              <div className="ml-2">
                <button
                  aria-label="Open post menu"
                  onClick={handleMenuToggle}
                  type="button"
                >
                  <CiMenuKebab className="w-6 h-6 fill-pink-300 hover:fill-green-400" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400">{getTheTime(msg?.created)}</p>
            {menuOpen && (
              <KebabMenu
                onEdit={() => handleSelectedEditChat(msg)}
                onDelete={() => handleDeleteChat(msg.id)}
              />
            )}
          </div>
        );
      })}
      {!editChat && <ChatInput onSubmit={handleMessageSubmit} />}
      {editChat && (
        <>
          <p>editing</p>
          <ChatInput onSubmit={handleEditChat} editChat={editChat} />
        </>
      )}
    </div>
  );
}

/*
function ChatSingle({ owner = false, users, currentUser, privateChats }) {
  let chatId = useParams();
  chatId = parseInt(chatId.id) ? parseInt(chatId.id) : chatId.id;
  const user = users.find((user) => user.id === chatId);
  let isOwner = currentUser.id === chatId;
  const { sender, chat } =
    getChatMsgFromSender(privateChats, chatId, users) || {};
  console.log(sender, chat);

  if (!user) return null;
  const {
    profile: { avatarUrl },
    status,
  } = user;

  const receiveFromOthers = getUserByChatId(privateChats, chatId, users, false);

  const text = `This is a single chat with ${user.username}. You can send messages, images, and files here.`;
  return (
    <div>
      {(!isOwner && receiveFromOthers && (
        <CreateImgForSender
          key={user.id}
          avatarUrl={user.profile.avatarUrl}
          status={user.status}
          text={`This is a message from ${user.username}.`}
        />
      )) || (
        <p className="text-gray-400 italic">
          No messages yet. Start the conversation!
        </p>
      )}
      {isOwner && (
        <div className="w-max">
          <div className={`${ownerChat} bg-blue-700 rounded-br-none`}>
            <p>{text}</p>
          </div>
          <div className="flex items-end justify-end">
            <BsCheck2All className={iconStyle} />
            <span className="text-[0.3rem] text-gray-300"> 11:11</span>
          </div>
        </div>
      )}
    </div>
  );
}
function CreateImgForSender({ avatarUrl, status, text }) {
  return (
    <div className="flex justify-start items-end gap-2 max-w-130 ">
      <img
        src={`${avatarUrl}`}
        alt="profile"
        className={`${imgStyle} ${status === "ONLINE" ? "ring-green-500" : "ring-gray-500"}`}
        loading="lazy"
      />
      <div className={`${chatHolderStyle} rounded-bl-none`}>
        <p>{text}</p>
      </div>
    </div>
  );
}*/
export default ChatSingle;

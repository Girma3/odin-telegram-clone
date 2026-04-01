import { BsCheck2All } from "react-icons/bs";
import { IoIosCheckmark } from "react-icons/io";
import { useParams } from "react-router-dom";

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

function ChatSingle({ currentUser, users, privateChats }) {
  // Get all messages between currentUser and clickedUser
  let chatId = useParams();
  chatId = parseInt(chatId.id) ? parseInt(chatId.id) : chatId.id;
  const clickedUser = users.find((user) => user.id === chatId);
  const conversation = privateChats.filter(
    (chat) =>
      (chat.senderId === currentUser.id &&
        chat.receiverId === clickedUser.id) ||
      (chat.senderId === clickedUser.id && chat.receiverId === currentUser.id),
  );
  if (conversation.length === 0) {
    return (
      <p className="text-gray-400 italic">
        No messages yet. Start the conversation!
      </p>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      {conversation.map((msg) => {
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
          </div>
        );
      })}
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

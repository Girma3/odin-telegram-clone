import { BsCheck2All } from "react-icons/bs";
import { IoIosCheckmark } from "react-icons/io";
import { useParams } from "react-router-dom";

const chatHolderStyle = `text-xs text-amber-100 h-max w-max
 rounded-sm  bg-white/5 border border-white/10 p-1 shadow-sm 
 transition-all duration-300 hover:shadow-[0_0_6px_rgba(59,130,246,0.6)]
  hover:border-blue-500/50 cursor-pointer`;
const imgStyle = `rounded-full sm:w-6 sm:h-6 w-5 h-5 shadow-md`;

const ownerChat = `text-xs text-amber-100 h-max w-max
 rounded-sm  border border-white/10 p-1 shadow-sm 
 transition-all duration-300 hover:shadow-[0_0_16px#f5e53799)]
  hover:border-red-500 cursor-pointer`;
const iconStyle = ` fill-green-600 w-3 h-3  cursor-pointer`;
function ChatSingle({ owner = false, users }) {
  let chatId = useParams();
  chatId = parseInt(chatId.id);
  const user = users.find((user) => user.id === chatId);
  if (!user) return null;
  const { msg: text } = user;
  return (
    <div>
      {!owner && (
        <div className="flex justify-start items-end gap-1 max-w-110 ">
          <img
            src="/images/jet.jpg"
            alt="profile"
            className={imgStyle}
            loading="lazy"
          />
          <div className={`${chatHolderStyle} rounded-bl-none`}>
            <p>{text}</p>
          </div>
        </div>
      )}
      {owner && (
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

export default ChatSingle;

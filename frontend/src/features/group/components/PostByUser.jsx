// const chatHolderStyle = `text-xs text-amber-100 h-max w-min
//  rounded-sm  bg-white/5 border border-white/10 p-1 shadow-sm
//  transition-all duration-300 hover:shadow-[0_0_6px_rgba(59,130,246,0.6)]
//   hover:border-blue-500/50 cursor-pointer`;

// const imgStyle = `rounded-full sm:w-3 sm:h-3 w-4 h-4 shadow-md ring-1 ring-green-300`;

// const stackImages = ` relative left-[-3px]`;
import { RiArrowDropRightLine } from "react-icons/ri";
import { FaRegMessage } from "react-icons/fa6";
import { CiMenuKebab } from "react-icons/ci";

import Reaction from "../../chat/Reaction";
import { useState } from "react";
//<FaRegMessage />
export const chatHolderStyle = `
  text-xs text-amber-100  
  min-w-[120px] max-w-[680px]   /* hard limits */
  rounded-md bg-white/5 border border-white/10 p-2 shadow-sm
  transition-all duration-300
  hover:shadow-[0_0_6px_rgba(59,130,246,0.6)]
  hover:border-blue-500/50 cursor-pointer
`;

export const imgStyle = `
  rounded-full sm:w-5 sm:h-5 w-6 h-6  shadow-md ring-1 ring-green-300
`;

export const stackImages = `
  absolute top-0
`;
const iconStyle = `w-5 h-5 bg-violet-500 transition-all duration-300 ease-in-out rounded-full
  hover:bg-blue-600 cursor-pointer`;
const msgIcon = `w-4 h-4 fill-white-500 transition-all duration-300 ease-in-out hover:fill-green-600   `;

//accept post as image or text, number of comments ,reactions from user
// if owner show edit, delete

function PostByUser({
  commentNum = null,
  post,
  reaction,
  imgUrl,
  text,
  owner = false,
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <li
      className="relative p-1 w-max max-w-175 "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={chatHolderStyle}>
        {imgUrl && (
          <img src={imgUrl} alt="post" className="rounded-sm" loading="lazy" />
        )}
        {text && (
          <p>
            hello there! Lorem ipsum dolor sit amet consectetur adipisicing
            elit. Qui illum enim fugit sunt at harum, repellendus, corporis
            impedit molestiae magni deleniti quasi praesentium consectetur, eius
            officiis. Nisi nam delectus velit.
          </p>
        )}
        <hr className="my-2 border-0 p-[0.5px]  bg-linear-to-r from-green-700 to-amber-300 to-red-500 " />
        <div>
          <div>
            <p className="p-1">
              {reaction && (
                <>
                  <span>heart</span>
                  <span className="text-xs text-amber-100">
                    {reaction > 1 ? `${reaction} reactions` : "1 reaction"}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center  ">
            {commentNum && (
              <ul className="relative w-10 h-5 shrink-0">
                <li className="absolute left-0">
                  <img
                    src="./images/jet.jpg"
                    alt="person"
                    className={imgStyle}
                    loading="lazy"
                  />
                </li>
                <li className="absolute left-3">
                  <img
                    src="./images/jet.jpg"
                    alt="person"
                    className={imgStyle}
                    loading="lazy"
                  />
                </li>{" "}
              </ul>
            )}

            <div
              className={`flex w-full p-1 ${commentNum ? "justify-between" : "justify-end"}`}
            >
              {commentNum && (
                <p>{commentNum > 1 ? `${commentNum} comments` : "1 comment"}</p>
              )}
              {commentNum && <RiArrowDropRightLine className={iconStyle} />}
              {!commentNum && (
                <button
                  aria-label="leave comment"
                  className="flex items-center"
                >
                  <FaRegMessage className={msgIcon} aria-hidden="true" />
                  <span className="mx-1">Leave comment</span>
                </button>
              )}
            </div>
          </div>
        </div>{" "}
        {hovered && <Reaction />}
        {owner && <CiMenuKebab className="w-5 h-5 fill-amber-400" />}
      </div>
    </li>
  );
}

/*
function ChatWithComment() {
  return (
    <div>
      <div className={chatHolderStyle}>
        <p className="word-break w-sm">
          hello there ! Lorem ipsum, dolor sit amet consectetur adipisicing
          elit. Qui illum enim fugit sunt at harum, repellendus, corporis
          impedit molestiae magni deleniti quasi praesentium consectetur, eius
          officiis. Nisi nam delectus velit.
        </p>
        <hr />
        <div className="flex items-center">
          <ul className="flex ">
            <li className="relative">
              <img
                src="./images/jet.jpg"
                alt="peron"
                className={`${imgStyle} `}
              />
            </li>
            <li className="relative">
              {" "}
              <img
                src="./images/jet.jpg"
                alt="peron"
                className={`${imgStyle} ${stackImages}`}
              />
            </li>
          </ul>
          <div className="flex items-center justify-between w-full">
            <p>2 comments</p>
            <RiArrowDropRightLine />
          </div>
        </div>
      </div>
    </div>
  );
}*/

export default PostByUser;

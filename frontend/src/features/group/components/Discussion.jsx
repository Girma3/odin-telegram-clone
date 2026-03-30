import { useParams, useSearchParams } from "react-router-dom";
import PostByUser from "./PostByUser";
import ChatWithComment from "./PostByUser";
import UserComment from "./UserComment";
const mainPost = `max-w-[600px]  h-max bg-gray-700 rounded-sm p-2`;

function Discussion({ groups, onProfileOpen }) {
  const postId = useParams().id;

  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");
  const group = groups.find((group) => group.id === parseInt(groupId));
  const post = group.posts.find((post) => post.id === parseInt(postId));
  const comments = post.comments;

  const { text, imgUrl, created } = post;

  return (
    <div className="flex flex-col ">
      <div className="flex flex-col gap-2 items-center">
        <div className={mainPost}>
          {imgUrl && (
            <img
              src={`${imgUrl}`}
              alt="post"
              className="w-100 h-80 object-cover rounded-sm shadow-md ring-1 ring-pink-400"
              loading="lazy"
            />
          )}
          {text && <p className="py-2">{text}</p>}
          <div className="flex justify-end items-center">
            <span>{created}</span>
          </div>
        </div>
      </div>
      {comments?.length > 0 && (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <UserComment
              key={comment.id}
              comment={comment}
              onProfileOpen={onProfileOpen}
            />
          ))}
        </ul>
      )}

      {comments?.length === 0 && (
        <div className="flex justify-center items-center ">
          <p className="text-amber-300">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </div>
  );
}

export default Discussion;

import { useParams } from "react-router-dom";
import GroupPost from "./GroupPost";

const header = `bg-gray-700 p-4 `;
const imgStyle = `w-10 h-10 rounded-full shadow-md ring-1 ring-green-300 offset-2`;

function GroupChat({ users, groups, currentUser, onProfileOpen }) {
  let groupId = useParams();
  groupId = parseInt(groupId.id) ? parseInt(groupId.id) : groupId.id; //make it number later
  const group = groups.find((group) => group.id == groupId);

  if (!group) return null;
  const { id, profile, ownerId, name, members, posts } = group;
  const { avatarUrl } = profile;
  //get current user to see it's admin to able edit group info
  let isAdmin = ownerId === 1 ? true : false; //change after auth

  let membersCount =
    members > 1
      ? `${members.length + 1} members`
      : `${members.length + 1} member`;

  return (
    <div>
      <div className={header}>
        <button
          onClick={() =>
            onProfileOpen({ type: "group", group: group, isAdmin: isAdmin })
          }
          aria-label="show profile"
          title="show group profile"
        >
          <img
            src={`${avatarUrl}`}
            alt="profile"
            className={imgStyle}
            loading="lazy"
          />
        </button>

        <div className="flex flex-col">
          <p>{name}name</p>
          <p>{membersCount}</p>
        </div>
      </div>

      <ul className="flex flex-col gap-2 justify-between p-2">
        {/* pass members not users later */}
        {posts?.map((post) => (
          <GroupPost
            key={post.id}
            post={post}
            currentUser={currentUser}
            groupId={groupId}
            users={users}
            isAdmin={false} //change after auth
            onProfileOpen={onProfileOpen}
          />
        ))}
      </ul>
    </div>
  );
}

export default GroupChat;

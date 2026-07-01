import { useMemo } from "react";
import { useGetProfileByUser } from "../../profile/hooks/useProfile";

// Isolated Single Avatar to safely call hooks sequentially
function IndividualAvatar({
  userId,
  username,
  profileData,
  onProfileOpen,
  zIndex,
  leftOffset,
}) {
  // const { data: profile, isSuccess, isLoading } = useGetProfileByUser(userId);
  // if (!isSuccess && !isLoading) return null;
  const profile = profileData;

  const handleClick = (e) => {
    e.stopPropagation(); // 🛑 Stop parent discussion navigation
    if (onProfileOpen) {
      onProfileOpen({
        type: "user",
        user: { id: userId, username },
        profile: profile,
      });
    }
  };

  return (
    <button
      className="absolute w-8 h-8   ring-1 ring-black rounded-full transition-transform hover:scale-115 focus:outline-none"
      style={{ left: `${leftOffset}px`, zIndex }}
      onClick={handleClick}
      title={`${username || "User"}'s profile`}
      aria-label={`View ${username || "User"}'s profile`}
      type="button"
    >
      <img
        src={profile?.avatarUrl}
        alt={`${username || "User"}'s profile`}
        className="w-8 h-8 rounded-full object-cover  bg-gradient-to-t from-black to-blue-600"
        loading="lazy"
      />
    </button>
  );
}

// Group wrapper processing computed array pipeline
function CommenterAvatars({ comments = [], groupMembers = [], onProfileOpen }) {
  const activeCommenters = useMemo(() => {
    if (!groupMembers.length || !comments.length) return [];

    const relevantMembers = comments.filter((comment) =>
      groupMembers.some((member) => comment.userId === member.userId),
    );
    // console.log(relevantMembers);
    const removeDuplicates = new Set();

    const uniqueMembers = relevantMembers.filter((member) => {
      if (removeDuplicates.has(member.userId)) return false;
      removeDuplicates.add(member.userId);
      return true;
    });
    // console.log(uniqueMembers);
    let max = uniqueMembers.length > 3 ? 3 : uniqueMembers.length;

    //grab max 3 users
    return comments
      .slice(0, max)
      .map((comment) => uniqueMembers.find((m) => m.userId === comment.userId))
      .filter(Boolean);
  }, [comments, groupMembers]);

  if (!activeCommenters.length) return null;

  return (
    <div className="relative w-20 h-8 p-1">
      {activeCommenters.map((member, index) => {
        const userNode = member?.author;
        if (!userNode || userNode.isDeleted) return null;

        return (
          <IndividualAvatar
            key={`${userNode.id}-${index}`}
            userId={userNode.id}
            profileData={member.author.profile}
            username={userNode.username}
            zIndex={activeCommenters.length - index}
            leftOffset={index * 22}
            onProfileOpen={onProfileOpen}
          />
        );
      })}
    </div>
  );
}

export default CommenterAvatars;

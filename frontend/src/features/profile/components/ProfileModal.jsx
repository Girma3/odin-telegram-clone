import Modal from "./Modal";
import ProfileCard from "./ProfileCard";
import ProfileGroup from "./ProfileGroup";

function ProfileModal({ profileState, onClose, onCloseSideBar }) {
  if (!profileState.isOpen) return null;
  console.log(profileState);

  return (
    <Modal isOpen={profileState.isOpen} onClose={onClose}>
      {profileState.type === "user" && (
        <ProfileCard
          isSelf={profileState.isSelf}
          user={profileState.user}
          profile={profileState.profile}
          username={profileState.username}
          onClose={onClose}
          onCloseSideBar={onCloseSideBar}
        />
      )}
      {profileState.type === "group" && (
        <ProfileGroup
          isAdmin={profileState.isAdmin}
          hasGroup={profileState.hasGroup}
          userId={profileState.userId}
          isSelf={profileState.isSelf}
          group={profileState.group}
          onClose={onClose}
          onCloseSideBar={onCloseSideBar}
        />
      )}
    </Modal>
  );
}

export default ProfileModal;

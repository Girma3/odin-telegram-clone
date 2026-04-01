import Modal from "./Modal";
import ProfileCard from "./ProfileCard";
import ProfileGroup from "./ProfileGroup";

function ProfileModal({ profileState, onClose }) {
  if (!profileState.isOpen) return null;

  return (
    <Modal isOpen={profileState.isOpen} onClose={onClose}>
      {profileState.type === "user" && (
        <ProfileCard
          isSelf={profileState.isSelf}
          user={profileState.user}
          onClose={onClose}
        />
      )}
      {profileState.type === "group" && (
        <ProfileGroup
          isAdmin={profileState.isAdmin}
          group={profileState.group}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

export default ProfileModal;

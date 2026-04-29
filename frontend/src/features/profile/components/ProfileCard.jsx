import { useRef, useState, useMemo, useCallback } from "react";
import { MdModeEdit } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { RiImageEditFill } from "react-icons/ri";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { ProfileCardStyle } from "../../../styles.js";
import ProfileForm from "./ProfileForm.jsx";
import Modal from "./Modal.jsx";
import ImageUploader from "../../chat/components/ImageUploader.jsx";

import { useUpdateProfile, useGetProfileByUser } from "../hooks/useProfile.js";
import { useNavigate } from "react-router-dom";

const LABEL_STYLE = `font-semibold text-xs text-amber-200 tracking-wide mb-1`;
const INFO_STYLE = `text-xs text-stone-300 [text-shadow:0_0_12px_rgba(59,130,246,1)]`;
const ICON_STYLE = `transition-all duration-200 cursor-pointer`;

function ProfileCard({ isSelf, user, profile, username, onClose }) {
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!user) return null;
  const { id, username: currentUsername } = user;

  let profileData = useMemo(
    () => ({
      avatarUrl: profile?.avatarUrl,
      bio: profile?.bio,
      location: profile?.location,
      website: profile?.website,
    }),
    [profile?.avatarUrl, profile?.bio, profile?.location, profile?.website],
  );

  const isProfileEmpty = useMemo(() => {
    const { avatarUrl, bio, location, website } = profileData;
    return !avatarUrl && !bio && !location && !website;
  }, [profileData]);

  profileData =
    isProfileEmpty && username ? useGetProfileByUser(id)?.data : profileData;
  console.log(username, currentUsername);
  const methods = useForm({
    defaultValues: {
      username: username || currentUsername || "",
      bio: profileData?.bio || "",
      location: profileData?.location || "",
      website: profileData?.website || "",
    },
  });
  const { reset } = methods;

  const updateProfileMutation = useUpdateProfile({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setEditing(false);
      reset();
      onClose?.();
    },
    onError: () => {
      toast.error("Failed to update profile. Please try again.");
    },
  });

  const handleUpdateSubmit = useCallback(
    async (formData) => {
      const payload = {
        userId: id,
        username: formData.username?.trim() || username,
        avatarUrl: formData.avatarUrl?.trim() || null,
        bio: formData.bio?.trim() || null,
        location: formData.location?.trim() || null,
        website: formData.website?.trim() || null,
      };
      //remove empty fields
      Object.keys(payload).forEach((key) => {
        if (payload[key] == null) {
          delete payload[key];
        }
      });

      updateProfileMutation.mutate({ profileId: profileData.id, ...payload });
    },
    [id, updateProfileMutation],
  );

  const handleSendMessage = useCallback(() => {
    navigate(`/chat/${id}`);
    onClose?.();
  }, [navigate, id, onClose]);

  const handleClose = useCallback(() => {
    onClose?.();
    reset();
    setEditing(false);
  }, [onClose, reset]);

  const handleEditProfile = useCallback(() => setEditing(true), []);

  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload logic here - implement based on your API
      console.log("Uploading avatar:", file);
      toast.info("Avatar upload feature coming soon");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Show form for new profiles
  if (isProfileEmpty && isSelf) {
    return (
      <div className="w-full">
        <button onClick={() => onClose()}>Close</button>
        <h1 className="text-center text-shadow-fuchsia-200 mb-4">
          Edit Profile at first
        </h1>
        <ProfileForm
          user={profileData}
          onSubmit={handleUpdateSubmit}
          methods={methods}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center relative ${ProfileCardStyle}text-stone-300`}
    >
      <div className="w-full">
        {showPreview && (
          <Modal isOpen={showPreview} onClose={() => setShowPreview(false)}>
            <div className="bg-slate-800 flex flex-col items-center p-4 rounded-lg">
              <button
                onClick={() => setShowPreview(false)}
                aria-label="Close image preview"
                className="absolute top-2 right-2 text-yellow-200 hover:text-red-500 transition-colors"
              >
                <IoMdCloseCircle className="w-6 h-6 fill-current" />
              </button>
              <img
                src={profileData.avatarUrl}
                alt={`${username}'s profile`}
                className="w-full max-w-[90%] h-auto max-h-[80vh] object-contain rounded-sm"
              />
            </div>
          </Modal>
        )}

        {!editing && (
          <>
            <div className="relative -top-4 flex justify-end gap-2 p-2">
              {isSelf && (
                <button
                  onClick={handleEditProfile}
                  aria-label="Edit profile"
                  title="Edit profile"
                  className="p-1.5 rounded-full hover:bg-blue-500/20 transition-colors"
                >
                  <MdModeEdit className="w-5 h-5 text-yellow-200 hover:text-green-400" />
                </button>
              )}
              <button
                onClick={handleClose}
                aria-label="Close profile"
                className="p-1.5 rounded-full hover:bg-red-500/20 transition-colors"
              >
                <IoMdCloseCircle className="w-5 h-5 text-yellow-200 hover:text-red-500" />
              </button>
            </div>

            <div className="relative flex flex-col items-center">
              <div className="relative">
                <button
                  onClick={() => setShowPreview(true)}
                  aria-label="Preview profile picture"
                  className="focus:outline-none"
                >
                  <img
                    src={profileData.avatarUrl}
                    alt={`${username}'s profile`}
                    className="rounded-full w-20 h-20 object-cover ring-2 ring-green-500 ring-offset-2"
                  />
                </button>
                {isSelf && (
                  <div className="absolute -bottom-1 -right-1">
                    <ImageUploader
                      onUpload={handleImageUpload}
                      isUploading={isUploading}
                      className="w-7 h-7"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {isSelf && editing && (
          <div className="w-full">
            <button
              onClick={() => {
                setEditing(false);
                reset();
              }}
              aria-label="Cancel editing"
              className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-red-500/20 transition-colors"
            >
              <IoMdCloseCircle className="w-5 h-5 text-yellow-200 hover:text-red-500" />
            </button>
            <h1 className="text-center text-shadow-indigo-100 mb-4">
              Edit Profile
            </h1>
            <ProfileForm methods={methods} onSubmit={handleUpdateSubmit} />
          </div>
        )}

        {!editing && (
          <div className="flex flex-col items-start w-full mt-4">
            <InfoItem label="Username" value={username} />
            <InfoItem label="Bio" value={profileData.bio} />
            <InfoItem label="Location" value={profileData.location} />
            <InfoItem label="Website" value={profileData.website} />
            {!isSelf && (
              <button
                onClick={handleSendMessage}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium"
              >
                Send Message
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col mb-3">
      <span className={LABEL_STYLE}>{label}</span>
      <span className={INFO_STYLE}>{value}</span>
    </div>
  );
}

export default ProfileCard;

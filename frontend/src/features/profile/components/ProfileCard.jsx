import React, { useRef, useState, useMemo, useCallback } from "react";
import { MdDownloadForOffline, MdModeEdit } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProfileForm from "./ProfileForm.jsx";
import Modal from "./Modal.jsx";
import ImageUploader from "../../chat/components/ImageUploader.jsx";
import { useGetProfileByUser, useUpdateProfile } from "../hooks/useProfile.js";
import useOnlineUsers from "../../websocket/hooks/useOnlineUsers.jsx";
import {
  downloadProfileImage,
  uploadAndGetPublicUrl,
} from "../../../services/uploadImage.js";

const LABEL_STYLE =
  "text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-0.5";
const INFO_STYLE = "text-[14px] text-neutral-100 leading-relaxed font-normal";

function ProfileCard({ isSelf, user, profile, username, onClose }) {
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const onlineUsers = useOnlineUsers();
  const navigate = useNavigate();

  if (!user) return null;

  const { id, username: currentUsername } = user;
  const isOnline = onlineUsers?.includes(id);

  const { data: fetchedProfile, isLoading } = useGetProfileByUser(id);

  // 2. MERGE DATA SOURCES
  // Fall back to the fetched data if the profile property passed from the parent is empty
  const activeProfile = fetchedProfile || profile;

  // Safely assemble local profile state configuration
  const profileData = useMemo(
    () => ({
      id: activeProfile?.id,
      avatarUrl: activeProfile?.avatarUrl,
      bio: activeProfile?.bio,
      location: activeProfile?.location,
      website: activeProfile?.website,
    }),
    [
      activeProfile?.id,
      activeProfile?.avatarUrl,
      activeProfile?.bio,
      activeProfile?.location,
      activeProfile?.website,
    ],
  );

  const displayUsername = username || currentUsername || "User";

  const methods = useForm({
    defaultValues: {
      username: displayUsername,
      bio: profileData?.bio || "",
      location: profileData?.location || "",
      website: profileData?.website || "",
    },
  });

  const { reset } = methods;

  const updateProfileMutation = useUpdateProfile();
  const handleUpdateSubmit = useCallback(
    async (formData) => {
      if (!profileData?.id) return;

      const payload = {
        userId: id,
        username: formData.username?.trim() || displayUsername,
        avatarUrl: profileData.avatarUrl,
        bio: formData.bio?.trim() || null,
        location: formData.location?.trim() || null,
        website: formData.website?.trim() || null,
      };

      // Eliminate empty payload variables safely before pushing mutation query
      Object.keys(payload).forEach((key) => {
        if (payload[key] === null || payload[key] === "") {
          delete payload[key];
        }
      });
      try {
        await updateProfileMutation.mutateAsync({
          profileId: profileData.id,
          ...payload,
        });
        toast.success("Profile updated successfully");
        setEditing(false);
        reset();
        onClose?.();
      } catch (error) {
        toast.error("Failed to update profile. Please try again.");
      }
    },
    [id, displayUsername, profileData, updateProfileMutation],
  );

  const handleSendMessage = useCallback(() => {
    navigate(`/chat/${id}`, {
      state: { user, profile: profileData },
    });
    onClose?.();
  }, [navigate, id, onClose]);

  const handleClose = useCallback(() => {
    onClose?.();
    reset();
    setEditing(false);
  }, [onClose, reset]);

  const handleImageUpload = useCallback(
    async (file) => {
      if (!file || !profileData.id) return;
      setIsUploading(true);
      try {
        const url = await uploadAndGetPublicUrl(
          file,
          id,
          profileData.avatarUrl,
        );
        if (!url) return toast.error("Failed to upload image try later.");
        await updateProfileMutation.mutateAsync({
          profileId: profileData.id,
          userId: id,
          avatarUrl: url,
        });
        toast.success("Profile avatar updated!");
      } catch (error) {
        toast.error("Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    },
    [id, profileData.id, profileData?.avatarUrl, updateProfileMutation],
  );

  // Initial Edit State View Configuration for Empty Profiles
  if (isSelf && !profileData?.id) {
    return (
      <div className="w-full max-w-sm mx-auto bg-neutral-900 border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl animate-fade-in text-neutral-200">
        <h1 className="text-center text-lg font-semibold tracking-wide mb-4 text-amber-200">
          Set Up Your Profile
        </h1>
        <ProfileForm
          user={profileData}
          onSubmit={handleUpdateSubmit}
          methods={methods}
        />
        <button
          onClick={handleClose}
          className="w-full mt-2 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-neutral-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col relative text-neutral-200 animate-fade-in">
      {/* Lightbox / Full-screen Image Preview Frame */}
      {showPreview && profileData.avatarUrl && (
        <Modal isOpen={showPreview} onClose={() => setShowPreview(false)}>
          <div className="relative flex flex-col items-center p-2 bg-neutral-950/95 backdrop-blur-2xl rounded-2xl max-w-md w-full">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white
               transition-colors bg-neutral-900 p-1.5 rounded-full border border-white/10 shadow-lg  "
              aria-label="Close layout image preview"
            >
              <IoMdCloseCircle className="w-5 h-5   hover:fill-red-500 " />
            </button>
            <img
              src={profileData.avatarUrl}
              alt={displayUsername}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl mt-8 mb-4 shadow-xl"
            />
            <button
              aria-label="Download image"
              type="button"
              onClick={() => {
                downloadProfileImage(profileData.avatarUrl, displayUsername);
                setShowPreview(false);
              }}
              className="mr-auto rounded-full p-1 bg-cyan-400 hover:transform hover:scale-110 transition-transform duration-200  "
            >
              <MdDownloadForOffline
                aria-hidden="true"
                className="w-5 h-5  fill-black"
              />
            </button>{" "}
          </div>
        </Modal>
      )}

      {/* Profile Header Block */}
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/5">
        <h2 className="font-semibold text-base tracking-wide text-neutral-100">
          {editing ? "Edit Profile" : "User Info"}
        </h2>
        <div className="flex items-center gap-1">
          {isSelf && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Edit view parameters"
            >
              <MdModeEdit aria-hidden="true" className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            aria-label="Close dialog layout container"
          >
            <IoMdCloseCircle aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Editing View Active Container */}
      {editing ? (
        <div className="p-5 flex-1 overflow-y-auto">
          <ProfileForm methods={methods} onSubmit={handleUpdateSubmit} />
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              reset();
            }}
            className="w-full mt-3 py-2 bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl font-medium text-sm transition-all"
          >
            Cancel Changes
          </button>
        </div>
      ) : (
        /* Static Read-Only Display Mode */
        <div className="p-6 flex flex-col items-center flex-1">
          {/* Avatar Area Frame */}
          <div className="relative mb-4 group">
            <button
              onClick={() => profileData.avatarUrl && setShowPreview(true)}
              disabled={!profileData.avatarUrl}
              className="focus:outline-none block relative rounded-full p-1 border border-white/10 shadow-lg active:scale-95 transition-transform"
            >
              {profileData.avatarUrl ? (
                <img
                  src={profileData.avatarUrl}
                  alt={displayUsername}
                  className={`rounded-full w-24 h-24 object-cover ring-4 transition-all duration-300 ${
                    isOnline ? "ring-emerald-500/30" : "ring-neutral-700/30"
                  }`}
                />
              ) : (
                <div className="rounded-full w-24 h-24 bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold text-2xl uppercase tracking-wider">
                  {displayUsername.slice(0, 2)}
                </div>
              )}
            </button>

            {isSelf && (
              <div className="absolute bottom-0 right-0 bg-neutral-950 p-1 rounded-full border border-white/10 shadow-md">
                <ImageUploader
                  onUpload={handleImageUpload}
                  isUploading={isUploading}
                  className="w-6 h-6"
                />
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-neutral-100 tracking-wide">
            {displayUsername}
          </h3>
          <p
            className={`text-[11px] font-semibold tracking-wider mt-1 mb-6 px-2 py-0.5 rounded-full border ${
              isOnline
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : "text-neutral-500 bg-neutral-800/40 border-neutral-800"
            }`}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </p>

          {/* Directory Listings Items Group */}
          <div className="w-full space-y-4 border-t border-white/5 pt-5">
            <InfoItem
              label="Bio"
              value={profileData.bio}
              placeholder="No bio written yet."
            />
            <InfoItem label="Location" value={profileData.location} />
            <InfoItem label="Website" value={profileData.website} isLink />
          </div>

          {!isSelf && (
            <button
              onClick={handleSendMessage}
              className="mt-6 w-full bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-blue-600/10"
            >
              Send Message
            </button>
          )}
        </div>
      )}
    </div>
  );
}
function InfoItem({ label, value, placeholder, isLink }) {
  const displayValue = value || placeholder;
  if (!displayValue) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        {label}
      </span>
      {isLink && value ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 hover:underline transition-colors text-[14px] truncate"
        >
          {value}
        </a>
      ) : (
        <span
          className={`text-[14px] truncate ${
            !value ? "text-neutral-600 italic" : ""
          }`}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
}

export default ProfileCard;

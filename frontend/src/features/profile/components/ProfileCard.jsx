import { useRef, useState } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { RiImageEditFill } from "react-icons/ri";
import { useForm } from "react-hook-form";

import { ProfileCardStyle } from "../../../styles.js";
import ProfileForm from "./ProfileForm.jsx";
import Modal from "./Modal.jsx";

import {
  useCreateProfile,
  useUpdateProfile,
  useGetProfile,
  useGetProfileByUser,
} from "../hooks/useProfile.js";

const labelStyle = `font-semibold text-xs text-amber-200 tracking-wide mb-1`;
const infoStyle = `text-xs text-stone-300 [text-shadow:0_0_12px_rgba(59,130,246,1]`;
const iconStyle = `  transition-all duration-200 cursor-pointer`;

//accept flag to show edit button if user is logged in
function ProfileCard({ isSelf, user, onClose }) {
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  //console.log(user);

  const { data, isError, isLoading } = useGetProfileByUser(user?.id);
  //if user is new user, create profile

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error</div>;
  }

  const profile = {
    avatarUrl: data?.avatarUrl,
    bio: data?.bio,
    location: data?.location,
    website: data?.website,
  };
  // form to create or update
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: {
      name: user?.username || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
    },
  });

  const { errors } = formState;
  const {
    mutate: createProfileMutate,
    data: createProfile,
    isLoading: createProfileLoading,
    isError: createProfileError,
    error: createProfileErrorMessage,
    reset: createProfileReset,
  } = useCreateProfile();
  const {
    mutate: updateProfileMutate,
    data: updateProfile,
    isLoading: updateProfileLoading,
    isError: updateProfileError,
    error: updateProfileErrorMessage,
    reset: updateProfileReset,
  } = useUpdateProfile();
  const handleUpdateSubmit = (data) => {
    const payload = { ...data, userId: user.id };
    updateProfileMutate(payload);
  };
  const handleCreateSubmit = (data) => {
    const payload = { ...data, userId: user.id };
    createProfileMutate(payload);
  };

  const fileInputRef = useRef(null);
  const { avatarUrl, bio, location, website } = profile;
  const isProfileEmpty = Object.values(profile).every(
    (value) => value == null || value === "",
  );

  //if user just new show form
  if (user && isProfileEmpty) {
    return (
      <>
        <h1 className="text-center text-shadow-fuchsia-200">Edit Profile</h1>
        <ProfileForm
          user={user}
          register={register}
          errors={errors}
          onSubmit={handleCreateSubmit}
          handleSubmit={handleSubmit}
        />
      </>
    );
  }

  const handleButtonClick = () => {
    fileInputRef.current.click(); // programmatically open file picker
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      // upload it
    }
  };
  const handleEditProfile = () => setEditing(true);

  return (
    <div
      className={`flex flex-col items-center relative ${ProfileCardStyle}text-stone-300`}
    >
      <div>
        {showPreview && (
          <Modal isOpen={showPreview}>
            <div className="bg-slate-800 flex flex-col items-center  p-2">
              <button
                className="relative left-[45%] text-yellow-200"
                onClick={() => setShowPreview(false)}
                about="close image preview"
              >
                <IoMdCloseCircle
                  aria-hidden="true"
                  className={`fill-yellow-200 hover:fill-red-600 ${iconStyle}`}
                />
              </button>

              <img
                src={`${avatarUrl}`}
                alt="profile"
                className=" w-full h-full w-max-[80%] h-max-[80%] object-cover rounded-sm"
              />

              <button
                className=" relative left-[30%] "
                aria-label="download image"
                title="Download image"
              >
                <MdDownloadForOffline
                  aria-hidden="true"
                  className={`fill-yellow-200  hover:fill-green-400 ${iconStyle}`}
                />
              </button>
            </div>
          </Modal>
        )}
        {!editing && (
          <>
            <div className="relative -top-5 -right-10 flex justify-end w-full gap-2 p-0.5 ">
              {" "}
              <button
                aria-label="edit profile "
                title="edit profile"
                onClick={handleEditProfile}
              >
                <MdModeEdit
                  aria-hidden="true"
                  className={`fill-yellow-200 hover:fill-green-400 ${iconStyle}`}
                />
              </button>
              <button onClick={onClose} aria-label="close profile modal">
                <IoMdCloseCircle
                  aria-hidden="true"
                  className={`fill-yellow-200 hover:fill-red-600 ${iconStyle}`}
                />
              </button>
            </div>
            <div className="relative w-max">
              {/* profile image */}
              <button
                onClick={() => setShowPreview(true)}
                aria-label="preview profile picture"
                title="click to Preview image"
              >
                <img
                  src={`${avatarUrl}`}
                  alt="profile"
                  className="rounded-full w-20 h-20 object-cover ring-1 ring-green-500 ring-offset-1"
                />
              </button>
              {/* upload image button */}
              <button
                className="absolute bottom-2 -right-1 z-10 "
                aria-label="upload-profile-picture"
                title="upload profile image"
                onClick={handleButtonClick}
              >
                <RiImageEditFill
                  aria-hidden="true"
                  className={` fill-green-400 hover:fill-yellow-500 ${iconStyle}`}
                />
              </button>
              <input
                type="file"
                accept="image/*"
                name="userPic"
                id="userPic"
                ref={fileInputRef}
                hidden
                onChange={handleFileChange}
              />
            </div>
          </>
        )}
      </div>

      {isSelf && editing && (
        <>
          <button
            onClick={() => setEditing(false)}
            aria-label="close edit form "
            className="absolute top-0 right-0"
          >
            <IoMdCloseCircle
              aria-hidden="true"
              className={`fill-yellow-200 hover:fill-red-600 ${iconStyle}`}
            />
          </button>
          <h1 className="text-center text-shadow-indigo-100">Edit Profile</h1>
          <ProfileForm
            user={user}
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            onSubmit={handleUpdateSubmit}
          />
        </>
      )}

      {user && !editing && (
        <div className="flex flex-col items-start">
          <p className={labelStyle}>Bio</p>
          <p className={infoStyle}>{bio}</p>
          <p className={labelStyle}>Location</p>
          <p className={infoStyle}>{location}</p>
          <p className={labelStyle}>website</p>
          <p className={infoStyle}>{website}</p>
        </div>
      )}
    </div>
  );
}

export default ProfileCard;

import { useRef, useState } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { useForm } from "react-hook-form";

import { ProfileCardStyle } from "../../../styles.js";

import { RiImageEditFill } from "react-icons/ri";
import Modal from "./Modal.jsx";

const labelStyle = `font-semibold text-xs text-amber-200 tracking-wide mb-1`;
const infoStyle = `text-xs text-stone-300 [text-shadow:0_0_12px_rgba(59,130,246,1]`;
const iconStyle = `  transition-all duration-200 cursor-pointer`;
const formLabelStyle = `font-semibold text-md text-amber-200 tracking-wide `;

const inputStyle = `w-full px-4 sm:py-2 rounded-lg bg-white/10 border border-white/20 text-gray-100
   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
   focus:border-transparent backdrop-blur-sm`;

//accept flag to show edit button if user is logged in
function ProfileCard({ isSelf = false, user, onClose }) {
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(false);

  const fileInputRef = useRef(null);

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
                src="/images/jet.jpg"
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
                  src="/images/jet.jpg"
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
          <EditProfile user={user} />
        </>
      )}

      {user && !editing && (
        <div className="flex flex-col items-start">
          <p className={labelStyle}>Bio</p>
          <p className={infoStyle}>I'm a web developer</p>
          <p className={labelStyle}>Location</p>
          <p className={infoStyle}>Addis Abeba</p>
          <p className={labelStyle}>website</p>
          <p className={infoStyle}>https://google.com</p>
          <p>Joined</p>
          <p>2023</p>
        </div>
      )}
    </div>
  );
}

function EditProfile({ user }) {
  const { register, handleSubmit, formState } = useForm();
  const { errors } = formState;
  const onSubmit = (data) => {
    console.log(data);
  };
  return (
    <form
      autoComplete="on"
      className="flex flex-col items-center gap-2 w-full h-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label
        htmlFor="userName"
        area-label="userName"
        className={formLabelStyle}
      >
        Name
      </label>
      <input
        type="text"
        name="userName"
        id="userName"
        className={inputStyle}
        {...register("name", {
          minLength: { value: 2, message: "Name is too short" },
        })}
      />
      {errors.name && (
        <p className="text-red-500 text-xs">{errors.name.message}</p>
      )}
      <label htmlFor="userBio" aria-label="userBio" className={formLabelStyle}>
        Bio
      </label>
      <input
        type="text"
        name="userBio"
        id="userBio"
        className={inputStyle}
        {...register("userBio", {
          minLength: { value: 2, message: "Bio is too short" },
          maxLength: { value: 100, message: "Bio is too long" },
        })}
      />
      {errors.userBio && (
        <p className="text-red-500 text-xs">{errors.userBio.message}</p>
      )}
      <label
        htmlFor="userLocation"
        aria-label="userLocation"
        className={formLabelStyle}
      >
        Location
      </label>
      <input
        type="text"
        name="userLocation"
        id="userLocation"
        className={inputStyle}
        {...register("userLocation", {
          minLength: { value: 2, message: "Location is too short" },
          maxLength: {
            value: 100,
            message: "Location  too long.",
          },
        })}
      />
      {errors.userLocation && (
        <p className="text-red-500 text-xs">{errors.userLocation.message}</p>
      )}
      <label
        htmlFor="userWebsite"
        aria-label="userWebsite"
        className={formLabelStyle}
      >
        Website
      </label>
      <input
        type="text"
        name="userWebsite"
        id="userWebsite"
        className={inputStyle}
        {...register("userWebsite", {
          minLength: { value: 2, message: "Website is too short" },
          maxLength: { value: 100, message: "Website is too long" },
        })}
      />
      {errors.userWebsite && (
        <p className="text-red-500 text-xs">{errors.userWebsite.message}</p>
      )}
      <button type="submit" className="w-full bg-pink-600 rounded-sm py-2">
        Save
      </button>
    </form>
  );
}

export default ProfileCard;

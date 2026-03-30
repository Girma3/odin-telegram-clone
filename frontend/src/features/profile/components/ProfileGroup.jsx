import { useRef, useState } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { useForm } from "react-hook-form";

import { ProfileCardStyle } from "../../../styles.js";

import { RiImageEditFill } from "react-icons/ri";
import Modal from "./Modal.jsx";
import GroupForm from "../../group/components/GroupForm.jsx";

const labelStyle = `font-semibold text-xs text-amber-200 tracking-wide mb-1`;
const infoStyle = `text-xs text-stone-300 [text-shadow:0_0_12px_rgba(59,130,246,1]`;
const iconStyle = `  transition-all duration-200 cursor-pointer`;

//accept flag to show edit button if user is logged in
function ProfileGroup({ isAdmin = true, group, onClose }) {
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

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
      className={`flex flex-col items-center relative ${ProfileCardStyle}text-stone-300 w-max`}
    >
      <div>
        {showPreview && (
          <Modal isOpen={showPreview} onClose={() => setShowPreview(false)}>
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
                loading="lazy"
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
                  alt="group-profile"
                  className="rounded-full w-20 h-20 object-cover ring-1 ring-green-500 ring-offset-1"
                  loading="laxy"
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

      {isAdmin && editing && (
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
          {/* edit group form */}
          <GroupForm
            onSubmit={handleSubmit(onSubmit)}
            register={register}
            errors={errors}
            isEdit={editing}
          />
        </>
      )}

      {!showPreview && !editing && (
        <div className="flex flex-col items-start">
          <p className={labelStyle}>Description</p>
          <p className={infoStyle}>Great group</p>
          <p className={labelStyle}>website</p>
          <p className={infoStyle}>https://google.com</p>
          <p>Created</p>
          <p>2023</p>
        </div>
      )}
    </div>
  );
}

export default ProfileGroup;

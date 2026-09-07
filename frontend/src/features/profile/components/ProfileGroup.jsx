import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdModeEdit } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { RiExternalLinkFill, RiImageEditFill } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Modal from "./Modal.jsx";
import GroupForm from "../../group/components/GroupForm.jsx";
import {
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from "../../group/hooks/useGroups.js";

const LABEL_STYLE =
  "text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-0.5";
const INFO_STYLE = "text-[14px] text-neutral-100 leading-relaxed font-normal";

function ProfileGroup({ isAdmin, group, hasGroup, userId, onClose }) {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { avatarUrl, bio, website } = group?.profile || {};

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: useMemo(
      () => ({
        name: group?.name || "",
        bio: bio || "",
        website: website || "",
      }),
      [group?.name, bio, website],
    ),
  });

  // Track state adjustments cleanly without recursive re-render bugs
  useEffect(() => {
    if (group) {
      reset({
        name: group.name || "",
        bio: group.profile?.bio || "",
        website: group.profile?.website || "",
      });
    }
  }, [group, reset]);

  const createGroupMutation = useCreateGroup({
    onSuccess: () => {
      toast.success("Group created successfully");
      setEditing(false);
      onClose?.();
    },
    onError: () => {
      toast.error("Error creating group. Please try again.");
    },
  });
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();

  const handleGroupUpdate = useCallback(
    async (data) => {
      if (!data || !group?.id) return;
      const payload = { groupId: group.id, ...data };

      try {
        // 1. Wait for server response using the Promise variant
        await updateGroupMutation.mutateAsync(payload);

        // 2. Clear state on genuine network completion
        setEditing(false);
        toast.success("Group updated successfully");

        onClose?.(); //close modal
      } catch (error) {
        // 3. Keep editing open if the database genuinely rejects the save
        toast.error("Error updating group. Please try again.");
      }
    },
    [group?.id, updateGroupMutation],
  );

  const handleCreateGroup = useCallback(
    (data) => {
      if (!data) return;
      createGroupMutation.mutate(data);
    },
    [createGroupMutation],
  );
  const handleDeleteGroup = useCallback(() => {
    if (!group?.id) return;
    deleteGroupMutation.mutate(group.id, {
      onSuccess: () => toastNotify("success", "Group deleted successfully"),
      onError: () => toastNotify("error", "Error deleting group"),
    });
  }, [group?.id, deleteGroupMutation]);
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate file upload transaction pipeline smoothly
      setTimeout(() => {
        toast.info("Avatar upload feature coming soon");
        setIsUploading(false);
      }, 1500);
    }
  };

  const handleClose = useCallback(() => {
    onClose?.();
    reset();
    setEditing(false);
  }, [onClose, reset]);

  // Initial Form View State Logic for Empty Groups
  if (!group && !hasGroup && userId) {
    return (
      <div className="w-full max-w-sm mx-auto bg-neutral-900 border border-white/10 p-5 rounded-2xl shadow-2xl backdrop-blur-xl text-neutral-200 animate-fade-in">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-base font-semibold text-neutral-100 tracking-wide">
            Create New Group
          </h1>
          <button
            onClick={handleClose}
            className="text-neutral-500 hover:text-red-400 p-1 rounded-lg hover:bg-white/5 transition-all"
            aria-label="Close form container layout"
          >
            <IoMdCloseCircle className="w-5 h-5" />
          </button>
        </div>
        <GroupForm
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={handleCreateGroup}
          isSubmitting={createGroupMutation.isPending}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-neutral-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col relative text-neutral-200 animate-fade-in">
      {/* Lightbox Preview Modal View Node */}
      {showPreview && avatarUrl && (
        <Modal isOpen={showPreview} onClose={() => setShowPreview(false)}>
          <div className="relative flex flex-col items-center p-2 bg-neutral-950/95 backdrop-blur-2xl rounded-2xl max-w-md w-full">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors bg-neutral-900 p-1.5 rounded-full border border-white/10 shadow-lg"
              aria-label="Close layout image preview frame"
            >
              <IoMdCloseCircle className="w-5 h-5" />
            </button>
            <img
              src={avatarUrl}
              alt={group?.name || "Group"}
              className="w-full h-auto max-h-[70vh] object-contain rounded-xl mt-8 mb-4 shadow-xl"
            />
          </div>
        </Modal>
      )}

      {/* Profile Header Control Panel Layout */}
      <div className="p-4 flex flex-wrap items-center justify-between border-b border-white/5 bg-white/5">
        <h2 className="font-semibold text-base tracking-wide text-neutral-100">
          {editing ? "Edit Group Details" : group?.name || "Group Info"}
        </h2>
        <div className="flex items-center gap-1">
          {isAdmin && !editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
                aria-label="Toggle parameter editing active view"
                title="Edit Group"
              >
                <MdModeEdit aria-hidden="true" className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteGroup}
                title="Delete Group"
                aria-label="Delete Group"
                className="flex items-center gap-2  bg-zinc-900 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 text-xs font-semibold rounded-xl border border-zinc-800 hover:border-rose-900/40 transition duration-200"
              >
                {" "}
                <MdDelete aria-hidden="true" className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
            aria-label="Terminate context modal wrapper loop"
          >
            <IoMdCloseCircle aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Primary Context Container Switch Block */}
      {isAdmin && editing ? (
        <div className="p-5 flex-1 overflow-y-auto relative">
          <GroupForm
            register={register}
            errors={errors}
            handleSubmit={handleSubmit}
            onSubmit={handleGroupUpdate}
            isSubmitting={updateGroupMutation.isPending}
          />
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
        <div className="p-6 flex flex-col items-center flex-1">
          {/* Cover Avatar Node Area Wrapper */}
          <div className="relative mb-5 group">
            <button
              onClick={() => avatarUrl && setShowPreview(true)}
              disabled={!avatarUrl}
              className="focus:outline-none block relative rounded-full p-1 border border-white/10 shadow-lg active:scale-95 transition-transform"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={group?.name}
                  className="rounded-full w-24 h-24 object-cover ring-4 ring-emerald-500/20"
                />
              ) : (
                <div className="rounded-full w-24 h-24 bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold text-2xl uppercase tracking-wider">
                  {group?.name ? group.name.slice(0, 2) : "GR"}
                </div>
              )}
            </button>

            {isAdmin && (
              <div className="absolute bottom-0 right-0 bg-neutral-950 p-1.5 rounded-full border border-white/10 shadow-md">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 active:scale-90 transition-all focus:outline-none disabled:opacity-50"
                  aria-label="Upload alternative image file"
                >
                  <RiImageEditFill className="w-3.5 h-3.5" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  hidden
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-neutral-100 tracking-wide mb-5">
            {group?.name || "Community Hub"}
          </h3>

          {/* Core Descriptive Text Grid Values Block */}
          <div className="w-full space-y-4 border-t border-white/5 pt-5 flex-1">
            <InfoItem
              label="Description"
              value={bio}
              placeholder="No channel descriptions provided."
            />
            <InfoItem label="Website Link" value={website} isLink={true} />
          </div>

          {/* Action Trigger Group Area Footer Container */}
          <div className="w-full mt-6 pt-4 border-t border-white/5 space-y-2">
            {group?.id && (
              <Link
                onClick={() => onClose?.()}
                to={`/group/${group.id}`}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all font-medium text-sm shadow-lg shadow-blue-600/10"
              >
                <span>View Group Hub</span>
                <RiExternalLinkFill className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
  isLink = false,
  placeholder = "No information provided.",
}) {
  if (!value) {
    return (
      <div className="flex flex-col">
        <span className={LABEL_STYLE}>{label}</span>
        <span className="text-sm text-neutral-500 italic">{placeholder}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className={LABEL_STYLE}>{label}</span>
      {isLink ? (
        /* Fixed: Removed the broken extra closing tag */
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${INFO_STYLE} text-blue-500 hover:underline`}
        >
          {value}
        </a>
      ) : (
        <span className={INFO_STYLE}>{value}</span>
      )}
    </div>
  );
}

export default ProfileGroup;

import { GroupSchema } from "../middlewares/validation/schema-validation.js";
import {
  createGroup,
  getGroupById,
  getGroupByName,
  getAllGroups,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  getGroupMembers,
  getGroupPosts,
  isGroupMember,
  isGroupOwner,
  getUserGroupsCount,
} from "../models/group-queries.js";

// Create a new group
async function createNewGroup(req, res) {
  const result = GroupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: "Invalid group data" });
  }
  const ownerId = req.user.id;

  const { name, ...profileData } = result.data;
  try {
    //check if group exist with that name
    const isGroupExist = await getGroupByName(name);
    if (isGroupExist) {
      return res.status(400).json({ message: "Group name already exists" });
    }
    //for now user can only have one group check that
    const isUserGroupOwner = await getUserGroupsCount(ownerId);
    if (isUserGroupOwner > 0) {
      return res.status(400).json({ message: "You can only have one group" });
    }
    const group = await createGroup(ownerId, name, profileData);
    return res.status(201).json(group);
  } catch (error) {
    console.error(error);
    if (error.message.includes("Unique constraint")) {
      return res.status(400).json({ message: "Group name already exists" });
    }
    return res
      .status(500)
      .json({ message: `Failed to create group: ${error.message}` });
  }
}

// Get group by ID
async function getGroup(req, res) {
  const { groupId } = req.params;

  try {
    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    return res.json(group);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get group: ${error.message}` });
  }
}

// Get group by name
async function getGroupByGroupName(req, res) {
  const { name } = req.params;

  try {
    const group = await getGroupByName(name);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    return res.json(group);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get group: ${error.message}` });
  }
}

// Get all groups
async function getAllGroupsHandler(req, res) {
  try {
    const groups = await getAllGroups();
    return res.json(groups);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get groups: ${error.message}` });
  }
}

// Update group
async function updateGroupHandler(req, res) {
  const { groupId } = req.params;
  const { name, bio, avatarUrl, location, website } = req.body;

  try {
    // Check if user is the owner
    const isOwner = await isGroupOwner(groupId, req.user.id);
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Only group owner can update the group" });
    }

    const updates = {};
    if (name) updates.name = name;

    // Handle profile updates
    if (bio || avatarUrl || location || website) {
      const profileUpdates = {};
      if (bio !== undefined) profileUpdates.bio = bio;
      if (avatarUrl !== undefined) profileUpdates.avatarUrl = avatarUrl;
      if (location !== undefined) profileUpdates.location = location;
      if (website !== undefined) profileUpdates.website = website;

      // Get the group to find profile ID
      const group = await getGroupById(groupId);
      if (group?.profile) {
        // Update existing profile
        const { updateProfile } =
          await import("../models/user-query/profile-query.js");
        await updateProfile(group.profile.id, profileUpdates);
      }
    }

    const updatedGroup = await updateGroup(groupId, updates);
    return res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    if (error.message.includes("Unique constraint")) {
      return res.status(400).json({ message: "Group name already exists" });
    }
    return res
      .status(500)
      .json({ message: `Failed to update group: ${error.message}` });
  }
}

// Delete group
async function deleteGroupHandler(req, res) {
  const { groupId } = req.params;

  try {
    // Check if user is the owner
    const isOwner = await isGroupOwner(groupId, req.user.id);
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Only group owner can delete the group" });
    }

    const group = await deleteGroup(groupId);
    return res.json({ message: "Group deleted successfully", group });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to delete group: ${error.message}` });
  }
}

// Add member to group
async function addMemberToGroup(req, res) {
  const { groupId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Check if user is the owner or already a member
    const isOwner = await isGroupOwner(groupId, req.user.id);
    const isMember = await isGroupMember(groupId, req.user.id);

    if (!isOwner && !isMember) {
      return res
        .status(403)
        .json({ message: "Only group members can invite new members" });
    }

    const member = await addMember(groupId, userId);
    return res.status(201).json(member);
  } catch (error) {
    console.error(error);
    if (error.message.includes("already a member")) {
      return res.status(400).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: `Failed to add member: ${error.message}` });
  }
}

// Remove member from group
async function removeMemberFromGroup(req, res) {
  const { groupId, userId } = req.params;

  try {
    // Check if user is the owner or removing themselves
    const isOwner = await isGroupOwner(groupId, req.user.id);
    const isSelf = req.user.id === userId;

    if (!isOwner && !isSelf) {
      return res.status(403).json({
        message:
          "Only group owner or the member themselves can remove a member",
      });
    }

    await removeMember(groupId, userId);
    return res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to remove member: ${error.message}` });
  }
}

// Get group members
async function getMembers(req, res) {
  const { groupId } = req.params;

  try {
    const members = await getGroupMembers(groupId);
    return res.json(members);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get members: ${error.message}` });
  }
}

// Get group posts
async function getPosts(req, res) {
  const { groupId } = req.params;

  try {
    const posts = await getGroupPosts(groupId);
    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get posts: ${error.message}` });
  }
}

// Join group (current user joins)
async function joinGroup(req, res) {
  const { groupId } = req.params;

  try {
    // Check if already a member
    const isMember = await isGroupMember(groupId, req.user.id);
    if (isMember) {
      return res
        .status(400)
        .json({ message: "Already a member of this group" });
    }

    // Check if user is the owner
    const isOwner = await isGroupOwner(groupId, req.user.id);
    if (isOwner) {
      return res
        .status(400)
        .json({ message: "You are the owner of this group" });
    }

    const member = await addMember(groupId, req.user.id);
    return res.status(201).json(member);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to join group: ${error.message}` });
  }
}

// Leave group (current user leaves)
async function leaveGroup(req, res) {
  const { groupId } = req.params;

  try {
    // Check if user is the owner
    const isOwner = await isGroupOwner(groupId, req.user.id);
    if (isOwner) {
      return res.status(400).json({
        message:
          "Group owner cannot leave. Transfer ownership or delete the group instead.",
      });
    }

    await removeMember(groupId, req.user.id);
    return res.json({ message: "Successfully left the group" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to leave group: ${error.message}` });
  }
}

export {
  createNewGroup,
  getGroup,
  getGroupByGroupName,
  getAllGroupsHandler,
  updateGroupHandler,
  deleteGroupHandler,
  addMemberToGroup,
  removeMemberFromGroup,
  getMembers,
  getPosts,
  joinGroup,
  leaveGroup,
};

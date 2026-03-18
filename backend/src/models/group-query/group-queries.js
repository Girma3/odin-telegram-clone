import prismaGlobal from "../pool.js";

// Create a new group
async function createGroup(ownerId, name, profileData = {}) {
  try {
    const group = await prismaGlobal.groups.create({
      data: {
        name,
        ownerId,
        profile: profileData
          ? {
              create: {
                ...profileData,
              },
            }
          : undefined,
      },
      include: {
        profile: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    return group;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to create group: ${error.message}`);
  }
}

// Get group by ID
async function getGroupById(groupId) {
  try {
    const group = await prismaGlobal.groups.findUnique({
      where: {
        id: groupId,
      },
      include: {
        profile: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });
    return group;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get group: ${error.message}`);
  }
}

// Get group by name
async function getGroupByName(name) {
  try {
    const group = await prismaGlobal.groups.findUnique({
      where: {
        name,
      },
      include: {
        profile: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });
    return group;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get group by name: ${error.message}`);
  }
}

// Get all groups
async function getAllGroups() {
  try {
    const groups = await prismaGlobal.groups.findMany({
      include: {
        profile: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return groups;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get all groups: ${error.message}`);
  }
}

// Update group
async function updateGroup(groupId, updates) {
  try {
    const group = await prismaGlobal.groups.update({
      where: {
        id: groupId,
      },
      data: updates,
      include: {
        profile: true,
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    return group;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to update group: ${error.message}`);
  }
}

// Delete group
async function deleteGroup(groupId) {
  try {
    // First delete all related data
    await prismaGlobal.$transaction([
      // Delete group members
      prismaGlobal.groupMembers.deleteMany({
        where: { groupId },
      }),
      // Delete posts and their related data
      prismaGlobal.posts.deleteMany({
        where: { groupId },
      }),
      // Delete group profile
      prismaGlobal.profile.deleteMany({
        where: { groupId },
      }),
    ]);

    // Then delete the group
    const group = await prismaGlobal.groups.delete({
      where: {
        id: groupId,
      },
    });
    return group;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to delete group: ${error.message}`);
  }
}

// Add member to group
async function addMember(groupId, userId) {
  try {
    const member = await prismaGlobal.groupMembers.create({
      data: {
        groupId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return member;
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === "P2002") {
      throw new Error("User is already a member of this group");
    }
    console.error(error);
    throw new Error(`Failed to add member: ${error.message}`);
  }
}

// Remove member from group
async function removeMember(groupId, userId) {
  try {
    const member = await prismaGlobal.groupMembers.delete({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });
    return member;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to remove member: ${error.message}`);
  }
}

// Get group members
async function getGroupMembers(groupId) {
  try {
    const members = await prismaGlobal.groupMembers.findMany({
      where: {
        groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            profile: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });
    return members;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get group members: ${error.message}`);
  }
}

// Get group posts
async function getGroupPosts(groupId) {
  try {
    const posts = await prismaGlobal.posts.findMany({
      where: {
        groupId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });
    return posts;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get group posts: ${error.message}`);
  }
}

// Check if user is member of group
async function isGroupMember(groupId, userId) {
  try {
    const member = await prismaGlobal.groupMembers.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });
    return !!member;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to check membership: ${error.message}`);
  }
}

// Check if user is owner of group
async function isGroupOwner(groupId, userId) {
  try {
    const group = await prismaGlobal.groups.findUnique({
      where: {
        id: groupId,
      },
      select: {
        ownerId: true,
      },
    });
    return group?.ownerId === userId;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to check ownership: ${error.message}`);
  }
}
//check how many members are in a group
async function getGroupMembersCount(groupId) {
  try {
    const count = await prismaGlobal.groupMembers.count({
      where: {
        groupId,
      },
    });
    return count;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get group members count: ${error.message}`);
  }
}
//check if how many groups user own
async function getUserGroupsCount(userId) {
  try {
    const count = await prismaGlobal.groups.count({
      where: {
        ownerId: userId,
      },
    });
    return count;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get user groups count: ${error.message}`);
  }
}

export {
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
  getGroupMembersCount,
  getUserGroupsCount,
};

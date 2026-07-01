import prismaGlobal from "../pool.js";

async function createUser(userName, email) {
  try {
    const data = await prismaGlobal.user.create({
      data: {
        username: userName,
        email: email,
      },
    });

    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message, "Failed to create user");
  }
}
async function getUserById(userId) {
  try {
    const data = await prismaGlobal.user.findUnique({
      where: {
        id: userId,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message, "Failed to get user");
  }
}
async function getUserByUsername(username) {
  try {
    const data = await prismaGlobal.user.findUnique({
      where: {
        username: username,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message, "Failed to get user");
  }
}
async function getUserByUserByEmail(userEmail) {
  try {
    const data = await prismaGlobal.user.findUnique({
      where: {
        email: userEmail,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(error.message, "Failed to get user");
  }
}

async function deleteUserById(userId) {
  try {
    // Execute everything inside an atomic transaction block
    const data = await prismaGlobal.$transaction(async (tx) => {
      //  Resolve Group Ownerships (Telegram-style handoff)
      const ownedGroups = await tx.groups.findMany({
        where: { ownerId: userId },
        include: { members: true },
      });

      for (const group of ownedGroups) {
        // Find an alternate member to inherit ownership
        const nextOwner = group.members.find(
          (member) => member.userId !== userId,
        );

        if (nextOwner) {
          await tx.groups.update({
            where: { id: group.id },
            data: { ownerId: nextOwner.userId },
          });
        } else {
          // No one else is in the group, safely dissolve it
          await tx.groups.delete({
            where: { id: group.id },
          });
        }
      }

      //  Revoke ongoing sessions (Instantly logs them out everywhere)
      await tx.refreshToken.deleteMany({
        where: { userId: userId },
      });

      //  Purge personal identifying configurations (Privacy compliance)
      await tx.profile.deleteMany({
        where: { userId: userId },
      });

      // 4. Soft-delete and Anonymize the main User row
      const anonymizedUser = await tx.user.update({
        where: { id: userId },
        data: {
          username: "Deleted Account",
          email: `deleted-${userId}-${Date.now()}@telegramclone.internal`, // Unblocks their email address for re-registration
          status: "OFFLINE",
          isDeleted: true,
        },
      });

      return anonymizedUser;
    });

    return data;
  } catch (error) {
    console.error("Database Layer Error [deleteUserById]:", error);

    throw new Error(error.message || "Failed to delete user");
  }
}

async function getAllUsers() {
  try {
    const data = await prismaGlobal.user.findMany();
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message, "Failed to get all users");
  }
}
async function updateUsername(userId, username) {
  if (!userId || !username) {
    throw new Error("User ID and username are required to update username.");
  }
  try {
    const data = await prismaGlobal.user.update({
      where: {
        id: userId,
      },
      data: {
        username: username,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message, "Failed to update username");
  }
}
async function updateUserPresenceStatus(userId, status) {
  if (!userId) {
    throw new Error("User ID is required to update presence status.");
  }
  try {
    const data = await prismaGlobal.user.update({
      where: {
        id: userId,
      },
      data: {
        status: status,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message, "Failed to update presence status");
  }
}

export {
  createUser,
  getUserById,
  getUserByUsername,
  getUserByUserByEmail,
  getAllUsers,
  updateUsername,
  deleteUserById,
  updateUserPresenceStatus,
};

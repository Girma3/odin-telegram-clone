import prismaGlobal from "../pool.js";
async function createProfile(userId = null, groupId = null, data = {}) {
  try {
    const { userId: _, groupId: __, ...rest } = data; // remove duplicates
    //  empty strings to null
    const cleanData = Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ]),
    );
    if (userId) {
      const profile = await prismaGlobal.profile.upsert({
        where: { userId }, // unique constraint
        update: cleanData, // update if exists
        create: { userId, ...cleanData }, // create if not
      });

      return profile;
    } else if (groupId) {
      const profile = await prismaGlobal.profile.upsert({
        where: { groupId }, // unique constraint
        update: cleanData, // update if exists
        create: { groupId, ...cleanData }, // create if not
      });
      return profile;
    } else {
      throw new Error("Either userId or groupId must be provided");
    }
  } catch (error) {
    console.error("Prisma error details:", error);
    // If uniqueness constraint fails, Prisma throws a P2002 error
    if (error.code === "P2002") {
      throw new Error("Profile already exists for this user or group");
    }
    console.error(error);
    throw new Error(`Failed to create profile: ${error.message}`);
  }
}

async function updateProfile(profileId, updates) {
  if (!profileId) {
    throw new Error("Profile ID is required to update profile.");
  }
  try {
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ]),
    );
    const updatedProfile = await prismaGlobal.profile.update({
      where: { id: profileId },
      data: cleanUpdates,
    });

    return updatedProfile;
  } catch (error) {
    console.error("Prisma error details:", error);
    if (error.code === "P2025") {
      throw new Error("Profile not found");
    }
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

async function deleteProfile(profileId) {
  try {
    const data = await prismaGlobal.profile.delete({
      where: {
        id: profileId,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(error.message, "Failed to delete profile");
  }
}
async function getProfileById(profileId) {
  try {
    const data = await prismaGlobal.profile.findUnique({
      where: {
        id: profileId,
      },
      include: {
        user: true,
        group: true,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message, "Failed to get profile");
  }
}
async function getProfileByUserId(userId) {
  try {
    const data = await prismaGlobal.profile.findUnique({
      where: {
        userId: userId,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message, "Failed to get profile");
  }
}

export {
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileById,
  getProfileByUserId,
};

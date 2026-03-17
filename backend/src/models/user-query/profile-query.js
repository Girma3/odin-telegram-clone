import prismaGlobal from "../pool.js";
async function createProfile(userId = null, groupId = null, data = {}) {
  try {
    if (userId) {
      // Try to create profile directly
      const profile = await prismaGlobal.profile.create({
        data: {
          userId,
          ...data,
        },
      });
      return profile;
    } else if (groupId) {
      const profile = await prismaGlobal.profile.create({
        data: {
          groupId,
          ...data,
        },
      });
      return profile;
    } else {
      throw new Error("Either userId or groupId must be provided");
    }
  } catch (error) {
    // If uniqueness constraint fails, Prisma throws a P2002 error
    if (error.code === "P2002") {
      throw new Error("Profile already exists for this user or group");
    }
    console.error(error);
    throw new Error(`Failed to create profile: ${error.message}`);
  }
}

async function updateProfile(profileId, updates) {
  try {
    const updatedProfile = await prismaGlobal.profile.update({
      where: { id: profileId },
      data: updates,
    });

    return updatedProfile;
  } catch (error) {
    console.error(error);
    throw new Error(error.message, "Failed to update profile");
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

export { createProfile, updateProfile, deleteProfile, getProfileById };

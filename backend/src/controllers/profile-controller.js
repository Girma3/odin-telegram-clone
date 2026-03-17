import {
  createProfile,
  updateProfile,
  deleteProfile,
  getProfile,
  getProfileById,
} from "../models/user-query/profile-query.js";
import { ProfileSchema } from "../middlewares/validation/schema-validation.js";
import { getUserById } from "../models/user-query/user-queries.js";

async function createProfileController(req, res) {
  const result = ProfileSchema.pick({
    userId: true,
    groupId: true,
    bio: true,
    avatarUrl: true,
    location: true,
    website: true,
  }).safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.message });
  }

  try {
    const profile = await createProfile(
      result.data.userId,
      result.data.groupId,
      result.data,
    );

    return res
      .status(201)
      .json({ message: "Profile created successfully", profile });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to create profile: ${error.message}` });
  }
}

async function updateProfileController(req, res) {
  const result = ProfileSchema.partial().safeParse(req.body);

  const { profileId } = req.params;

  if (!profileId) {
    return res
      .status(400)
      .json({ message: "Profile ID is required to update profile." });
  }

  if (!result.success) {
    return res.status(400).json({ message: result.error.message });
  }

  try {
    const isProfileExist = await getProfileById(profileId);
    if (!isProfileExist) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const profile = await updateProfile(profileId, result.data);
    return res
      .status(200)
      .json({ message: "Profile updated successfully", profile });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to update profile: ${error.message}` });
  }
}

async function deleteProfileController(req, res) {
  const { profileId } = req.params;
  if (!profileId) {
    return res
      .status(400)
      .json({ message: "User ID is required to delete profile." });
  }

  try {
    const profile = await deleteProfile(profileId);
    return res
      .status(200)
      .json({ message: "Profile deleted successfully", profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function getProfileController(req, res) {
  const { profileId } = req.params;
  if (!profileId) {
    return res
      .status(400)
      .json({ message: "profile ID is required to get profile." });
  }
  try {
    const profile = await getProfile(profileId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res
      .status(200)
      .json({ message: "Profile fetched successfully", profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export {
  createProfileController,
  updateProfileController,
  deleteProfileController,
  getProfileController,
};

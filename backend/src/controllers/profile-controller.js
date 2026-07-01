import {
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileById,
  getProfileByUserId,
} from "../models/user-query/profile-query.js";
import { ProfileSchema } from "../middlewares/validation/schema-validation.js";
import {
  getUserById,
  updateUsername,
} from "../models/user-query/user-queries.js";

async function createProfileController(req, res) {
  const result = ProfileSchema.safeParse(req.body);
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
    // console.log(profile.userId, "profile user id");

    const user = await getUserById(profile.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //check update name is different
    if (req.body.username && req.body.username !== user.username) {
      const updateName = await updateUsername(user.id, req.body.username);
    }

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
    return res.status(200).json({ message: "Profile deleted successfully" });
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
    const profile = await getProfileById(profileId);

    if (!profile) return res.status(404).json({ message: "Profile not found" });
    return res
      .status(200)
      .json({ message: "Profile fetched successfully", profile });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getProfileByUserIdController(req, res) {
  try {
    const { userId } = req.params; // or req.query depending on your route
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const profile = await getProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Controller error:", error);
    return res
      .status(500)
      .json({ message: `Failed to get profile: ${error.message}` });
  }
}

export {
  createProfileController,
  updateProfileController,
  deleteProfileController,
  getProfileController,
  getProfileByUserIdController,
};

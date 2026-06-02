import { getAccessToken as getToken } from "../../auth/services/authService";

const apiUrl = import.meta.env.VITE_API_URL;
/*profileRouter.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to the profile API" });
});
// Create profile (usually auto-created at signup, but you can expose it)
profileRouter.post("/", isUserAuthenticated, createProfileController);

// Get a profile by userId
profileRouter.get("/:profileId", isUserAuthenticated, getProfileController);

// Update a profile by userId
profileRouter.put("/:profileId", isUserAuthenticated, updateProfileController);

// Delete a profile by userId
profileRouter.delete(
  "/:profileId",
  isUserAuthenticated,
  deleteProfileController,
);*/
const createProfile = async (profile) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/profiles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const getProfile = async (profileId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/profiles/${profileId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};
const getProfileByUserId = async (userId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/profiles/user/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const updateProfile = async ({ profileId, ...profile }) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/profiles/${profileId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      `Error ${response.status}: ${result.message || "Unknown error at update profile"}`,
    );
  }

  return result;
};

const deleteProfile = async (profileId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/profiles/${profileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      `Error ${response.status}: ${result.message || "Unknown error at delete profile"}`,
    );
  }
  return result;
};
const getProfiles = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/profiles`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getProfiles,
  getProfileByUserId,
};

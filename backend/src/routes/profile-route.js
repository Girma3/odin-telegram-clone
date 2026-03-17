import express from "express";
import {
  createProfileController,
  updateProfileController,
  deleteProfileController,
  getProfileController,
} from "../controllers/profile-controller.js";
import { isUserAuthenticated } from "../controllers/auth-controller.js";

const profileRouter = express.Router();

profileRouter.get("/", (req, res) => {
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
);

export default profileRouter;

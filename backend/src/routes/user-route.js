import { Router } from "express";
import { isUserAuthenticated } from "../controllers/auth-controller.js";
import {
  getUserByIdController,
  getUserByUsernameController,
  getUserByEmailController,
  getAllUsersController,
  deleteUserByIdController,
} from "../controllers/user-controller.js";

const userRouter = Router({ mergeParams: true });

// Apply authentication to all routes
userRouter.use(isUserAuthenticated);

// Get user by ID
userRouter.get("/:userId", getUserByIdController);

// Get user by username
userRouter.get("/username/:username", getUserByUsernameController);

// Get user by email
userRouter.get("/email/:email", getUserByEmailController);

// Get all users
userRouter.get("/", getAllUsersController);

// Delete user by ID
userRouter.delete("/:userId", deleteUserByIdController);

export default userRouter;

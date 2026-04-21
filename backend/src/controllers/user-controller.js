import {
  getUserById,
  getUserByUsername,
  getUserByUserByEmail,
  getAllUsers,
  deleteUserById,
} from "../models/user-query/user-queries.js";

async function getUserByIdController(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required to get user" });
  }

  try {
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to get user: ${error.message}` });
  }
}

async function getUserByUsernameController(req, res) {
  const result = UserSchema.pick({
    username: true,
  }).safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.message });
  }

  const { username } = result.data;

  try {
    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to get user: ${error.message}` });
  }
}

async function getUserByEmailController(req, res) {
  const result = UserSchema.pick({
    email: true,
  }).safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: result.error.message });
  }
  const { email } = result.data;
  if (!email) {
    return res.status(400).json({ message: "Email is required to get user" });
  }

  try {
    const user = await getUserByUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to get user: ${error.message}` });
  }
}

async function getAllUsersController(req, res) {
  try {
    const users = await getAllUsers();
    return res
      .status(200)
      .json({ message: "Users fetched successfully", users });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to get users: ${error.message}` });
  }
}

async function deleteUserByIdController(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID is required to delete user" });
  }

  try {
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const removedUser = await deleteUserById(userId);
    if (!removedUser) {
      return res
        .status(404)
        .json({ message: "User not found or already deleted" });
    }
    return res
      .status(200)
      .json({ message: "User deleted successfully", removedUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Failed to delete user: ${error.message}` });
  }
}

export {
  getUserByIdController,
  getUserByUsernameController,
  getUserByEmailController,
  getAllUsersController,
  deleteUserByIdController,
};

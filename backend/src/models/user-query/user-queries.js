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
    const data = await prismaGlobal.user.delete({
      where: {
        id: userId,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
    throw new Error(error.message, "Failed to delete user");
  }
}

export {
  createUser,
  getUserById,
  getUserByUsername,
  getUserByUserByEmail,
  deleteUserById,
};

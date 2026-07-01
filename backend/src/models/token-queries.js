import prismaGlobal from "./pool.js";
async function saveRefreshToken(userId, refreshToken, expiresAt) {
  try {
    const data = await prismaGlobal.refreshToken.upsert({
      where: { userId }, // enforce one token per user
      create: { userId, token: refreshToken, expiresAt },
      update: { token: refreshToken, expiresAt },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to save refresh token: ${error.message}`);
  }
}

async function getTokenByUserId(userId) {
  try {
    const data = await prismaGlobal.refreshToken.findUnique({
      where: { userId },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get token: ${error.message}`);
  }
}

async function deleteTokenByUserId(userId) {
  try {
    const data = await prismaGlobal.refreshToken.delete({
      where: { userId },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to delete token: ${error.message}`);
  }
}
async function getTokenByToken(token) {
  try {
    const data = await prismaGlobal.refreshToken.findUnique({
      where: { token },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get token by token: ${error.message}`);
  }
}
async function deleteTokenByToken(token) {
  try {
    const data = await prismaGlobal.refreshToken.delete({
      where: { token },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to delete token by token: ${error.message}`);
  }
}

export {
  saveRefreshToken,
  getTokenByUserId,
  getTokenByToken,
  deleteTokenByToken,
  deleteTokenByUserId,
};

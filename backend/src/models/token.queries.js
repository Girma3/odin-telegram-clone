import prismaGlobal from "./pool.js";

async function saveRefreshToken(userId, refreshToken, expireAt) {
  try {
    const data = await prismaGlobal.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt: expireAt },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to save refresh token: ${error.message}`);
  }
}

async function getToken(token) {
  try {
    const data = await prismaGlobal.refreshToken.findUnique({
      where: {
        token: token,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get token: ${error.message}`);
  }
}
async function deleteToken(token) {
  try {
    const data = await prismaGlobal.refreshToken.delete({
      where: {
        token: token,
      },
    });
    return data;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to delete token: ${error.message}`);
  }
}

export { saveRefreshToken, getToken, deleteToken };

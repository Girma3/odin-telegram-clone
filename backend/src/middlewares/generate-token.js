import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

function generateUserTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "20d" },
  );

  return {
    accessToken,
    refreshToken,
    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

export default generateUserTokens;

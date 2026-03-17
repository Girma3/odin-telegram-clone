import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import jwt from "jsonwebtoken";
import { UserSchema } from "../middlewares/validation/schema-validation.js";
import generateUserTokens from "../middlewares/generate-token.js";
import {
  createUser,
  getUserByUserByEmail,
} from "../models/user-query/user-queries.js";

import {
  saveRefreshToken,
  getTokenByUserId,
  deleteTokenByUserId,
} from "../models/token-queries.js";

async function registerNewUser(req, res, next) {
  const result = UserSchema.pick({
    username: true,
    email: true,
  }).safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.message });
  }
  try {
    const { username, email } = result.data;

    const isUserExist = await getUserByUserByEmail(email);
    if (isUserExist) {
      return res
        .status(400)
        .json({ message: "User already exists by this email." });
    }

    const data = await createUser(username, email);

    return res.status(201).json(data);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to register user: ${error.message}` });
  }
}

async function loginUser(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const user = await getUserByUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const storedToken = await getTokenByUserId(user.id);

    if (storedToken && storedToken.expiresAt > new Date()) {
      // Always issue a fresh access token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return res.json({
        accessToken,
        refreshToken: storedToken.token,
        user,
      });
    }

    if (storedToken && storedToken.expiresAt < new Date()) {
      await deleteTokenByUserId(user.id);
    }

    // Generate new tokens
    const { accessToken, refreshToken, expireAt } = generateUserTokens(user);
    await saveRefreshToken(user.id, refreshToken, expireAt);

    return res.json({ accessToken, refreshToken, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Login failed: ${error.message}` });
  }
}

function isUserAuthenticated(req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Authentication error" });
    }
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;

    next();
  })(req, res, next); // important: invoke the returned function
}
async function refreshAccessToken(req, res) {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    // Verify JWT signature & expiry
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token exists in DB
    const storedToken = await prismaGlobal.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prismaGlobal.refreshToken.delete({ where: { token } });
      }
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: payload.id, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Rotate refresh token
    const newRefreshToken = jwt.sign(
      { id: payload.id, email: payload.email },
      process.env.JWT_SECRET,
      { expiresIn: "20d" },
    );

    // Save rotated refresh token
    await saveRefreshToken(
      payload.id,
      newRefreshToken,
      new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    );

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

async function logoutUser(req, res) {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    // Verify JWT signature
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token exists in DB and is not expired
    const storedToken = await getTokenByUserId(payload.id);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Delete token from DB
    await deleteTokenByUserId(payload.id);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

export {
  registerNewUser,
  loginUser,
  isUserAuthenticated,
  refreshAccessToken,
  logoutUser,
};

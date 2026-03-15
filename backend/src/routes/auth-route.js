import { Router } from "express";
import {
  registerNewUser,
  loginUser,
  isUserAuthenticated,
  refreshAccessToken,
  logoutUser,
} from "../controllers/auth-controller.js";

const authRouter = Router();

authRouter.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to the authentication API" });
});

authRouter.post("/signup", registerNewUser);
authRouter.post("/login", loginUser);
authRouter.post("/refresh", refreshAccessToken);
//only to check this isUserAuthenticated middle work
authRouter.get("/protected", isUserAuthenticated, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return res.status(200).json({ user: req.user });
});
authRouter.post("/logout", logoutUser);

export default authRouter;

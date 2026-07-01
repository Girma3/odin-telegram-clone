import express from "express";
import cors from "cors";

import passport from "./config/passport.js";
import authRouter from "./routes/auth-route.js";
import profileRouter from "./routes/profile-route.js";
import groupRouter from "./routes/group-route.js";
import groupPostRouter from "./routes/group-post-route.js";
import privatePostRouter from "./routes/private-post-route.js";
import notificationRouter from "./routes/notification-route.js";
import userRouter from "./routes/user-route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));

app.use(passport.initialize());

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to the API" });
});
app.use("/auth", authRouter);

//users management
app.use("/users", userRouter);
//profile for user and group
app.use("/profiles", profileRouter);
//group management
app.use("/groups", groupRouter);
//group post,comment,reaction
app.use("/posts", groupPostRouter);
//private chat post,comment,reaction
app.use("/private", privatePostRouter);
// Notifications
app.use("/notifications", notificationRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

export default app;

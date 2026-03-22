import express from "express";
import cors from "cors";
import http from "http";
import passport from "./config/passport.js";
import authRouter from "./routes/auth-route.js";
import profileRouter from "./routes/profile-route.js";
import groupRouter from "./routes/group-route.js";
import groupPostRouter from "./routes/group-post-route.js";
import privatePostRouter from "./routes/private-post-route.js";
import notificationRouter from "./routes/notification-route.js";
import attachWebSocketServer from "./sockets/server.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));

app.use(passport.initialize());

app.use("/auth", authRouter);

attachWebSocketServer(server);
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
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({ message: "Something went wrong in server!" });
});

export default app;

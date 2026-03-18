import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import authRouter from "./routes/auth-route.js";
import profileRouter from "./routes/profile-route.js";
import groupRouter from "./routes/group-route.js";
import groupPostRouter from "./routes/group-post-route.js";
import privatePostRouter from "./routes/private-post-route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });
app.use(passport.initialize());

app.use("/auth", authRouter);
//profile for user and group
app.use("/profiles", profileRouter);
//group management
app.use("/groups", groupRouter);
//group post,comment,reaction
app.use("/posts", groupPostRouter);
//private chat post,comment,reaction
app.use("/private", privatePostRouter);
app.use((err, req, res, next) => {
  console.error(err.stack);
  return res.status(500).json({ message: "Something went wrong in server!" });
});

export default app;

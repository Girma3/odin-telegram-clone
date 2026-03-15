import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { getUserById } from "../models/user-query/user-queries.js";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await getUserById(jwt_payload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: "User not found" });
      }
    } catch (err) {
      console.error(err);
      return done(err, false);
    }
  }),
);

export default passport;

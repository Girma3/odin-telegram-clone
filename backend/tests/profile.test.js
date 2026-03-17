import request from "supertest";
import app from "../src/app.js";
import prismaGlobal from "../src/models/pool.js";

const userName = `testUser_${Date.now()}`;
const userEmail = `test+${Date.now()}@example.com`;

describe("Auth Flow", () => {
  let accessToken;
  let refreshToken;
  let userId;
  let profileId;

  beforeAll(async () => {
    // Clean slate before each test
    await prismaGlobal.refreshToken.deleteMany({});
    await prismaGlobal.profile.deleteMany({});
    await prismaGlobal.user.deleteMany({});
  });

  it("should sign up a new user", async () => {
    const signupRes = await request(app)
      .post("/auth/signup")
      .send({ username: userName, email: userEmail });

    expect(signupRes.status).toBe(201);
    expect(signupRes.body).toHaveProperty("id");
    expect(signupRes.body).toMatchObject({
      username: userName,
      email: userEmail,
    });

    userId = signupRes.body.id;
  });

  it("should login an existing user", async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: userEmail });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
    expect(loginRes.body).toHaveProperty("refreshToken");
    expect(loginRes.body).toHaveProperty("user");

    accessToken = loginRes.body.accessToken;
    refreshToken = loginRes.body.refreshToken;
    userId = loginRes.body.user.id;
  });
  it("user should create profile", async () => {
    const profileRes = await request(app)
      .post("/profiles")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId: userId, bio: "cool bio" });

    expect(profileRes.status).toBe(201);
    expect(profileRes.body.profile).toHaveProperty("bio");
    expect(profileRes.body.profile).toHaveProperty("userId");
    expect(profileRes.body.profile).toHaveProperty("groupId");
    expect(profileRes.body.profile).toHaveProperty("avatarUrl");
    profileId = profileRes.body.profile.id;
  });
  it("should update profile", async () => {
    const profileRes = await request(app)
      .put(`/profiles/${profileId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ bio: "updated bio" });
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.profile.bio).toBe("updated bio");
    expect(profileRes.body.profile).toHaveProperty("userId");
  });
  it("should delete profile", async () => {
    const profileRes = await request(app)
      .delete(`/profiles/${profileId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(profileRes.status).toBe(200);
  });
  //negative test
  it("should not update a profile that does not exist", async () => {
    const profileRes = await request(app)
      .put(`/profiles/${profileId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ bio: "updated bio" });
    expect(profileRes.status).toBe(404);
  });
});

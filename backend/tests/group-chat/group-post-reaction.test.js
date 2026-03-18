import request from "supertest";
import app from "../../src/app.js";
import prismaGlobal from "../../src/models/pool.js";

// Test data
const userName = `reactionTestUser_${Date.now()}`;
const userEmail = `reactionTest_${Date.now()}@example.com`;
const groupName = `reactionTestGroup_${Date.now()}`;
const postText = "This is a test post for reactions";

describe("Group Post Reactions API", () => {
  let accessToken;
  let userId;
  let groupId;
  let postId;

  // Clean up function
  async function cleanup() {
    await prismaGlobal.notifications.deleteMany({});
    await prismaGlobal.reactions.deleteMany({});
    await prismaGlobal.comments.deleteMany({});
    await prismaGlobal.posts.deleteMany({});
    await prismaGlobal.privateChats.deleteMany({});
    await prismaGlobal.groupMembers.deleteMany({});
    await prismaGlobal.profile.deleteMany({});
    await prismaGlobal.groups.deleteMany({});
    await prismaGlobal.refreshToken.deleteMany({});
    await prismaGlobal.user.deleteMany({});
  }

  beforeAll(async () => {
    await cleanup();

    // Create user and login
    const signupRes = await request(app)
      .post("/auth/signup")
      .send({ username: userName, email: userEmail });

    userId = signupRes.body.id;

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: userEmail });

    accessToken = loginRes.body.accessToken;

    // Create a group first
    const groupRes = await request(app)
      .post("/groups")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: groupName, bio: "Test group for reactions" });

    groupId = groupRes.body.id;

    // Create a post for reactions
    const postRes = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ groupId, text: postText });

    postId = postRes.body.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe("Reaction Operations", () => {
    it("should add reaction to post", async () => {
      const response = await request(app)
        .post(`/posts/${postId}/reactions`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ emoji: "👍" });

      expect(response.status).toBe(201);
      expect(response.body.emoji).toBe("👍");
      expect(response.body.postId).toBe(postId);
      expect(response.body.userId).toBe(userId);
    });

    it("should get reactions for post", async () => {
      const response = await request(app).get(`/posts/${postId}/reactions`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should remove reaction from post", async () => {
      const response = await request(app)
        .delete(`/posts/${postId}/reactions`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Reaction removed successfully");
    });

    it("should toggle reaction - remove and add again", async () => {
      // Add reaction
      await request(app)
        .post(`/posts/${postId}/reactions`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ emoji: "❤️" });

      // Verify it was added
      let response = await request(app).get(`/posts/${postId}/reactions`);
      expect(response.body.length).toBeGreaterThan(0);

      // Add same reaction again to toggle (remove)
      response = await request(app)
        .post(`/posts/${postId}/reactions`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ emoji: "❤️" });

      // Should return message about removal
      expect(response.status).toBe(201);
    });

    it("should add different reaction to same post", async () => {
      // Add first reaction
      await request(app)
        .post(`/posts/${postId}/reactions`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ emoji: "👍" });

      // Add different reaction
      const response = await request(app)
        .post(`/posts/${postId}/reactions`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ emoji: "🎉" });

      expect(response.status).toBe(201);
      expect(response.body.emoji).toBe("🎉");
    });

    it("should not add reaction without emoji", async () => {
      const response = await request(app)
        .post(`/posts/${postId}/reactions`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });
});

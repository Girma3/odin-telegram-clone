import request from "supertest";
import app from "../../src/app.js";
import prismaGlobal from "../../src/models/pool.js";

// Test data
const userName = `commentTestUser_${Date.now()}`;
const userEmail = `commentTest_${Date.now()}@example.com`;
const groupName = `commentTestGroup_${Date.now()}`;
const postText = "This is a test post for comments";
const commentText = "This is a test comment";

describe("Group Post Comments API", () => {
  let accessToken;
  let userId;
  let groupId;
  let postId;

  // Clean up function
  async function cleanup() {
    await prismaGlobal.notifications.deleteMany({});
    await prismaGlobal.reactions.deleteMany({});
    await prismaGlobal.comments.deleteMany({});
    await prismaGlobal.privateChats.deleteMany({});
    await prismaGlobal.posts.deleteMany({});
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
      .send({ name: groupName, bio: "Test group for comments" });

    groupId = groupRes.body.id;

    // Create a post for comments
    const postRes = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ groupId, text: postText });

    postId = postRes.body.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe("Comment Operations", () => {
    it("should add comment to post", async () => {
      const response = await request(app)
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ text: commentText });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.text).toBe(commentText);
      expect(response.body.postId).toBe(postId);
      expect(response.body.userId).toBe(userId);
    });

    it("should get comments for post", async () => {
      const response = await request(app).get(`/posts/${postId}/comments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should not add comment without text", async () => {
      const response = await request(app)
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid comment data");
    });

    it("should add nested reply to comment", async () => {
      // First get the parent comment
      const commentsRes = await request(app).get(`/posts/${postId}/comments`);
      const parentComment = commentsRes.body[0];

      const replyText = "This is a reply to a comment";
      const response = await request(app)
        .post(`/posts/${postId}/comments`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ text: replyText, parentId: parentComment.id });

      expect(response.status).toBe(201);
      expect(response.body.text).toBe(replyText);
      expect(response.body.parentId).toBe(parentComment.id);
    });

    it("should not allow unauthorized user to delete comment", async () => {
      // Create another user
      const otherUserName = `otherUser_${Date.now()}`;
      const otherUserEmail = `other_${Date.now()}@example.com`;

      await request(app)
        .post("/auth/signup")
        .send({ username: otherUserName, email: otherUserEmail });

      const otherLoginRes = await request(app)
        .post("/auth/login")
        .send({ email: otherUserEmail });

      const otherToken = otherLoginRes.body.accessToken;

      // Get a comment to delete
      const commentsRes = await request(app).get(`/posts/${postId}/comments`);
      const comment = commentsRes.body[0];

      // Try to delete as other user
      const response = await request(app)
        .delete(`/posts/comments/${comment.id}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
    });
  });
});

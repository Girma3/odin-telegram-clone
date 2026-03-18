import request from "supertest";
import app from "../../src/app.js";
import prismaGlobal from "../../src/models/pool.js";
const ROUTE = "/groups/posts";

// Test data
const userName = `postTestUser_${Date.now()}`;
const userEmail = `postTest_${Date.now()}@example.com`;
const groupName = `postTestGroup_${Date.now()}`;
const postText = "This is a test post";
const postImgUrl = "https://example.com/image.jpg";

describe("Group Post CRUD Operations", () => {
  let accessToken;
  let refreshToken;
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
    refreshToken = loginRes.body.refreshToken;

    // Create a group first
    const groupRes = await request(app)
      .post("/groups")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: groupName, bio: "Test group for posts" });

    groupId = groupRes.body.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe("Post Routes", () => {
    it("posts route should be accessible", async () => {
      const response = await request(app).get("/posts");
      expect(response.status).toBe(200);
    });

    it("should create a new post with text", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ groupId, text: postText });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.text).toBe(postText);
      expect(response.body.userId).toBe(userId);
      expect(response.body.groupId).toBe(groupId);

      postId = response.body.id;
    });

    it("should create a new post with image", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ groupId, imgUrl: postImgUrl });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.imgUrl).toBe(postImgUrl);
    });

    it("should not create post without text or image", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ groupId });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Either text or image is required");
    });

    it("should not create post without groupId", async () => {
      const response = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ text: "Test" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Unauthorized to post");
    });

    it("should get all posts in group", async () => {
      const response = await request(app).get(`/posts/group/${groupId}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should get single post by ID", async () => {
      const response = await request(app).get(`/posts/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
      expect(response.body.text).toBe(postText);
    });
    //negative test
    it("should return 404 for non-existent post", async () => {
      const fakeId = "123e4567-e89b-12d3-a456-426614174000";
      const response = await request(app).get(`/posts/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Post not found");
    });

    it("should update post (as author)", async () => {
      const newText = "Updated post text";
      const response = await request(app)
        .put(`/posts/${postId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ text: newText });

      expect(response.status).toBe(200);
      expect(response.body.text).toBe(newText);
    });
    //negative test
    it("should not update post without authorization", async () => {
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

      // Try to update the post
      const response = await request(app)
        .put(`/posts/${postId}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ text: "Hacked text" });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Not authorized to update this post");
    });

    it("should delete post (as author)", async () => {
      // First create a post to delete
      const createRes = await request(app)
        .post("/posts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ groupId, text: "Post to delete" });

      const newPostId = createRes.body.id;

      const response = await request(app)
        .delete(`/posts/${newPostId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Post deleted successfully");
    });

    it("should get user posts", async () => {
      const response = await request(app).get(`/posts/user/${userId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should get all posts feed", async () => {
      const response = await request(app).get("/posts/feed");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

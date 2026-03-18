import request from "supertest";
import app from "../../src/app.js";
import prismaGlobal from "../../src/models/pool.js";

const userName = `testUser_${Date.now()}`;
const userEmail = `test_${Date.now()}@example.com`;
const groupName = `testGroup_${Date.now()}`;

describe("Group CRUD Operations", () => {
  let accessToken;
  let refreshToken;
  let userId;
  let groupId;

  // Clean up function
  async function cleanup() {
    await prismaGlobal.groupMembers.deleteMany({});
    await prismaGlobal.posts.deleteMany({});
    await prismaGlobal.profile.deleteMany({});
    await prismaGlobal.groups.deleteMany({});
    await prismaGlobal.refreshToken.deleteMany({});
    await prismaGlobal.user.deleteMany({});
  }

  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  describe("Authentication Setup", () => {
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

    it("should login the user", async () => {
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: userEmail });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty("accessToken");
      expect(loginRes.body).toHaveProperty("refreshToken");

      accessToken = loginRes.body.accessToken;
      refreshToken = loginRes.body.refreshToken;
    });
  });

  describe("Group Routes", () => {
    it("groups route should be accessible", async () => {
      const response = await request(app).get("/groups");
      expect(response.status).toBe(200);
    });

    it("should create a new group", async () => {
      const response = await request(app)
        .post("/groups")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: groupName, bio: "Test group bio" });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(groupName);
      expect(response.body).toHaveProperty("ownerId");

      groupId = response.body.id;
    });

    it("should get all groups", async () => {
      const response = await request(app).get("/groups/all");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should get group by ID", async () => {
      const response = await request(app).get(`/groups/${groupId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(groupId);
      expect(response.body.name).toBe(groupName);
    });

    it("should get group by name", async () => {
      const response = await request(app).get(`/groups/name/${groupName}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(groupName);
    });
    //negative test
    it("should not create group with duplicate name", async () => {
      const response = await request(app)
        .post("/groups")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: groupName });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Group name already exists");
    });

    it("should not create group without name", async () => {
      const response = await request(app)
        .post("/groups")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid group data");
    });

    it("should return 404 for non-existent group", async () => {
      const fakeId = "123e4567-e89b-12d3-a456-426614174000";
      const response = await request(app).get(`/groups/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Group not found");
    });

    it("should update group (as owner)", async () => {
      const response = await request(app)
        .put(`/groups/${groupId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: `${groupName}_updated` });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(`${groupName}_updated`);
    });

    it("should get group members", async () => {
      const response = await request(app).get(`/groups/${groupId}/members`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should get group posts (empty initially)", async () => {
      const response = await request(app).get(`/groups/${groupId}/posts`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it("should delete group (as owner)", async () => {
      // First create a new group to delete
      const newGroupName = `deleteTest_${Date.now()}`;
      const createRes = await request(app)
        .post("/groups")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ name: newGroupName });

      const newGroupId = createRes.body.id;

      const response = await request(app)
        .delete(`/groups/${newGroupId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Group deleted successfully");
    });

    it("should not allow non-owner to update group", async () => {
      //  another user
      const newUserName = `otherUser_${Date.now()}`;
      const newUserEmail = `other_${Date.now()}@example.com`;

      const signupRes = await request(app)
        .post("/auth/signup")
        .send({ username: newUserName, email: newUserEmail });

      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: newUserEmail });

      const otherToken = loginRes.body.accessToken;

      // Try to update the original group
      const response = await request(app)
        .put(`/groups/${groupId}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send({ name: "hacked_name" });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Only group owner can update the group",
      );
    });

    it("should not allow non-owner to delete group", async () => {
      // Create another user
      const newUserName = `otherUser2_${Date.now()}`;
      const newUserEmail = `other2_${Date.now()}@example.com`;

      await request(app)
        .post("/auth/signup")
        .send({ username: newUserName, email: newUserEmail });

      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: newUserEmail });

      const otherToken = loginRes.body.accessToken;

      // Try to delete the original group
      const response = await request(app)
        .delete(`/groups/${groupId}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Only group owner can delete the group",
      );
    });
  });
});

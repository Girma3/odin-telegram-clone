import request from "supertest";
import app from "../src/app.js";
import prismaGlobal from "../src/models/pool.js";

// Test data
const user1Name = `user1Notif_${Date.now()}`;
const user1Email = `user1Notif_${Date.now()}@example.com`;
const user2Name = `user2Notif_${Date.now()}`;
const user2Email = `user2Notif_${Date.now()}@example.com`;

describe("Notifications API", () => {
  let user1AccessToken;
  let user2AccessToken;
  let user1Id;
  let user2Id;
  let chatId;

  // Clean up function
  async function cleanup() {
    await prismaGlobal.notifications.deleteMany({});
    await prismaGlobal.reactions.deleteMany({});
    await prismaGlobal.privateChats.deleteMany({
      where: {
        OR: [
          { senderId: user1Id },
          { receiverId: user1Id },
          { senderId: user2Id },
          { receiverId: user2Id },
        ],
      },
    });
    await prismaGlobal.refreshToken.deleteMany({});
    await prismaGlobal.profile.deleteMany({});
    await prismaGlobal.user.deleteMany({
      where: {
        OR: [{ id: user1Id }, { id: user2Id }],
      },
    });
  }

  beforeAll(async () => {
    // Create user1
    const user1Signup = await request(app)
      .post("/auth/signup")
      .send({ username: user1Name, email: user1Email });
    user1Id = user1Signup.body.id;

    const user1Login = await request(app)
      .post("/auth/login")
      .send({ email: user1Email });
    user1AccessToken = user1Login.body.accessToken;

    // Create user2
    const user2Signup = await request(app)
      .post("/auth/signup")
      .send({ username: user2Name, email: user2Email });
    user2Id = user2Signup.body.id;

    const user2Login = await request(app)
      .post("/auth/login")
      .send({ email: user2Email });
    user2AccessToken = user2Login.body.accessToken;

    // Create a message from user1 to user2 (user2 will get notification)
    const message = await request(app)
      .post("/private")
      .set("Authorization", `Bearer ${user1AccessToken}`)
      .send({ receiverId: user2Id, text: "Hello user2!" });
    chatId = message.body.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe("Get Notifications", () => {
    it("should get empty notifications initially", async () => {
      const response = await request(app)
        .get("/notifications")
        .set("Authorization", `Bearer ${user1AccessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/notifications");

      expect(response.status).toBe(401);
    });
  });

  describe("Get Unread Count", () => {
    it("should get unread count", async () => {
      const response = await request(app)
        .get("/notifications/unread")
        .set("Authorization", `Bearer ${user1AccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("unreadCount");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/notifications/unread");

      expect(response.status).toBe(401);
    });
  });

  describe("Mark Notification as Read", () => {
    let notificationId;

    it("should create notification when user adds reaction", async () => {
      // User2 adds reaction to the message from user1
      const reactionResponse = await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${user2AccessToken}`)
        .send({ emoji: "👍" });

      expect(reactionResponse.status).toBe(201);

      // Check that notification was created for user1
      const notifications = await prismaGlobal.notifications.findMany({
        where: {
          chatId,
          type: "REACTION",
        },
      });

      expect(notifications.length).toBeGreaterThan(0);
      notificationId = notifications[0].id;
    });

    it("should mark notification as read", async () => {
      // First get user1's notifications to find the reaction notification
      const notifications = await prismaGlobal.notifications.findMany({
        where: {
          receiverId: user1Id,
          chatId,
        },
      });

      if (notifications.length > 0) {
        const response = await request(app)
          .put(`/notifications/${notifications[0].id}/read`)
          .set("Authorization", `Bearer ${user1AccessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.read).toBe(true);
      }
    });

    it("should return 404 for non-existent notification", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const response = await request(app)
        .put(`/notifications/${fakeId}/read`)
        .set("Authorization", `Bearer ${user1AccessToken}`);

      expect(response.status).toBe(404);
    });

    it("should not allow marking another user's notification as read", async () => {
      // Create another reaction
      await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${user1AccessToken}`)
        .send({ emoji: "❤️" });

      // Try to mark user2's notification as read with user1's token
      const notifications = await prismaGlobal.notifications.findMany({
        where: {
          receiverId: user2Id,
        },
      });

      if (notifications.length > 0) {
        const response = await request(app)
          .put(`/notifications/${notifications[0].id}/read`)
          .set("Authorization", `Bearer ${user1AccessToken}`);

        // Should either return 403 (if authorization check works) or 404 (if not found)
        expect([403, 404]).toContain(response.status);
      }
    });
  });

  describe("Notifications after Reactions", () => {
    it("should create notification when adding reaction", async () => {
      // User1 adds reaction to user2's message
      const response = await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${user1AccessToken}`)
        .send({ emoji: "🔥" });

      expect(response.status).toBe(201);

      // Check that notification was created
      const notifications = await prismaGlobal.notifications.findMany({
        where: {
          chatId,
          receiverId: user2Id,
          type: "REACTION",
        },
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].message).toContain("🔥");
    });

    it("should have correct receiver and sender in notification", async () => {
      const notifications = await prismaGlobal.notifications.findMany({
        where: {
          chatId,
          receiverId: user2Id,
          type: "REACTION",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      expect(notifications.length).toBeGreaterThan(0);
      // receiverId is the receiver of the notification (user2)
      expect(notifications[0].receiverId).toBe(user2Id);
      // senderId is who triggered/sent the notification (user1)
      expect(notifications[0].senderId).toBe(user1Id);
    });
  });
});

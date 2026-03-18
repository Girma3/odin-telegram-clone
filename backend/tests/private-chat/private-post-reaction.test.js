import request from "supertest";
import app from "../../src/app.js";
import prismaGlobal from "../../src/models/pool.js";

// Test data
const senderName = `senderReact_${Date.now()}`;
const senderEmail = `senderReact_${Date.now()}@example.com`;
const receiverName = `receiverReact_${Date.now()}`;
const receiverEmail = `receiverReact_${Date.now()}@example.com`;

describe("Private Post Reactions API", () => {
  let senderAccessToken;
  let receiverAccessToken;
  let senderId;
  let receiverId;
  let chatId;

  // Clean up function
  async function cleanup() {
    await prismaGlobal.notifications.deleteMany({});
    await prismaGlobal.reactions.deleteMany({});
    await prismaGlobal.privateChats.deleteMany({
      where: {
        OR: [
          { senderId },
          { receiverId },
          { senderId: receiverId },
          { receiverId: senderId },
        ],
      },
    });
    await prismaGlobal.refreshToken.deleteMany({});
    await prismaGlobal.profile.deleteMany({});
    await prismaGlobal.user.deleteMany({
      where: {
        OR: [{ id: senderId }, { id: receiverId }],
      },
    });
  }

  beforeAll(async () => {
    // Create sender user
    const senderSignup = await request(app)
      .post("/auth/signup")
      .send({ username: senderName, email: senderEmail });
    senderId = senderSignup.body.id;

    const senderLogin = await request(app)
      .post("/auth/login")
      .send({ email: senderEmail });
    senderAccessToken = senderLogin.body.accessToken;

    // Create receiver user
    const receiverSignup = await request(app)
      .post("/auth/signup")
      .send({ username: receiverName, email: receiverEmail });
    receiverId = receiverSignup.body.id;

    const receiverLogin = await request(app)
      .post("/auth/login")
      .send({ email: receiverEmail });
    receiverAccessToken = receiverLogin.body.accessToken;

    // Create a message for reactions
    const message = await request(app)
      .post("/private")
      .set("Authorization", `Bearer ${senderAccessToken}`)
      .send({ receiverId, text: "Message for reaction test" });
    chatId = message.body.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe("Private Message Reactions", () => {
    it("should add reaction to chat message", async () => {
      const response = await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({ emoji: "👍" });

      expect(response.status).toBe(201);
      expect(response.body.emoji).toBe("👍");
      expect(response.body.chatId).toBe(chatId);
      expect(response.body.userId).toBe(receiverId);
    });
    /*
    it("should get reactions for chat", async () => {
      const response = await request(app)
        .get(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${senderAccessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });*/

    it("should remove reaction from chat", async () => {
      const response = await request(app)
        .delete(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${receiverAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Reaction removed successfully");
    });

    it("should toggle reaction - remove and add again", async () => {
      // Add reaction
      await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({ emoji: "❤️" });

      // Add same reaction again to toggle (remove)
      const response = await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({ emoji: "❤️" });

      // Should return message about removal
      expect(response.body.removed).toBe(true);
    });

    it("should add different reaction to same message", async () => {
      // Add first reaction
      await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({ emoji: "👍" });

      // Add different reaction
      const response = await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({ emoji: "🎉" });

      expect(response.status).toBe(201);
      expect(response.body.emoji).toBe("🎉");
    });

    it("should not add reaction without emoji", async () => {
      const response = await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Emoji is required");
    });

    it("should create notification when adding reaction", async () => {
      // Add reaction as receiver (sender should get notification)
      const response = await request(app)
        .post(`/private/${chatId}/reactions`)
        .set("Authorization", `Bearer ${senderAccessToken}`)
        .send({ emoji: "🔥" });

      expect(response.status).toBe(201);

      // Check that notification was created for the sender
      const notifications = await prismaGlobal.notifications.findMany({
        where: {
          chatId,
          type: "REACTION",
        },
      });

      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].receiverId).toBe(receiverId);
      expect(notifications[0].userId).toBe(senderId);
      expect(notifications[0].type).toBe("REACTION");

      // Check that notification was created for the sender
    });
  });
});

import request from "supertest";
import app from "../../src/app.js";
import prismaGlobal from "../../src/models/pool.js";

// Test data
const senderName = `sender_${Date.now()}`;
const senderEmail = `sender_${Date.now()}@example.com`;
const receiverName = `receiver_${Date.now()}`;
const receiverEmail = `receiver_${Date.now()}@example.com`;
const messageText = "Hello, this is a test message!";

describe("Private Post (DM) CRUD Operations", () => {
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
  });

  afterAll(async () => {
    await cleanup();
  });

  describe("Private Message Routes", () => {
    it("private posts route should be accessible", async () => {
      const response = await request(app)
        .get("/private")
        .set("Authorization", `Bearer ${senderAccessToken}`);
      expect(response.status).toBe(200);
    });

    it("should send a private message", async () => {
      const response = await request(app)
        .post("/private")
        .set("Authorization", `Bearer ${senderAccessToken}`)
        .send({ receiverId, text: messageText });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.text).toBe(messageText);
      expect(response.body.senderId).toBe(senderId);
      expect(response.body.receiverId).toBe(receiverId);

      chatId = response.body.id;
    });

    it("should not send message to self", async () => {
      const response = await request(app)
        .post("/private")
        .set("Authorization", `Bearer ${senderAccessToken}`)
        .send({ receiverId: senderId, text: "Test" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Cannot send message to yourself");
    });

    it("should not send message without receiverId", async () => {
      const response = await request(app)
        .post("/private")
        .set("Authorization", `Bearer ${senderAccessToken}`)
        .send({ text: "Test" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid message data");
      expect(response.body).toHaveProperty("detail");
    });

    it("should not send message without text or image", async () => {
      const response = await request(app)
        .post("/private")
        .set("Authorization", `Bearer ${senderAccessToken}`)
        .send({ receiverId });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Either text or image is required");
    });

    it("should get conversation between two users", async () => {
      const response = await request(app)
        .get(`/private/user/${receiverId}`)
        .set("Authorization", `Bearer ${senderAccessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should get all conversations", async () => {
      const response = await request(app)
        .get("/private/conversations")
        .set("Authorization", `Bearer ${senderAccessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should get unread count", async () => {
      const response = await request(app)
        .get("/private/unread")
        .set("Authorization", `Bearer ${receiverAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("unreadCount");
    });

    it("should mark message as read", async () => {
      const response = await request(app)
        .put(`/private/${chatId}/read`)
        .set("Authorization", `Bearer ${receiverAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.read).toBe(true);
    });

    it("should only allow receiver to mark as read", async () => {
      // Create new message
      const newMessage = await request(app)
        .post("/private")
        .set("Authorization", `Bearer ${senderAccessToken}`)
        .send({ receiverId, text: "Test message" });

      const newChatId = newMessage.body.id;

      // Sender tries to mark as read (should fail)
      const response = await request(app)
        .put(`/private/${newChatId}/read`)
        .set("Authorization", `Bearer ${senderAccessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Only receiver can mark message as read",
      );
    });

    it("should get single chat message", async () => {
      const response = await request(app)
        .get(`/private/${chatId}`)
        .set("Authorization", `Bearer ${senderAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(chatId);
      expect(response.body.text).toBe(messageText);
    });

    it("should not allow unauthorized user to view chat", async () => {
      // Create third user
      const thirdName = `third_${Date.now()}`;
      const thirdEmail = `third_${Date.now()}@example.com`;

      await request(app)
        .post("/auth/signup")
        .send({ username: thirdName, email: thirdEmail });

      const thirdLogin = await request(app)
        .post("/auth/login")
        .send({ email: thirdEmail });

      const thirdToken = thirdLogin.body.accessToken;

      const response = await request(app)
        .get(`/private/${chatId}`)
        .set("Authorization", `Bearer ${thirdToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Not authorized to view this chat");
    });

    it("should delete own message", async () => {
      // Create new message to delete
      const newMessage = await request(app)
        .post("/private")
        .set("Authorization", `Bearer ${senderAccessToken}`)
        .send({ receiverId, text: "Message to delete" });

      const newChatId = newMessage.body.id;

      const response = await request(app)
        .delete(`/private/${newChatId}`)
        .set("Authorization", `Bearer ${senderAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Message deleted successfully");
    });

    it("should not allow deleting other user's message", async () => {
      const response = await request(app)
        .delete(`/private/${chatId}`)
        .set("Authorization", `Bearer ${receiverAccessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Not authorized to delete this message",
      );
    });
  });
});

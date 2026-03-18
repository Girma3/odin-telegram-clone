import request from "supertest";
import app from "../../src/app.js";
import prismaGlobal from "../../src/models/pool.js";

// Test data
const senderName = `senderComment_${Date.now()}`;
const senderEmail = `senderComment_${Date.now()}@example.com`;
const receiverName = `receiverComment_${Date.now()}`;
const receiverEmail = `receiverComment_${Date.now()}@example.com`;
const replyText = "This is a reply message";

describe("Private Post Comments API", () => {
  let senderAccessToken;
  let receiverAccessToken;
  let senderId;
  let receiverId;
  let commentChatId;

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

    // Create a message for comments
    const message = await request(app)
      .post("/private")
      .set("Authorization", `Bearer ${senderAccessToken}`)
      .send({ receiverId, text: "Message for comment test" });
    commentChatId = message.body.id;
  });

  afterAll(async () => {
    await cleanup();
  });

  describe("Private Message Comments/Replies", () => {
    it("should add comment/reply to chat", async () => {
      const response = await request(app)
        .post(`/private/${commentChatId}/comments`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({ text: replyText });

      expect(response.status).toBe(201);
      expect(response.body.text).toBe(replyText);
    });

    it("should get comments for chat", async () => {
      const response = await request(app)
        .get(`/private/${commentChatId}/comments`)
        .set("Authorization", `Bearer ${senderAccessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should not add comment without text", async () => {
      const response = await request(app)
        .post(`/private/${commentChatId}/comments`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid comment data");
      expect(response.body).toHaveProperty("detail");
    });

    it("should delete own comment", async () => {
      // Create comment to delete
      const comment = await request(app)
        .post(`/private/${commentChatId}/comments`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({ text: "Comment to delete" });

      const commentId = comment.body.id;

      const response = await request(app)
        .delete(`/private/comments/${commentId}`)
        .set("Authorization", `Bearer ${receiverAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Comment deleted successfully");
    });

    it("should not allow deleting other user's comment", async () => {
      // Add comment as receiver
      const comment = await request(app)
        .post(`/private/${commentChatId}/comments`)
        .set("Authorization", `Bearer ${receiverAccessToken}`)
        .send({ text: "Receiver's comment" });

      const commentId = comment.body.id;

      // Try to delete as sender (should fail)
      const response = await request(app)
        .delete(`/private/comments/${commentId}`)
        .set("Authorization", `Bearer ${senderAccessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "Not authorized to delete this comment",
      );
    });
  });
});

import request from "supertest";
import app from "../src/app.js";
import e from "express";

const userName = "testUser";
const userEmail = "test@example.com";

describe("Authentication Flow", () => {
  let accessToken;
  let refreshToken;
  it("auth route should be accessible", async () => {
    const response = await request(app).get("/auth");
    expect(response.status).toBe(200);
  });
  it("if user exist show message error", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send({ username: userName, email: userEmail });
    //if user exist show message error
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists by this email.");
  });

  it("User should be able to register", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send({ username: userName, email: userEmail });

    //if user not exist
    expect(response.status).toBe(201);
    expect(response.body.username).toBe(userName);
    expect(response.body.email).toBe(userEmail);
    expect(response.body).toHaveProperty("id");
  });

  it("User should be able to login and receive tokens", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: userEmail });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    expect(response.body.user.email).toBe(userEmail);

    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it("Protected route should require valid access token", async () => {
    const response = await request(app)
      .get("/auth/protected")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe(userEmail);
  });

  it("Should refresh access token using refresh token", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ token: refreshToken });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });

  it("should logout user", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .send({ token: refreshToken });
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Logout successful");
  });
});

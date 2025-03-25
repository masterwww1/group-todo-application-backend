const request = require("supertest");
const { getApp, getServer } = require("../globalSetup");
const { createUserData } = require("../fixtures/users");
const { organizations } = require("../fixtures/organizations");

describe("Auth Integration Test", () => {
  let app;
  let db;
  let server;
  let testUserIP;

  beforeAll(async () => {
    app = getApp();
    server = getServer();
    db = global.db;

    await db("organizations").insert(organizations[0]);
  });

  afterAll(async () => {
    await db("users").del();
    await db("organizations").del();
    await server.close();
  });

  beforeEach(async () => {
    await db("users").del();
    testUserIP = `test-user-${Date.now()}`;
  });

  describe("POST /api/auth/register", () => {
    it("should return 201 and the user data", async () => {
      const userData = createUserData();

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        name: userData.name,
      });
      expect(response.body).not.toHaveProperty("password_hash");
    });

    it("should return validation error for invalid inputs", async () => {
      const userData = {
        email: "invalid-email",
        password: "123",
        name: "",
      };

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            message: expect.any(String),
          }),
          expect.objectContaining({
            field: "password",
            message: expect.any(String),
          }),
          expect.objectContaining({
            field: "name",
            message: expect.any(String),
          }),
        ])
      );
    });

    it("should prevent duplicate email registeration", async () => {
      const userData = createUserData();

      await request(app).post("/api/auth/register").send(userData);

      const res = await request(app).post("/api/auth/register").send(userData);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Email already registered");
    });
  });

  describe("POST /api/auth/login", () => {
    let registeredUser;

    beforeEach(async () => {
      const userData = createUserData();
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(userData);
      registeredUser = registerRes.body;
    });

    it("should return 200 and the user data with token", async () => {
      const credentials = {
        email: registeredUser.email,
        password: "Password123!",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        user: {
          id: expect.any(String),
          email: registeredUser.email,
          name: registeredUser.name,
        },
        token: expect.any(String),
      });
      expect(response.body.user).not.toHaveProperty("password_hash");
    });

    it("should return InvalidCredentialsError for invalid credentials", async () => {
      const credentials = {
        email: registeredUser.email,
        password: "Wrongpassword123",
      };
      const response = await request(app)
        .post("/api/auth/login")
        .send(credentials);

      expect(response.status).toBe(401);
    });

    it("should return UserNotFound error for invalid email", async () => {
      const credentials = {
        email: "invalid-email",
        password: "123",
      };

      const res = await request(app).post("/api/auth/login").send(credentials);

      expect(res.status).toBe(400);
    });

    it("should handle rate limit", async () => {
      const credentials = {
        email: registeredUser.email,
        password: "Wrongpassword123",
      };

      for (let i = 0; i < 5; i++) {
        await request(app).post("/api/auth/login").send(credentials);
      }

      const res = await request(app).post("/api/auth/login").send(credentials);

      expect(res.status).toBe(429);
      expect(res.body.error).toBe("Too many requests, please try again later.");
    });
  });

  describe("Get user data", () => {
    let authToken;

    beforeEach(async () => {
      const userData = createUserData();
      const registerRes = await request(app)
        .post("/api/auth/register")
        .set("x-test-user", testUserIP)
        .send(userData);
      const loginRes = await request(app)
        .post("/api/auth/login")
        .set("x-test-user", testUserIP)
        .send({
          email: userData.email,
          password: "Password123!",
        });
      authToken = loginRes.body.token;
    });

    it("should return user data", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("x-test-user", testUserIP)
        .set("Authorization", `Bearer ${authToken}`);


    console.log("99999999999: ", res.body);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        name: expect.any(String),
      });
      expect(res.body).not.toHaveProperty("password_hash");
    });

    it("should return Unauthorized error for invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("x-test-user", testUserIP)
        .set("Authorization", `Bearer invalid-token`);

      expect(res.status).toBe(401);
    });

    it("should return Unauthorized error for missing token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("x-test-user", testUserIP);

      expect(res.status).toBe(401);
    });
  });

  describe("Logout", () => {
    let authToken;

    beforeEach(async () => {
      const userData = createUserData();
      const registerRes = await request(app)
        .post("/api/auth/register")
        .set("x-test-user", testUserIP)
        .send(userData);
      const loginRes = await request(app)
        .post("/api/auth/login")
        .set("x-test-user", testUserIP)
        .send({
          email: userData.email,
          password: "Password123!",
        });
      authToken = loginRes.body.token;
    });

    it("should logged out successfully.", async () => {
      const res = await request(app)
        .get("/api/auth/logout")
        .set("x-test-user", testUserIP)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(204);
    });

    it("should return Unauthorized error for invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/logout")
        .set("x-test-user", testUserIP)
        .set("Authorization", `Bearer invalid-token`);

      expect(res.status).toBe(401);
    });
  });
});

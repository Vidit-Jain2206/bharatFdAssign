import request from "supertest";
import { app } from "../server";
import { Admin } from "../models/admin";
import { generateToken } from "../utils/jwtTokens";

describe("Auth Routes", () => {
  beforeEach(async () => {
    await Admin.deleteMany({});
  });

  describe("POST /auth/register", () => {
    const registerData = {
      email: "test@example.com",
      password: "password123",
    };

    it("should register a new admin", async () => {
      const res = await request(app).post("/auth/register").send(registerData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Admin registered successfully");

      // Check cookies are set
      expect(res.headers["set-cookie"]).toBeDefined();
      const cookies = res.headers["set-cookie"] as string;
      expect(cookies).toBe(true);

      // Verify admin was created in database
      const admin = await Admin.findOne({ email: registerData.email });
      expect(admin).toBeDefined();
      expect(admin?.refreshToken).toBeDefined();
    });

    it("should not register admin with existing email", async () => {
      await Admin.create(registerData);

      const res = await request(app).post("/auth/register").send(registerData);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Admin already exists");
    });

    it("should hash the password before saving", async () => {
      await request(app).post("/auth/register").send(registerData);

      const admin = await Admin.findOne({ email: registerData.email });
      expect(admin?.password).not.toBe(registerData.password);

      // Verify password can be compared correctly
      const isValid = await admin?.comparePassword(registerData.password);
      expect(isValid).toBe(true);
    });
  });

  describe("POST /auth/login", () => {
    const loginData = {
      email: "test@example.com",
      password: "password123",
    };

    beforeEach(async () => {
      await Admin.create(loginData);
    });

    it("should login with correct credentials", async () => {
      const res = await request(app).post("/auth/login").send(loginData);

      expect(res.status).toBe(200);

      // Check cookies are set
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBe(true);

      // Verify refresh token is saved in database
      const admin = await Admin.findOne({ email: loginData.email });
      expect(admin?.refreshToken).toBeDefined();
    });

    it("should not login with incorrect password", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should not login with non-existent email", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("POST /auth/refresh-token", () => {
    let admin: any;
    let refreshToken: string;

    beforeEach(async () => {
      admin = await Admin.create({
        email: "test@example.com",
        password: "password123",
      });
      refreshToken = generateToken({ id: admin._id }, "refreshToken");
      admin.refreshToken = refreshToken;
      await admin.save();
    });

    it("should issue new access token with valid refresh token", async () => {
      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("accessToken");

      // Check new access token cookie is set
      const cookies = res.headers["set-cookie"] as string;
      expect(cookies).toBe(true);
    });

    it("should not refresh token with invalid refresh token", async () => {
      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", ["refreshToken=invalid_token"]);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid refresh token");
    });

    it("should not refresh token when refresh token is not in database", async () => {
      await Admin.updateOne(
        { _id: admin._id },
        { $unset: { refreshToken: 1 } }
      );

      const res = await request(app)
        .post("/auth/refresh-token")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid refresh token");
    });
  });

  describe("POST /auth/logout", () => {
    let admin: any;
    let refreshToken: string;

    beforeEach(async () => {
      admin = await Admin.create({
        email: "test@example.com",
        password: "password123",
      });
      refreshToken = generateToken({ id: admin._id }, "refreshToken");
      admin.refreshToken = refreshToken;
      await admin.save();
    });

    it("should logout successfully", async () => {
      const res = await request(app)
        .post("/auth/logout")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");

      // Verify cookies are cleared
      const cookies = res.headers["set-cookie"] as string;
      expect(cookies).toBe(true);

      // Verify refresh token is removed from database
      const updatedAdmin = await Admin.findById(admin._id);
      expect(updatedAdmin?.refreshToken).toBeUndefined();
    });

    it("should handle logout with invalid refresh token", async () => {
      const res = await request(app)
        .post("/auth/logout")
        .set("Cookie", ["refreshToken=invalid_token"]);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid refresh token");
    });

    it("should handle logout when refresh token is not in database", async () => {
      await Admin.updateOne(
        { _id: admin._id },
        { $unset: { refreshToken: 1 } }
      );

      const res = await request(app)
        .post("/auth/logout")
        .set("Cookie", [`refreshToken=${refreshToken}`]);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid refresh token");
    });
  });

  describe("Admin Model Methods", () => {
    it("should correctly hash password on save", async () => {
      const admin = await Admin.create({
        email: "test@example.com",
        password: "password123",
      });

      expect(admin.password).not.toBe("password123");
      const isValid = await admin.comparePassword("password123");
      expect(isValid).toBe(true);
    });

    it("should not rehash password if not modified", async () => {
      const admin = await Admin.create({
        email: "test@example.com",
        password: "password123",
      });

      const originalPassword = admin.password;
      admin.email = "newemail@example.com";
      await admin.save();

      expect(admin.password).toBe(originalPassword);
    });
  });
});

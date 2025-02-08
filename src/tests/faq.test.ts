import request from "supertest";
import { app } from "../server";
import { Faq } from "../models/Faq";
import { Admin } from "../models/admin";
import { generateToken } from "../utils/jwtTokens";
import redis from "../config/redis";
import { translateText } from "../service/translate";

// Mock the translation service
jest.mock("../service/translate", () => ({
  translateText: jest.fn((text) => Promise.resolve(`translated_${text}`)),
}));

describe("FAQ Routes", () => {
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    // Create a test admin
    const admin = await Admin.create({
      email: "admin@test.com",
      password: "password123",
      username: "testadmin",
    });
    adminId = admin._id.toString();
    adminToken = generateToken({ id: adminId }, "accessToken");
  });

  beforeEach(async () => {
    await Faq.deleteMany({});
    await redis.flushall();
  });

  afterAll(async () => {
    await Admin.deleteMany({});
    await redis.quit();
  });

  describe("POST /faqs", () => {
    const createFaqData = {
      question: "Test Question?",
      answer: "Test Answer",
      category: "general",
      targetLanguages: ["en", "es", "fr"],
      originalLanguage: "en",
    };

    it("should create FAQ with translations when admin is authenticated", async () => {
      const res = await request(app)
        .post("/faqs")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(createFaqData);

      expect(res.status).toBe(201);
      expect(res.body.faq).toHaveProperty("translations");
      expect(res.body.faq.createdBy).toBe(adminId);
      expect(res.body.faq.status).toBe("published");

      // Verify translations were created
      const translations = res.body.faq.translations;
      expect(translations).toHaveProperty("en");
      expect(translations).toHaveProperty("es");
      expect(translations).toHaveProperty("fr");
    });

    it("should not create FAQ without authentication", async () => {
      const res = await request(app).post("/faqs").send(createFaqData);

      expect(res.status).toBe(401);
    });

    it("should handle translation service failure", async () => {
      (translateText as jest.Mock).mockRejectedValueOnce(
        new Error("Translation failed")
      );

      const res = await request(app)
        .post("/faqs")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(createFaqData);

      expect(res.status).toBe(201);
      expect(res.body.faq.translations).toHaveProperty("en");
    });
  });

  describe("GET /faqs", () => {
    beforeEach(async () => {
      const faq = await Faq.create({
        translations: new Map([
          ["en", { question: "English Q", answer: "English A" }],
          ["es", { question: "Spanish Q", answer: "Spanish A" }],
        ]),
        category: "general",
        targetLanguages: ["en", "es"],
        originalLanguage: "en",
        status: "published",
      });
    });

    it("should get FAQs with default language (en)", async () => {
      const res = await request(app).get("/faqs");

      expect(res.status).toBe(200);
      expect(res.body.faqs).toHaveLength(1);
      expect(res.body.faqs[0].question).toBe("English Q");
    });

    it("should get FAQs in specified language", async () => {
      const res = await request(app).get("/faqs?lang=es");

      expect(res.status).toBe(200);
      expect(res.body.faqs[0].question).toBe("Spanish Q");
    });

    it("should use redis cache for subsequent requests", async () => {
      // First request (no cache)
      await request(app).get("/faqs?lang=en");

      // Second request (should use cache)
      const res = await request(app).get("/faqs?lang=en");
      expect(res.status).toBe(200);

      // Verify data is from cache by modifying DB and seeing old results
      await Faq.deleteMany({});
      const cachedRes = await request(app).get("/faqs?lang=en");
      expect(cachedRes.body.faqs).toHaveLength(1);
    });
  });

  describe("PUT /faqs/:id", () => {
    let faqId: string;

    beforeEach(async () => {
      const faq = await Faq.create({
        translations: new Map([
          ["en", { question: "Original Q", answer: "Original A" }],
        ]),
        category: "general",
        targetLanguages: ["en"],
        originalLanguage: "en",
        status: "published",
      });
      faqId = faq._id.toString();
    });

    it("should update FAQ with new translations", async () => {
      const updateData = {
        question: "Updated Q",
        answer: "Updated A",
        category: "updated",
        targetLanguages: ["en", "es"],
        originalLanguage: "en",
      };

      const res = await request(app)
        .put(`/faqs/${faqId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.faq.translations).toHaveProperty("es");
    });

    it("should not update translations if only category changed", async () => {
      const updateData = {
        category: "newCategory",
      };

      const res = await request(app)
        .put(`/faqs/${faqId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.faq.translations.size).toBe(1);
    });
  });

  describe("DELETE /faqs/:id", () => {
    let faqId: string;

    beforeEach(async () => {
      const faq = await Faq.create({
        translations: new Map([
          ["en", { question: "Test Q", answer: "Test A" }],
        ]),
        category: "general",
        targetLanguages: ["en"],
        originalLanguage: "en",
        status: "published",
      });
      faqId = faq._id.toString();
    });

    it("should delete FAQ when admin is authenticated", async () => {
      const res = await request(app)
        .delete(`/faqs/${faqId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const deletedFaq = await Faq.findById(faqId);
      expect(deletedFaq).toBeNull();
    });

    it("should not delete FAQ without authentication", async () => {
      const res = await request(app).delete(`/faqs/${faqId}`);

      expect(res.status).toBe(401);

      const faq = await Faq.findById(faqId);
      expect(faq).not.toBeNull();
    });
  });

  describe("GET /faqs/:id", () => {
    let faqId: string;

    beforeEach(async () => {
      const faq = await Faq.create({
        translations: new Map([
          ["en", { question: "Test Q", answer: "Test A" }],
        ]),
        category: "general",
        targetLanguages: ["en"],
        originalLanguage: "en",
        status: "published",
      });
      faqId = faq._id.toString();
    });

    it("should get FAQ by id", async () => {
      const res = await request(app).get(`/faqs/${faqId}`);

      expect(res.status).toBe(200);
      expect(res.body.faq._id).toBe(faqId);
    });

    it("should return 404 for non-existent FAQ", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";
      const res = await request(app).get(`/faqs/${nonExistentId}`);

      expect(res.status).toBe(404);
    });
  });
});

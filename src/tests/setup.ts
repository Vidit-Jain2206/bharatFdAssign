import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

// Mock MongoDB and Redis connections
jest.mock("../config/database", () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../config/redis", () => ({
  redis: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  },
}));

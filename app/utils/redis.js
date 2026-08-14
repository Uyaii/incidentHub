import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

import { Worker, Queue } from "bullmq";

import { redisClient } from "../utils/redis.js";

export const connection = redisClient;
export const notificationsQueue = new Queue("notifications", { connection });
// export const notificationsWorker = new Worker("notifications", { connection });

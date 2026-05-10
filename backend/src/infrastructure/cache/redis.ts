import Redis from "ioredis";
import { appConfig } from "../../config/appConfig";
import { logger } from "../../shared/utils/Logger";

export const redisClient = new Redis(appConfig.redis);

redisClient.on("connect", () => {
     logger.info("Redis connected");
});

redisClient.on("error", (err) => {
     logger.error("Redis error", err);
});

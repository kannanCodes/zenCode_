import Redis from "ioredis";
import { appConfig } from "../../config/appConfig";
import { logger } from "../../shared/utils/Logger";


export const redisClient = appConfig.redis.url

  ? new Redis(appConfig.redis.url)
  : new Redis({
      host: appConfig.redis.host,
      port: appConfig.redis.port,
      password: appConfig.redis.password,
    });

redisClient.on("connect", () => {
     logger.info("Redis connected");
});

redisClient.on("error", (err) => {
     logger.error("Redis error", err);
});

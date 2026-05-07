import mongoose from "mongoose";
import { appConfig } from "./appConfig";
import { logger } from "../utils/Logger";

export const connectDB = async () => {
     try {
          await mongoose.connect(appConfig.mongoUri);
          logger.info("MongoDB connected");
     } catch (error) {
          logger.error("MongoDB connection failed", error);
          process.exit(1);
     }
};
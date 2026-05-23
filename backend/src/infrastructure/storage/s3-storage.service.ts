import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { appConfig } from "../../config/appConfig";
import {
  GenerateUploadUrlInput,
  GenerateUploadUrlOutput,
  IStorageService,
} from "../../interfaces/infrastructure-interfaces/storage/IStorageService";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";
import { STORAGE_MESSAGES } from "../../constants/messages";

export class S3StorageService implements IStorageService {
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: appConfig.s3.region,
      credentials: {
        accessKeyId: appConfig.s3.accessKeyId,
        secretAccessKey: appConfig.s3.secretAccessKey,
      },
    });
  }

  async generateUploadUrl(input: GenerateUploadUrlInput): Promise<GenerateUploadUrlOutput> {
    if (!appConfig.s3.bucket || !appConfig.s3.region || !appConfig.s3.accessKeyId || !appConfig.s3.secretAccessKey) {
      throw new AppError(STORAGE_MESSAGES.S3_CONFIG_MISSING, STATUS_CODES.INTERNAL_SERVER_ERROR);
    }

    const command = new PutObjectCommand({
      Bucket: appConfig.s3.bucket,
      Key: input.objectKey,
      ContentType: input.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: input.expiresInSeconds,
    });

    return { uploadUrl };
  }
}

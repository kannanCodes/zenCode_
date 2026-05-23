export interface GenerateUploadUrlInput {
  objectKey: string;
  contentType: string;
  expiresInSeconds: number;
}

export interface GenerateUploadUrlOutput {
  uploadUrl: string;
}

export interface IStorageService {
  generateUploadUrl(input: GenerateUploadUrlInput): Promise<GenerateUploadUrlOutput>;
}

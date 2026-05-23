import { ITokenLifecycleRepository } from "../../interfaces/repository-interfaces/auth/ITokenLifecycleRepository";
import { ICacheService } from "../../interfaces/service-interfaces/auth/ICacheService";
import { REDIS_KEYS } from "../../constants/redisKeys";

export class TokenLifecycleRepository implements ITokenLifecycleRepository {
  constructor(private readonly cacheService: ICacheService) {}

  async issuePasswordResetToken(params: {
    hashedToken: string;
    userId: string;
    ttlSeconds: number;
  }): Promise<void> {
    const { hashedToken, userId, ttlSeconds } = params;
    const userTokenKey = REDIS_KEYS.RESET_PASSWORD_BY_USER(userId);
    const existingToken = await this.cacheService.get<string>(userTokenKey);

    if (existingToken) {
      await this.cacheService.del(REDIS_KEYS.RESET_PASSWORD(existingToken));
    }

    await this.cacheService.set(REDIS_KEYS.RESET_PASSWORD(hashedToken), userId, ttlSeconds);
    await this.cacheService.set(userTokenKey, hashedToken, ttlSeconds);
  }

  async getPasswordResetUserId(hashedToken: string): Promise<string | null> {
    return this.cacheService.get<string>(REDIS_KEYS.RESET_PASSWORD(hashedToken));
  }

  async isPasswordResetTokenValid(hashedToken: string): Promise<boolean> {
    const userId = await this.getPasswordResetUserId(hashedToken);
    if (!userId) {
      return false;
    }

    const latestToken = await this.cacheService.get<string>(REDIS_KEYS.RESET_PASSWORD_BY_USER(userId));
    return latestToken === hashedToken;
  }

  async consumePasswordResetToken(hashedToken: string): Promise<string | null> {
    const userId = await this.getPasswordResetUserId(hashedToken);
    if (!userId) {
      return null;
    }

    const latestToken = await this.cacheService.get<string>(REDIS_KEYS.RESET_PASSWORD_BY_USER(userId));
    if (latestToken !== hashedToken) {
      return null;
    }

    await this.cacheService.del(REDIS_KEYS.RESET_PASSWORD(hashedToken));
    await this.cacheService.del(REDIS_KEYS.RESET_PASSWORD_BY_USER(userId));

    return userId;
  }

  async issueMentorInviteToken(params: {
    token: string;
    email: string;
    ttlSeconds: number;
  }): Promise<void> {
    const { token, email, ttlSeconds } = params;
    const emailTokenKey = REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email);
    const existingToken = await this.cacheService.get<string>(emailTokenKey);

    if (existingToken) {
      await this.cacheService.del(REDIS_KEYS.MENTOR_INVITE(existingToken));
    }

    await this.cacheService.set(REDIS_KEYS.MENTOR_INVITE(token), email, ttlSeconds);
    await this.cacheService.set(emailTokenKey, token, ttlSeconds);
  }

  async getValidMentorInviteEmail(token: string): Promise<string | null> {
    const email = await this.cacheService.get<string>(REDIS_KEYS.MENTOR_INVITE(token));
    if (!email) {
      return null;
    }

    const latestToken = await this.cacheService.get<string>(REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email));
    if (latestToken !== token) {
      return null;
    }

    return email;
  }

  async consumeMentorInviteToken(params: { token: string; email: string }): Promise<void> {
    const { token, email } = params;
    await this.cacheService.del(REDIS_KEYS.MENTOR_INVITE(token));

    const latestToken = await this.cacheService.get<string>(REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email));
    if (latestToken === token) {
      await this.cacheService.del(REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email));
    }
  }
}

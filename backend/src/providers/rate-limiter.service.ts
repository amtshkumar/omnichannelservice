import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private redis: Redis;

  // Default rate limits per provider
  private readonly providerLimits: Record<string, RateLimitConfig> = {
    SENDGRID: { maxRequests: 100, windowMs: 1000 }, // 100 per second
    TWILIO: { maxRequests: 10, windowMs: 1000 }, // 10 per second
    SMTP: { maxRequests: 50, windowMs: 1000 }, // 50 per second
    MOCK: { maxRequests: 1000, windowMs: 1000 }, // 1000 per second
  };

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD') || undefined,
    });
  }

  /**
   * Check if request is allowed under rate limit
   */
  async checkRateLimit(
    providerType: string,
    identifier: string = 'default',
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const config = this.providerLimits[providerType] || {
      maxRequests: 100,
      windowMs: 1000,
    };

    const key = `ratelimit:${providerType}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Remove old entries outside the window
      await this.redis.zremrangebyscore(key, 0, windowStart);

      // Count current requests in window
      const currentCount = await this.redis.zcard(key);

      if (currentCount >= config.maxRequests) {
        // Get the oldest request timestamp to calculate reset time
        const oldestTimestamp = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetAt = new Date(
          parseInt(oldestTimestamp[1]) + config.windowMs,
        );

        this.logger.warn(
          `Rate limit exceeded for ${providerType}:${identifier}. Limit: ${config.maxRequests}/${config.windowMs}ms`,
        );

        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }

      // Add current request
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);
      await this.redis.pexpire(key, config.windowMs);

      return {
        allowed: true,
        remaining: config.maxRequests - currentCount - 1,
        resetAt: new Date(now + config.windowMs),
      };
    } catch (error) {
      this.logger.error(`Rate limit check failed: ${error.message}`);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(now + config.windowMs),
      };
    }
  }

  /**
   * Update rate limit configuration for a provider
   */
  setProviderLimit(providerType: string, config: RateLimitConfig) {
    this.providerLimits[providerType] = config;
    this.logger.log(
      `Updated rate limit for ${providerType}: ${config.maxRequests}/${config.windowMs}ms`,
    );
  }

  /**
   * Get current rate limit config for provider
   */
  getProviderLimit(providerType: string): RateLimitConfig {
    return this.providerLimits[providerType] || {
      maxRequests: 100,
      windowMs: 1000,
    };
  }

  /**
   * Reset rate limit for a provider
   */
  async resetRateLimit(providerType: string, identifier: string = 'default') {
    const key = `ratelimit:${providerType}:${identifier}`;
    await this.redis.del(key);
    this.logger.log(`Reset rate limit for ${providerType}:${identifier}`);
  }
}

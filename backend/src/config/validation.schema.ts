import * as Joi from 'joi';

export const validationSchema = Joi.object({
  APP_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
  APP_PORT: Joi.number().default(3000),
  APP_HOST: Joi.string().default('0.0.0.0'),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

  SENDGRID_API_KEY: Joi.string().allow('').optional(),
  TWILIO_ACCOUNT_SID: Joi.string().allow('').optional(),
  TWILIO_AUTH_TOKEN: Joi.string().allow('').optional(),

  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),

  ENCRYPTION_KEY: Joi.string().length(32).required(),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
});

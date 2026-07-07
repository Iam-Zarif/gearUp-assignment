import dotenv from "dotenv";

dotenv.config();

const config = {
  node_env: process.env.NODE_ENV || "development",
  port: process.env.PORT || "5000",
  database_url: process.env.DATABASE_URL as string,

  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET as string,
    refresh_secret: process.env.JWT_REFRESH_SECRET as string,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),

  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY as string,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET as string,
    success_url: process.env.CLIENT_SUCCESS_URL as string,
    cancel_url: process.env.CLIENT_CANCEL_URL as string,
  },

  admin: {
    email: process.env.ADMIN_EMAIL as string,
    password: process.env.ADMIN_PASSWORD as string,
  },
};

export default config;
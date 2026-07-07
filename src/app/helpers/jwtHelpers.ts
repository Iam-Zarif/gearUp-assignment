import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { UserRole } from "../../generated/prisma/client";

type TJwtPayload = {
  id: string;
  email: string;
  role: UserRole;
};

const createToken = (
  payload: TJwtPayload,
  secret: string,
  expiresIn: string
) => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload & TJwtPayload;
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
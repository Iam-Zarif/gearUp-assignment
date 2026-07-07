import { NextFunction, Request, Response } from "express";
import { UserRole, UserStatus } from "../../generated/prisma/client";
import config from "../config";
import AppError from "../errors/AppError";
import catchAsync from "../helpers/catchAsync";
import { jwtHelpers } from "../helpers/jwtHelpers";
import { prisma } from "../helpers/prisma";

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const token =
      req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.cookies?.accessToken;

    if (!token) {
      throw new AppError(401, "You are not authorized");
    }

    const decoded = jwtHelpers.verifyToken(token, config.jwt.access_secret);

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError(403, "This user is suspended");
    }

    if (requiredRoles.length && !requiredRoles.includes(decoded.role)) {
      throw new AppError(403, "You are not allowed to access this resource");
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  });
};

export default auth;
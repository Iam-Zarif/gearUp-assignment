import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
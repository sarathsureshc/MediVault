import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const validate =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessage = (error as any).errors
          .map((err: any) => err.message)
          .join(". ");
        return next(new AppError(errorMessage, 400));
      }
      next(error);
    }
  };

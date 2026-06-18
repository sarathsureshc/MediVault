import jwt from "jsonwebtoken";
import { config } from "../config";

export const signToken = (id: string) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiration as any,
  });
};

export const signRefreshToken = (id: string) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtRefreshExpiration as any,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret) as {
    id: string;
    iat: number;
    exp: number;
  };
};

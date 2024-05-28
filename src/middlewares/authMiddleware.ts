import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface JwtPayload {
  id: string;
  role: string;
}

const JWT_SECRET = "your_secret_key"; // Gantilah dengan secret key Anda sendiri

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Invalid token",
    });
  }
};

export const checkAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = (req as any).user as JwtPayload;
  if (user && user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      status: false,
      message: "Access denied, admin only.",
    });
  }
};

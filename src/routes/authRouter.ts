import { register, login } from "../controllers/authControllers";
// import { handleRegisterUser } from "../middlewares/authMiddleware";
import express from "express";

export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);

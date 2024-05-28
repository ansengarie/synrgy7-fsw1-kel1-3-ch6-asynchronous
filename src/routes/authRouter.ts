import {
  register,
  login,
  getAllUsers,
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "../controllers/authControllers";
import { checkAuth, checkAdmin } from "../middlewares/authMiddleware";
import express from "express";

export const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.get("/users", checkAuth, checkAdmin, getAllUsers);

// Invoice routes
authRouter.post("/tagihan", checkAuth, checkAdmin, createInvoice);
authRouter.get("/tagihan", checkAuth, checkAdmin, getAllInvoices);
authRouter.get("/tagihan/:id", checkAuth, checkAdmin, getInvoiceById);
authRouter.patch("/tagihan/:id", checkAuth, updateInvoice); // Admin and customer (with restrictions)
authRouter.delete("/tagihan/:id", checkAuth, checkAdmin, deleteInvoice);

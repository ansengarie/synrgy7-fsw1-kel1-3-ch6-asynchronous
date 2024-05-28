import express from "express";
import {
  getAllInvoice,
  getInvoiceById,
  createInvoice,
  deleteInvoice,
  updateStatus,
} from "../../controllers/admin/InvoiceController";
import { checkAuth } from "../../middlewares/authMiddleware";
export const invoiceRouter = express.Router();

invoiceRouter.get("/", checkAuth, getAllInvoice);
invoiceRouter.get("/:id", checkAuth, getInvoiceById);
invoiceRouter.post("/", checkAuth, createInvoice);
invoiceRouter.delete("/:id", checkAuth, deleteInvoice);
invoiceRouter.put("/status/:id", checkAuth, updateStatus);

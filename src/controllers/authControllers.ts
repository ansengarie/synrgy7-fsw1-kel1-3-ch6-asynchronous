import { Request, Response, NextFunction } from "express";
import { UsersModel } from "../database/model/users.model";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { InvoiceModel } from "../database/model/invoice.model";
import { TypeInvoiceModel } from "../database/model/type_invoice.model";

const JWT_SECRET = "your_secret_key"; // Gantilah dengan secret key Anda sendiri

const encryptPassword = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(hash);
    });
  });
};

const checkPassword = (password: string, hash: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role } = req.body;
    const existingUser = await UsersModel.query().findOne({ username });

    if (!username || !password || !role) {
      res.status(400).json({
        status: false,
        message: "Username, password, and role are required",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        status: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    if (existingUser) {
      res.status(400).json({
        status: false,
        message: "Username already exists",
      });
      return;
    }

    const hashedPassword = await encryptPassword(password);
    const payload = {
      ...req.body,
      password: hashedPassword,
      id: uuidv4(),
    };
    await UsersModel.query().insert(payload);

    res.status(201).json({
      status: true,
      message: "Register Success",
      data: {
        id: payload.id,
        username: payload.username,
        role: payload.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: JSON.stringify(error),
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await UsersModel.query().findOne({ username });

    if (!user || !username || !password) {
      res.status(401).json({
        status: false,
        message: "Username or password wrong",
      });
      return;
    }

    const isPasswordMatch = await checkPassword(password, user.password);

    if (!isPasswordMatch) {
      res.status(401).json({
        status: false,
        message: "Username or password wrong",
      });
      return;
    } else {
      const payload = {
        id: user.id,
        role: user.role,
      };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(200).json({
        status: true,
        message: "Login Success",
        token,
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: JSON.stringify(error),
    });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await UsersModel.query();
    res.status(200).json({
      status: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: JSON.stringify(error),
    });
  }
};

export const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id, type_invoice_id, status, quantity } = req.body;

    const getTypeInvoiceById = await TypeInvoiceModel.query().findById(
      type_invoice_id
    );

    if (getTypeInvoiceById) {
      const typeInvoice = await InvoiceModel.query().insert({
        user_id,
        type_invoice_id,
        status,
        quantity,
        total_amount: getTypeInvoiceById.price * quantity,
      });
      if (typeInvoice) {
        res.status(200).json({
          status: "Success",
          message: `Create new invoice successfully`,
        });
      } else {
        res
          .status(400)
          .json({ status: "Failed", message: `Failed to create new invoice` });
      }
    } else {
      res.status(404).json({
        status: "Not Found",
        message: `Type invoice with id ${type_invoice_id} not found`,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoices = await InvoiceModel.query();
    res.status(200).json({
      status: "Success",
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceModel.query().findById(id);
    if (invoice) {
      res.status(200).json({
        status: "Success",
        data: invoice,
      });
    } else {
      res.status(404).json({
        status: "Not Found",
        message: `Invoice with id ${id} not found`,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    const invoice = await InvoiceModel.query().findById(id);
    if (!invoice) {
      res.status(404).json({
        status: "Not Found",
        message: `Invoice with id ${id} not found`,
      });
      return;
    }

    if (user.role === "admin") {
      // Admin can update any field
      const updatedInvoice = await InvoiceModel.query().patchAndFetchById(
        id,
        req.body
      );
      res.status(200).json({
        status: "Success",
        data: updatedInvoice,
      });
    } else if (
      user.role === "customer" &&
      status === "paid" &&
      invoice.status === "unpaid"
    ) {
      // Customer can only update status from unpaid to paid
      const updatedInvoice = await InvoiceModel.query().patchAndFetchById(id, {
        status: "paid",
      });
      res.status(200).json({
        status: "Success",
        data: updatedInvoice,
      });
    } else {
      res.status(403).json({
        status: "Forbidden",
        message: "You are not allowed to update this invoice",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedRows = await InvoiceModel.query().deleteById(id);
    if (deletedRows) {
      res.status(200).json({
        status: "Success",
        message: `Invoice with id ${id} deleted successfully`,
      });
    } else {
      res.status(404).json({
        status: "Not Found",
        message: `Invoice with id ${id} not found`,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getCustomerInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;

    // Check if the user is a customer
    if (user.role !== "customer") {
      res.status(403).json({
        status: "Forbidden",
        message: "You are not allowed to access this endpoint",
      });
      return;
    }

    // Retrieve invoices for the customer
    const customerInvoices = await InvoiceModel.query().where(
      "customer_id",
      user.id
    );

    res.status(200).json({
      status: "Success",
      data: customerInvoices,
    });
  } catch (error) {
    next(error);
  }
};

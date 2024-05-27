import { Request, Response } from "express";
import { UsersModel } from "../database/model/users.model";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

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
    const { username, password } = req.body;
    const existingUser = await UsersModel.query().findOne({ username });

    if (!username || !password) {
      res.status(400).json({
        status: false,
        message: "Username and password are required",
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
      data: payload,
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
    }

    res.status(200).json({
      status: true,
      message: "Login Success",
      data: user,
    });
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

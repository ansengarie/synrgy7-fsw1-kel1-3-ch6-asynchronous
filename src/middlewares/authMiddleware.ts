// import { Request, Response, NextFunction } from "express";
// import { registerUser } from "../controllers/authControllers";

// export const handleRegisterUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { username, password } = req.body;
//     await registerUser(username, password);
//     res
//       .status(201)
//       .json({ message: "User registered successfully", success: true });
//   } catch (error) {
//     next(error);
//   }
// };

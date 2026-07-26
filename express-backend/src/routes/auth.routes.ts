import { Router } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";
import { registerSchema, loginSchema } from "@catalog/shared";
import { register, login } from "../controllers/auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));

export default router;

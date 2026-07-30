import { Router } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";
import { requestOtpSchema, verifyOtpSchema } from "@catalog/shared";
import { requestOtp, verifyOtp } from "../controllers/otp.controller";

const router = Router();

router.post("/request", validate(requestOtpSchema), asyncHandler(requestOtp));
router.post("/verify", validate(verifyOtpSchema), asyncHandler(verifyOtp));

export default router;

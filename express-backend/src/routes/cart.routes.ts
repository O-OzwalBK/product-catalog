import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";
import {
  addToCartSchema,
  updateCartItemSchema,
  productIdParamSchema,
} from "@catalog/shared";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cart.controller";

const router = Router();

// Every route below requires a valid Bearer token — applied once here
// instead of repeating requireAuth on each route individually.
router.use(requireAuth);

router.get("/", asyncHandler(getCart));
router.post("/", validate(addToCartSchema), asyncHandler(addToCart));
router.patch(
  "/:productId",
  validate(productIdParamSchema, "params"),
  validate(updateCartItemSchema),
  asyncHandler(updateCartItem),
);
router.delete(
  "/:productId",
  validate(productIdParamSchema, "params"),
  asyncHandler(removeCartItem),
);

export default router;

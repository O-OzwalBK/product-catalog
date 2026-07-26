import { Router } from "express";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";
import { listProductsQuerySchema, slugParamSchema } from "@catalog/shared";
import {
  listProducts,
  getProductBySlug,
} from "../controllers/products.controller";

const router = Router();

router.get(
  "/",
  validate(listProductsQuerySchema, "query"),
  asyncHandler(listProducts),
);
router.get(
  "/:slug",
  validate(slugParamSchema, "params"),
  asyncHandler(getProductBySlug),
);

export default router;

import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";
import {
  listProductsQuerySchema,
  slugParamSchema,
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
} from "@catalog/shared";
import {
  listProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller";

console.log({
  productIdParamSchema,
  createProductSchema,
  updateProductSchema,
});

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

// Protected Admin Mutation Routes
router.post(
  "/",
  requireAuth,
  validate(createProductSchema),
  asyncHandler(createProduct),
);

router.patch(
  "/:productId",
  requireAuth,
  validate(productIdParamSchema, "params"),
  validate(updateProductSchema),
  asyncHandler(updateProduct),
);

router.delete(
  "/:productId",
  requireAuth,
  validate(productIdParamSchema, "params"),
  asyncHandler(deleteProduct),
);
export default router;

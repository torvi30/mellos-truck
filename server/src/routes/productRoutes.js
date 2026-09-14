import express from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  updateStock,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.patch("/:id/stock", updateStock);

export default router;

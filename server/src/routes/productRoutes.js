import express from "express";
import {
  getProducts,
  createProduct,
  updateStock,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.patch("/:id/stock", updateStock);

export default router;

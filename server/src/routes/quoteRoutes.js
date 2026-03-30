import express from "express";
import {
  createQuote,
  getQuotes,
  updateQuoteStatus,
  convertQuoteToClient,
} from "../controllers/quoteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getQuotes);
router.post("/", protect, createQuote);
router.put("/:id/status", protect, updateQuoteStatus);
router.post("/:id/convert", protect, convertQuoteToClient);

export default router;
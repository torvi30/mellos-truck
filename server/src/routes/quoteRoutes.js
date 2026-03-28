import express from "express";
import {
  createQuote,
  deleteQuote,
  getQuotes,
  updateQuoteStatus
} from "../controllers/quoteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createQuote);
router.get("/", protect, getQuotes);
router.put("/:id/status", protect, updateQuoteStatus);
router.delete("/:id", protect, deleteQuote);

export default router;
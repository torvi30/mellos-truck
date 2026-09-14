import express from "express";
import {
  getTelegramStatus,
  updateConfig,
  sendTestAlert,
} from "../controllers/telegramController.js";

const router = express.Router();

router.get("/status", getTelegramStatus);
router.post("/config", updateConfig);
router.post("/test", sendTestAlert);

export default router;

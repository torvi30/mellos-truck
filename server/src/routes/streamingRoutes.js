import express from "express";
import { streamVideo } from "../controllers/streaming.controller.js";

const router = express.Router();

/**
 * Ruta para servir videos en chunks HTTP 206 Partial Content
 * GET /api/stream/video/:filename
 */
router.get("/video/:filename", streamVideo);

export default router;

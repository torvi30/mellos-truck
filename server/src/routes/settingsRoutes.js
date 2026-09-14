import express from "express";
import {
  getLandingConfig,
  updateLandingConfig,
  resetLandingConfig,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta pública para que la Landing Page consuma los datos
router.get("/landing", getLandingConfig);

// Rutas protegidas para el panel de administración
router.put("/landing", protect, updateLandingConfig);
router.post("/landing/reset", protect, resetLandingConfig);

export default router;

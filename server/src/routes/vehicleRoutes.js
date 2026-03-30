import { Router } from "express";
import { createVehicle, getVehicles } from "../controllers/vehicleController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", protect, getVehicles);
router.post("/", protect, createVehicle);

export default router;
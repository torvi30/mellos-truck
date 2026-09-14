import express from "express";
import {
  listShowroomProjects,
  createShowroomProject,
  generateMagicLink,
  getShowroomBySlug,
} from "../controllers/showroom.controller.js";

const router = express.Router();

/**
 * Listar todos los proyectos con Magic Link
 * GET /api/showroom
 */
router.get("/", listShowroomProjects);

/**
 * Crear un nuevo proyecto y emitir Magic Link
 * POST /api/showroom
 */
router.post("/", createShowroomProject);

/**
 * Generar Magic Link para una orden específica
 * POST /api/showroom/orders/:id/magic-link
 */
router.post("/orders/:id/magic-link", generateMagicLink);

/**
 * Consulta pública de solo lectura para el cliente y visitantes
 * GET /api/showroom/:slug
 */
router.get("/:slug", getShowroomBySlug);

export default router;

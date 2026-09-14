import express from "express";
import {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrderStatus,
  updateWorkOrder,
  assignWorkOrderItem,
  removeWorkOrderItem,
  deleteWorkOrder,
  toggleArchiveWorkOrder,
} from "../controllers/workOrderController.js";

const router = express.Router();

router.get("/", getWorkOrders);
router.post("/", createWorkOrder);
router.put("/:id", updateWorkOrder);
router.patch("/:id/status", updateWorkOrderStatus);
router.patch("/:id/archive", toggleArchiveWorkOrder);
router.post("/:id/items", assignWorkOrderItem);
router.delete("/:id/items/:itemId", removeWorkOrderItem);
router.delete("/:id", deleteWorkOrder);

export default router;

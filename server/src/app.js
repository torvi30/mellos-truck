import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import streamingRoutes from "./routes/streamingRoutes.js";
import showroomRoutes from "./routes/showroomRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import workOrderRoutes from "./routes/workOrderRoutes.js";
import telegramRoutes from "./routes/telegramRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

app.get("/", (req, res) => {
  res.json({ message: "API de Mellos Trucks funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/stream", streamingRoutes);
app.use("/api/showroom", showroomRoutes);
app.use("/api/products", productRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/telegram", telegramRoutes);
app.use("/api/settings", settingsRoutes);

export default app;
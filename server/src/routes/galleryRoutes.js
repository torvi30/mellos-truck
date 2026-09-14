import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGalleryContent,
  uploadImage,
  uploadVideo,
  deleteGalleryFile,
} from "../controllers/galleryController.js";
import { ensureUploadDirs, uploadsBase } from "../utils/storage.js";

const router = express.Router();

const buildStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const category = req.body?.category || "catalog";
      const targetDir = path.join(uploadsBase, subfolder, category);
      fs.mkdirSync(targetDir, { recursive: true });
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
      cb(null, `${Date.now()}-${base}${ext}`);
    },
  });

ensureUploadDirs();

const imageStorage = buildStorage("images");
const videoStorage = buildStorage("videos");

const imageUpload = multer({ storage: imageStorage });
const videoUpload = multer({ storage: videoStorage });

router.get("/", getGalleryContent);
router.post("/upload/image", protect, imageUpload.single("file"), uploadImage);
router.post("/upload/video", protect, videoUpload.single("file"), uploadVideo);
router.delete("/:type/:filename", protect, deleteGalleryFile);

export default router;
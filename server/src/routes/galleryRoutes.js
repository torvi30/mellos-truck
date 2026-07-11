import express from "express";
import multer from "multer";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGalleryContent,
  uploadImage,
  uploadVideo,
  deleteGalleryFile,
} from "../controllers/galleryController.js";

const router = express.Router();

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/videos");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const imageUpload = multer({ storage: imageStorage });
const videoUpload = multer({ storage: videoStorage });

router.get("/", getGalleryContent);
router.post("/upload/image", protect, imageUpload.single("file"), uploadImage);
router.post("/upload/video", protect, videoUpload.single("file"), uploadVideo);
router.delete("/:type/:filename", protect, deleteGalleryFile);

export default router;
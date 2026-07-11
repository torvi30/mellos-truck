import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsBase = path.join(__dirname, "../../uploads");
const imagesDir = path.join(uploadsBase, "images");
const videosDir = path.join(uploadsBase, "videos");

const ensureDirs = () => {
  if (!fs.existsSync(uploadsBase)) fs.mkdirSync(uploadsBase);
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir);
};

ensureDirs();

export const getGalleryContent = async (req, res) => {
  try {
    const imageFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
    const videoFiles = fs.existsSync(videosDir) ? fs.readdirSync(videosDir) : [];

    const images = imageFiles.map((file) => ({
      name: file,
      url: `http://localhost:4000/uploads/images/${file}`,
      type: "image",
    }));

    const videos = videoFiles.map((file) => ({
      name: file,
      url: `http://localhost:4000/uploads/videos/${file}`,
      type: "video",
    }));

    res.json({
      images,
      videos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo galería",
      error: error.message,
    });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No se recibió ninguna imagen",
      });
    }

    res.status(201).json({
      message: "Imagen subida correctamente",
      file: {
        name: req.file.filename,
        url: `http://localhost:4000/uploads/images/${req.file.filename}`,
        type: "image",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error subiendo imagen",
      error: error.message,
    });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No se recibió ningún video",
      });
    }

    res.status(201).json({
      message: "Video subido correctamente",
      file: {
        name: req.file.filename,
        url: `http://localhost:4000/uploads/videos/${req.file.filename}`,
        type: "video",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error subiendo video",
      error: error.message,
    });
  }
};

export const deleteGalleryFile = async (req, res) => {
  try {
    const { type, filename } = req.params;

    if (!["images", "videos"].includes(type)) {
      return res.status(400).json({
        message: "Tipo de archivo no válido",
      });
    }

    const targetDir = type === "images" ? imagesDir : videosDir;
    const targetPath = path.join(targetDir, filename);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({
        message: "Archivo no encontrado",
      });
    }

    fs.unlinkSync(targetPath);

    res.json({
      message: "Archivo eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error eliminando archivo",
      error: error.message,
    });
  }
};
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ensureUploadDirs } from "../utils/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsBase = path.join(__dirname, "../../uploads");
const videosDir = path.join(uploadsBase, "videos");

ensureUploadDirs();

const buildFileUrl = (relativePath) => `http://localhost:4000/uploads/${relativePath.replace(/\\/g, "/")}`;

const listFilesRecursive = (directory) => {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFilesRecursive(fullPath);
    return [{ name: entry.name, relativePath: path.relative(uploadsBase, fullPath) }];
  });
};

export const getGalleryContent = async (req, res) => {
  try {
    const imageFiles = listFilesRecursive(path.join(uploadsBase, "images"));
    const videoFiles = listFilesRecursive(videosDir);

    const images = imageFiles.map((file) => ({
      name: file.name,
      url: buildFileUrl(file.relativePath),
      type: "image",
      path: file.relativePath,
    }));

    const videos = videoFiles.map((file) => ({
      name: file.name,
      url: buildFileUrl(file.relativePath),
      type: "video",
      path: file.relativePath,
    }));

    res.json({ images, videos });
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
      return res.status(400).json({ message: "No se recibió ninguna imagen" });
    }

    const category = req.body?.category || "catalog";
    const publicUrl = `http://localhost:4000/uploads/images/${category}/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "Imagen subida correctamente",
      file: {
        name: req.file.filename,
        url: publicUrl,
        type: "image",
        path: `images/${category}/${req.file.filename}`,
        category,
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
      return res.status(400).json({ message: "No se recibió ningún video" });
    }

    res.status(201).json({
      message: "Video subido correctamente",
      file: {
        name: req.file.filename,
        url: `http://localhost:4000/uploads/${req.file.path.replace(/\\/g, "/")}`,
        type: "video",
        path: req.file.path.replace(/\\/g, "/"),
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
      return res.status(400).json({ message: "Tipo de archivo no válido" });
    }

    const targetPath = path.join(uploadsBase, type, filename);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ message: "Archivo no encontrado" });
    }

    fs.unlinkSync(targetPath);

    res.json({ message: "Archivo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error eliminando archivo",
      error: error.message,
    });
  }
};
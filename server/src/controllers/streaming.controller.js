import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_VIDEO_ROOT = path.resolve(__dirname, "../../uploads/videos");

const MIME_TYPES = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
};

/**
 * Controlador de Video Streaming en Express (HTTP 206 Partial Content)
 * Diseñado para reproducir tomas aéreas de dron y grabaciones cinematográficas en 4K
 * de manera instantánea y sin bloqueos de red ni de servidor.
 */
export const streamVideo = (req, res) => {
  try {
    const requestedFile = req.params.filename || req.query.file;
    if (!requestedFile) {
      return res.status(400).json({ message: "Nombre de archivo de video no especificado" });
    }

    // Prevención estricta de Path Traversal
    const safeFilePath = path.resolve(UPLOADS_VIDEO_ROOT, path.basename(requestedFile));
    if (!safeFilePath.startsWith(UPLOADS_VIDEO_ROOT)) {
      return res.status(403).json({ message: "Acceso no autorizado al archivo solicitado" });
    }

    if (!fs.existsSync(safeFilePath)) {
      return res.status(404).json({ message: "El video no existe en el servidor" });
    }

    const stat = fs.statSync(safeFilePath);
    const fileSize = stat.size;
    const ext = path.extname(safeFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "video/mp4";

    const range = req.headers.range;

    if (range) {
      // Formato esperado de cabecera: "bytes=32324-" o "bytes=32324-64648"
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      
      // Tamaño máximo de chunk para streaming óptimo (2MB)
      const MAX_CHUNK_SIZE = 2 * 1024 * 1024;
      
      let end = parts[1] ? parseInt(parts[1], 10) : start + MAX_CHUNK_SIZE;
      if (end >= fileSize) {
        end = fileSize - 1;
      }

      // Validación de rango fuera de límites
      if (start >= fileSize || start > end) {
        res.setHeader("Content-Range", `bytes */${fileSize}`);
        return res.status(416).send("Rango solicitado no satisfacible (Requested Range Not Satisfiable)");
      }

      const contentLength = end - start + 1;
      const fileStream = fs.createReadStream(safeFilePath, { start, end });

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      };

      res.writeHead(206, headers);

      fileStream.on("error", (streamErr) => {
        console.error("Error en streaming del video:", streamErr);
        if (!res.headersSent) {
          res.status(500).send("Error al transmitir fragmento de video");
        }
      });

      fileStream.pipe(res);
    } else {
      // Cliente no envió cabecera Range; enviar archivo completo
      const headers = {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
      };

      res.writeHead(200, headers);
      const fullStream = fs.createReadStream(safeFilePath);
      fullStream.on("error", (streamErr) => {
        console.error("Error al transmitir archivo completo:", streamErr);
        if (!res.headersSent) {
          res.status(500).send("Error al transmitir video");
        }
      });
      fullStream.pipe(res);
    }
  } catch (error) {
    console.error("Error general en controlador de streaming:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error interno del servidor en video streaming", error: error.message });
    }
  }
};

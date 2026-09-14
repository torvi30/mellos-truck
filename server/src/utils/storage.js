import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadsBase = path.join(__dirname, "../../uploads");

export const ensureUploadDirs = () => {
  const dirs = [
    uploadsBase,
    path.join(uploadsBase, "images"),
    path.join(uploadsBase, "images", "catalog"),
    path.join(uploadsBase, "images", "products"),
    path.join(uploadsBase, "images", "before_after"),
    path.join(uploadsBase, "images", "vehicles"),
    path.join(uploadsBase, "images", "services"),
    path.join(uploadsBase, "videos"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
};

ensureUploadDirs();

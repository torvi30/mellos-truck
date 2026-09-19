import React, { useState, useRef, useEffect } from "react";
import { storageService } from "../services/firebaseService.js";
import { showErrorToast, showSuccessToast } from "../utils/alerts";
import { UploadCloud, Image, Link2, X, Check, Loader2 } from "lucide-react";

export default function ImageUploader({
  label = "Fotografía",
  value = "",
  currentUrl = "",
  category = "catalog",
  onChange,
  onImageChange,
  aspectRatio = "16/9",
}) {
  const initialImg = value || currentUrl || "";
  const [preview, setPreview] = useState(initialImg);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState("file"); // "file" | "url"
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef(null);

  const notifyChange = (url) => {
    setPreview(url);
    if (onChange) onChange(url);
    if (onImageChange) onImageChange(url);
  };

  useEffect(() => {
    if (value || currentUrl) {
      setPreview(value || currentUrl);
    }
  }, [value, currentUrl]);

  const processFile = async (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      showErrorToast("Formato no válido. Usa JPG, PNG o WEBP.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showErrorToast("La imagen supera el límite de 15MB.");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const res = await storageService.uploadFile(file, category, (pct) => {
        setProgress(Math.round(pct));
      });
      if (res && res.url) {
        notifyChange(res.url);
        showSuccessToast("¡Fotografía cargada exitosamente!");
      }
    } catch (err) {
      console.warn("Error en subida:", err);
      showErrorToast("No se pudo cargar la imagen a Storage");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    notifyChange(urlInput.trim());
    setUrlInput("");
    showSuccessToast("URL de imagen aplicada");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">{label}</span>
        <div className="flex gap-1 bg-carbon-900 p-0.5 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              mode === "file" ? "bg-amber-500 text-carbon-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Subir Archivo
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              mode === "url" ? "bg-amber-500 text-carbon-950" : "text-slate-400 hover:text-white"
            }`}
          >
            Pegar URL
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className={`relative rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
            isDragging
              ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
              : "border-white/15 bg-carbon-900/60 hover:border-amber-500/40 hover:bg-carbon-900"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
          />

          {uploading ? (
            <div className="space-y-2 py-2">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
              <div className="text-xs font-bold text-amber-400">Subiendo a Storage... {progress}%</div>
            </div>
          ) : preview ? (
            <div className="relative w-full flex items-center justify-center group">
              <img
                src={preview}
                alt="Vista previa"
                className="max-h-36 max-w-full rounded-lg object-contain shadow-md"
                onError={(e) => {
                  e.target.src = "/images/showroom/detail_bumper_chrome.jpg";
                }}
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <span className="text-xs font-bold text-white bg-carbon-900 px-3 py-1.5 rounded-lg border border-white/10">
                  Haz clic para cambiar
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    notifyChange("");
                  }}
                  className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  title="Quitar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 py-2">
              <UploadCloud className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">
                Arrastra o <span className="text-amber-400 underline">selecciona una imagen</span>
              </p>
              <p className="text-[10px] text-slate-500">JPG, PNG o WEBP (máx. 15MB)</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://... o /images/showroom/..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-carbon-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-carbon-950 hover:brightness-110"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}

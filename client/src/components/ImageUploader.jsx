import React, { useState, useRef, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "../utils/alerts";

export default function ImageUploader({
  label = "Foto",
  currentUrl = "",
  category = "catalog",
  onImageChange,
  aspectRatio = "16/9",
  helperText = "Arrastra una imagen o haz clic para seleccionarla (JPG, PNG, WEBP)",
}) {
  const [preview, setPreview] = useState(currentUrl);
  const [localBlob, setLocalBlob] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState("file"); // "file" | "url"
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!localBlob) {
      setPreview(currentUrl);
    }
  }, [currentUrl, localBlob]);

  // Manejador al arrastrar archivo sobre la zona
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file) return;

    // Validación de tipo
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      showErrorToast("Formato no válido. Usa JPG, PNG o WEBP.");
      return;
    }

    // Validación de tamaño (12MB máx)
    if (file.size > 12 * 1024 * 1024) {
      showErrorToast("La imagen supera el límite de 12MB.");
      return;
    }

    // 1. Previsualización instantánea a 0 ms usando el blob local exacto del archivo
    const objectUrl = URL.createObjectURL(file);
    setLocalBlob(objectUrl);
    setPreview(objectUrl);

    // 2. Subida asíncrona al servidor Express
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const token = localStorage.getItem("token") || "dev-mock-token-mellostruck";
      const res = await fetch("http://localhost:4000/api/gallery/upload/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.file?.url) {
        if (onImageChange) {
          onImageChange(data.file.url, file);
        }
        showSuccessToast("Imagen cargada con éxito");
      } else {
        // Fallback: usar el objectUrl local si el backend estuviera desconectado
        if (onImageChange) {
          onImageChange(objectUrl, file);
        }
      }
    } catch (err) {
      console.warn("Error subiendo imagen al backend, usando preview local:", err);
      if (onImageChange) {
        onImageChange(objectUrl, file);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setLocalBlob("");
    setPreview(urlInput.trim());
    if (onImageChange) {
      onImageChange(urlInput.trim(), null);
    }
    showSuccessToast("Enlace de imagen aplicado");
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (localBlob) {
      try {
        URL.revokeObjectURL(localBlob);
      } catch (_) {}
    }
    setLocalBlob("");
    setPreview("");
    setUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onImageChange) {
      onImageChange("", null);
    }
  };

  return (
    <div className="image-uploader-wrapper">
      {/* Header del Uploader */}
      <div className="image-uploader-label">
        <span>{label}</span>
        <div style={{ display: "flex", gap: "0.4rem", fontSize: "0.72rem" }}>
          <button
            type="button"
            onClick={() => setMode("file")}
            style={{
              background: mode === "file" ? "rgba(245, 158, 11, 0.25)" : "transparent",
              color: mode === "file" ? "#f59e0b" : "#94a3b8",
              border: "none",
              borderRadius: "4px",
              padding: "0.15rem 0.4rem",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            📁 Archivo
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            style={{
              background: mode === "url" ? "rgba(56, 189, 248, 0.25)" : "transparent",
              color: mode === "url" ? "#38bdf8" : "#94a3b8",
              border: "none",
              borderRadius: "4px",
              padding: "0.15rem 0.4rem",
              cursor: "pointer",
              fontWeight: "700",
            }}
          >
            🔗 URL
          </button>
        </div>
      </div>

      {mode === "url" ? (
        /* Pestaña de URL directa */
        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.2rem" }}>
          <input
            type="url"
            placeholder="https://ejemplo.com/mula-after.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{
              flex: 1,
              padding: "0.55rem 0.8rem",
              borderRadius: "8px",
              background: "#0c0e12",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              fontSize: "0.82rem",
            }}
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            style={{
              padding: "0.55rem 0.9rem",
              background: "linear-gradient(135deg, #38bdf8, #0284c7)",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontWeight: "900",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Aplicar
          </button>
        </div>
      ) : null}

      {/* Vista Previa o Zona de Arrastre */}
      {preview ? (
        <div className="image-uploader-preview-box">
          <img
            src={preview}
            alt={label}
            className="image-uploader-preview-img"
            style={{ aspectRatio }}
            onError={(e) => {
              if (localBlob && e.target.src !== localBlob) {
                e.target.src = localBlob;
              }
            }}
          />

          {uploading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <div style={{ fontSize: "1.8rem" }}>⏳</div>
              <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "#f59e0b" }}>
                Subiendo al servidor...
              </span>
            </div>
          )}

          <div className="image-uploader-overlay">
            <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: "800" }}>
              ✓ Lista para guardar
            </span>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "0.35rem 0.65rem",
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                🔄 Cambiar
              </button>
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  padding: "0.35rem 0.65rem",
                  background: "rgba(239, 68, 68, 0.3)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(239, 68, 68, 0.5)",
                  color: "#fca5a5",
                  borderRadius: "6px",
                  fontSize: "0.72rem",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                🗑️ Quitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`image-uploader-dropzone ${isDragging ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>
            {isDragging ? "📥" : "📸"}
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#f8fafc" }}>
            {isDragging ? "Suelta la imagen aquí" : "Arrastra la foto o haz clic"}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.25rem", maxWidth: "260px" }}>
            {helperText}
          </div>
          <div
            style={{
              marginTop: "0.6rem",
              padding: "0.3rem 0.8rem",
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: "6px",
              color: "#f59e0b",
              fontSize: "0.72rem",
              fontWeight: "800",
            }}
          >
            Examinar Archivo
          </div>
        </div>
      )}

      {/* Input de archivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

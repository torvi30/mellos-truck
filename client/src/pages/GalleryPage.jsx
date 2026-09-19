import React, { useEffect, useState } from "react";
import {
  getGalleryRequest,
  uploadGalleryImageRequest,
  uploadGalleryVideoRequest,
} from "../api/api";
import { showSuccessToast, showErrorToast } from "../utils/alerts";
import {
  Image,
  Upload,
  Film,
  Package,
  Truck,
  Plus,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function GalleryPage() {
  const [catalogImages, setCatalogImages] = useState([]);
  const [vehicleImages, setVehicleImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "catalog" | "vehicles" | "videos"

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await getGalleryRequest();
      setCatalogImages(Array.isArray(data.catalog) ? data.catalog : []);
      setVehicleImages(Array.isArray(data.vehicles) ? data.vehicles : []);
      setVideos(Array.isArray(data.videos) ? data.videos : []);
    } catch (error) {
      console.error("Error cargando galería:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleUpload = async (e, category = "catalog") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadGalleryImageRequest(file, category);
      showSuccessToast("¡Archivo subido exitosamente a Firebase Storage!");
      await loadGallery();
    } catch (err) {
      showErrorToast("Error al subir archivo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header de Galería */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
            <Image className="w-4 h-4" />
            <span>Biblioteca Multimedia & Cloud Storage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Galería Multimedia 4K
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Archivos de alta resolución de bompers, viseras americanas y tomas de mulas en taller.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 shadow-lg shadow-amber-500/20 hover:brightness-110 cursor-pointer transition-all">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{uploading ? "Subiendo..." : "Subir a Storage"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleUpload(e, "catalog")}
            />
          </label>
        </div>
      </div>

      {/* 2. Pestañas de Filtrado */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "all"
              ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
              : "bg-carbon-900 text-slate-400 hover:text-white"
          }`}
        >
          Todos ({catalogImages.length + vehicleImages.length + videos.length})
        </button>
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "catalog"
              ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
              : "bg-carbon-900 text-slate-400 hover:text-white"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Piezas & Lujos ({catalogImages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("vehicles")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "vehicles"
              ? "bg-amber-500 text-carbon-950 shadow-md shadow-amber-500/20"
              : "bg-carbon-900 text-slate-400 hover:text-white"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Mulas Completas ({vehicleImages.length})</span>
        </button>
      </div>

      {/* 3. Grid de Imágenes */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Cargando multimedia desde Firebase...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(activeTab === "all" || activeTab === "catalog" ? catalogImages : []).map(
            (img, idx) => (
              <div
                key={`cat-${idx}`}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 group"
              >
                <div className="h-44 bg-carbon-950 overflow-hidden relative">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-carbon-950/90 text-amber-400 border border-white/10">
                    Container
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-xs text-white truncate">{img.name}</h4>
                </div>
              </div>
            )
          )}

          {(activeTab === "all" || activeTab === "vehicles" ? vehicleImages : []).map(
            (img, idx) => (
              <div
                key={`veh-${idx}`}
                className="glass-card rounded-2xl overflow-hidden border border-white/10 group"
              >
                <div className="h-44 bg-carbon-950 overflow-hidden relative">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-carbon-950/90 text-cyan-400 border border-white/10">
                    Mula Taller
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-xs text-white truncate">{img.name}</h4>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
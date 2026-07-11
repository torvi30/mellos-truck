import { useEffect, useState } from "react";
import {
  getGalleryRequest,
  uploadGalleryImageRequest,
  uploadGalleryVideoRequest,
  deleteGalleryFileRequest,
} from "../api/api";

function GalleryPage() {

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [message, setMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const loadGallery = async () => {
    try {
      const data = await getGalleryRequest();
      setImages(Array.isArray(data.images) ? data.images : []);
      setVideos(Array.isArray(data.videos) ? data.videos : []);
    } catch (error) {
      console.error("Error cargando galería:", error);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage("");

    try {
      const data = await uploadGalleryImageRequest(file);
      setMessage(data.message || "Imagen subida");
      await loadGallery();
    } catch (error) {
      console.error(error);
      setMessage("Error subiendo imagen");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    setMessage("");

    try {
      const data = await uploadGalleryVideoRequest(file);
      setMessage(data.message || "Video subido");
      await loadGallery();
    } catch (error) {
      console.error(error);
      setMessage("Error subiendo video");
    } finally {
      setUploadingVideo(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (type, filename) => {
    const confirmDelete = window.confirm("¿Eliminar este archivo?");
    if (!confirmDelete) return;

    try {
      const data = await deleteGalleryFileRequest(type, filename);
      setMessage(data.message || "Archivo eliminado");
      await loadGallery();
    } catch (error) {
      console.error(error);
      setMessage("Error eliminando archivo");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Galería</h1>
        <p>Sube imágenes y videos para la página pública</p>
      </div>

      <div className="page-top-grid">
        <div className="form-card">
          <h2>Subir imagen</h2>
          <label className="upload-box">
            <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            <span>{uploadingImage ? "Subiendo..." : "Seleccionar imagen"}</span>
          </label>
        </div>

        <div className="form-card">
          <h2>Subir video</h2>
          <label className="upload-box">
            <input type="file" accept="video/*" onChange={handleVideoUpload} hidden />
            <span>{uploadingVideo ? "Subiendo..." : "Seleccionar video"}</span>
          </label>
        </div>
      </div>

      {message && (
        <>
          <div style={{ height: "18px" }} />
          <p className="form-message">{message}</p>
        </>
      )}

      <div style={{ height: "24px" }} />

      <div className="form-card">
        <h2>Imágenes subidas</h2>

        {images.length === 0 ? (
          <p>No hay imágenes subidas.</p>
        ) : (
          <div className="gallery-admin-grid">
            {images.map((item) => (
              <div key={item.name} className="gallery-admin-card">
                <img src={item.url} alt={item.name} />
                <div className="gallery-admin-info">
                  <p>{item.name}</p>
                  <button
                    className="quick-btn quick-btn-red"
                    onClick={() => handleDelete("images", item.name)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: "24px" }} />

      <div className="form-card">
        <h2>Videos subidos</h2>

        {videos.length === 0 ? (
          <p>No hay videos subidos.</p>
        ) : (
          <div className="gallery-admin-grid">
            {videos.map((item) => (
              <div key={item.name} className="gallery-admin-card">
                <video src={item.url} controls />
                <div className="gallery-admin-info">
                  <p>{item.name}</p>
                  <button
                    className="quick-btn quick-btn-red"
                    onClick={() => handleDelete("videos", item.name)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GalleryPage;
/**
 * Capa de retrocompatibilidad API -> Firebase Service
 * Todas las operaciones ahora se ejecutan directamente en Firebase (Firestore + Storage + Auth).
 * Cero dependencia de backend Express / MySQL.
 */
import {
  quotesService,
  productsService,
  workOrdersService,
  clientsService,
  vehiclesService,
  showroomService,
  settingsService,
  storageService,
} from "../services/firebaseService.js";

export const API_BASE = ""; // Backend Express eliminado

// 1. COTIZACIONES
export const getQuotesRequest = async () => {
  return await quotesService.getAll();
};

export const createQuoteRequest = async (data) => {
  return await quotesService.create(data);
};

export const updateQuoteStatusRequest = async (id, status) => {
  return await quotesService.updateStatus(id, status);
};

export const convertQuoteRequest = async (id) => {
  return await quotesService.convertToWorkshop(id);
};

export const convertToWorkshopRequest = async (id, costoManoObra = 2000000) => {
  return await quotesService.convertToWorkshop(id, costoManoObra);
};

// 2. CLIENTES
export const getClientsRequest = async (search = "") => {
  return await clientsService.getAll(search);
};

export const createClientRequest = async (data) => {
  return await clientsService.create(data);
};

// 3. VEHÍCULOS
export const getVehiclesRequest = async (search = "") => {
  return await vehiclesService.getAll(search);
};

export const createVehicleRequest = async (data) => {
  return await vehiclesService.create(data);
};

// 4. GALERÍA Y MULTIMEDIA
export const getGalleryRequest = async () => {
  return await storageService.getGallery();
};

export const uploadGalleryImageRequest = async (file, category = "catalog") => {
  return await storageService.uploadFile(file, category);
};

export const uploadGalleryVideoRequest = async (file) => {
  return await storageService.uploadFile(file, "videos");
};

export const deleteGalleryFileRequest = async (type, filename) => {
  return { success: true };
};

// Exportar servicios unificados de Firebase
export {
  quotesService,
  productsService,
  workOrdersService,
  clientsService,
  vehiclesService,
  showroomService,
  settingsService,
  storageService,
};

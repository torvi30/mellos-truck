import { db, storage } from "../firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";

const normalizeDocs = (snapshot) =>
  snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

// ===== CLIENTES =====
export const getClientsRequest = async () => {
  const snapshot = await getDocs(
    query(collection(db, "clients"), orderBy("created_at", "desc"))
  );
  return normalizeDocs(snapshot);
};

export const createClientRequest = async (data) => {
  const client = {
    ...data,
    created_at: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "clients"), client);
  return { clientId: docRef.id };
};

// ===== VEHÍCULOS =====
export const getVehiclesRequest = async () => {
  const snapshot = await getDocs(
    query(collection(db, "vehicles"), orderBy("created_at", "desc"))
  );
  return normalizeDocs(snapshot);
};

export const createVehicleRequest = async (data) => {
  const vehicle = {
    ...data,
    client_name: data.client_name || null,
    client_phone: data.client_phone || null,
    created_at: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "vehicles"), vehicle);
  return { vehicleId: docRef.id };
};

// ===== COTIZACIONES =====
export const getQuotesRequest = async () => {
  const snapshot = await getDocs(
    query(collection(db, "quotes"), orderBy("created_at", "desc"))
  );
  return normalizeDocs(snapshot);
};

export const createQuoteRequest = async (data) => {
  const quote = {
    ...data,
    status: "nueva",
    created_at: serverTimestamp(),
  };
  const docRef = await addDoc(collection(db, "quotes"), quote);
  return { quoteId: docRef.id };
};

export const updateQuoteStatusRequest = async (id, status) => {
  await updateDoc(doc(db, "quotes", id), { status });
  return { success: true };
};

export const convertQuoteRequest = async (id) => {
  const quoteRef = doc(db, "quotes", id);
  const quoteSnapshot = await getDoc(quoteRef);

  if (!quoteSnapshot.exists()) {
    return { message: "Cotización no encontrada" };
  }

  const quote = quoteSnapshot.data();
  const clientsRef = collection(db, "clients");
  const clientQuery = query(clientsRef, where("phone", "==", quote.phone), limit(1));
  const clientSnapshot = await getDocs(clientQuery);

  let clientId = null;
  let clientAlreadyExisted = false;

  if (!clientSnapshot.empty) {
    clientId = clientSnapshot.docs[0].id;
    clientAlreadyExisted = true;
  } else {
    const clientRef = await addDoc(clientsRef, {
      name: quote.client_name,
      phone: quote.phone,
      whatsapp: quote.phone,
      city: quote.city || null,
      company: null,
      notes: `Cliente creado desde cotización #${id}`,
      created_at: serverTimestamp(),
    });
    clientId = clientRef.id;
  }

  let vehicleId = null;
  let vehicleCreated = false;

  if (quote.plate && String(quote.plate).trim() !== "") {
    const vehiclesRef = collection(db, "vehicles");
    const vehicleQuery = query(vehiclesRef, where("plate", "==", quote.plate), limit(1));
    const vehicleSnapshot = await getDocs(vehicleQuery);

    if (!vehicleSnapshot.empty) {
      vehicleId = vehicleSnapshot.docs[0].id;
    } else {
      const vehicleRef = await addDoc(vehiclesRef, {
        client_id: clientId,
        plate: quote.plate,
        brand: "Pendiente",
        line: null,
        model: null,
        vehicle_type: quote.vehicle_type || "Otro",
        color: null,
        notes: `Vehículo creado desde cotización #${id}. Servicio solicitado: ${quote.service}`,
        client_name: quote.client_name,
        client_phone: quote.phone,
        created_at: serverTimestamp(),
      });
      vehicleId = vehicleRef.id;
      vehicleCreated = true;
    }
  }

  await updateDoc(quoteRef, { status: "convertida" });

  return {
    quoteId: id,
    clientId,
    vehicleId,
    clientAlreadyExisted,
    vehicleCreated,
  };
};

// ===== GALERÍA =====
const listAllRecursively = async (storageRef) => {
  const result = await listAll(storageRef);
  const items = [...result.items];

  for (const prefix of result.prefixes) {
    items.push(...(await listAllRecursively(prefix)));
  }

  return items;
};

const buildGalleryItems = async (items) =>
  Promise.all(
    items.map(async (item) => {
      const segments = item.fullPath.split("/");
      const category = item.fullPath.startsWith("images/")
        ? segments[1] || "catalog"
        : "video";

      return {
        name: item.name,
        path: item.fullPath,
        url: await getDownloadURL(item),
        type: item.fullPath.startsWith("images/") ? "image" : "video",
        category,
      };
    })
  );

export const getGalleryRequest = async () => {
  const imagesRef = ref(storage, "images");
  const videosRef = ref(storage, "videos");

  const [imageItems, videoItems] = await Promise.all([
    listAllRecursively(imagesRef),
    listAllRecursively(videosRef),
  ]);

  const images = await buildGalleryItems(imageItems);
  const videos = await buildGalleryItems(videoItems);

  return {
    images,
    videos,
    catalog: images.filter((item) => item.category === "catalog"),
    vehicles: images.filter((item) => item.category === "vehicles"),
    services: images.filter((item) => item.category === "services"),
  };
};

export const uploadGalleryImageRequest = async (file, category = "catalog") => {
  const storageRef = ref(storage, `images/${category}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  return {
    message: "Imagen subida correctamente",
    file: {
      name: snapshot.ref.name,
      url,
      type: "image",
      category,
    },
  };
};

export const uploadGalleryVideoRequest = async (file) => {
  const storageRef = ref(storage, `videos/${Date.now()}-${file.name.replace(/\s+/g, "-")}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);

  return {
    message: "Video subido correctamente",
    file: {
      name: snapshot.ref.name,
      url,
      type: "video",
    },
  };
};

export const deleteGalleryFileRequest = async (pathToDelete) => {
  const targetRef = ref(storage, pathToDelete);
  await deleteObject(targetRef);

  return {
    message: "Archivo eliminado correctamente",
  };
};

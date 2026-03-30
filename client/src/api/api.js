const API_URL = "http://localhost:4000/api";

// ===== AUTH =====
export const loginRequest = async (data) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// ===== CLIENTES =====
export const getClientsRequest = async (token) => {
  const res = await fetch(`${API_URL}/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const createClientRequest = async (token, data) => {
  const res = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// ===== VEHÍCULOS =====
export const getVehiclesRequest = async (token) => {
  const res = await fetch(`${API_URL}/vehicles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const createVehicleRequest = async (token, data) => {
  const res = await fetch(`${API_URL}/vehicles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// ===== COTIZACIONES =====
export const getQuotesRequest = async (token) => {
  const res = await fetch(`${API_URL}/quotes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const createQuoteRequest = async (token, data) => {
  const res = await fetch(`${API_URL}/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const updateQuoteStatusRequest = async (token, id, status) => {
  const res = await fetch(`${API_URL}/quotes/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  return res.json();
};

export const convertQuoteRequest = async (token, id) => {
  const res = await fetch(`${API_URL}/quotes/${id}/convert`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};
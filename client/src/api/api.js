const API_URL = "http://localhost:4000/api";

export const loginRequest = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
};

export const getQuotesRequest = async (token) => {
  const response = await fetch(`${API_URL}/quotes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

export const updateQuoteStatusRequest = async (token, id, status) => {
  const response = await fetch(`${API_URL}/quotes/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  return response.json();
};

export const getClientsRequest = async (token) => {
  const response = await fetch(`${API_URL}/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};

export const getVehiclesRequest = async (token) => {
  const response = await fetch(`${API_URL}/vehicles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};
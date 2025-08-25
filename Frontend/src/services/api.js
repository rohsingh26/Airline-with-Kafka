import axios from "axios";

const API = import.meta.env.VITE_API_URL; // ✅ from .env

// --- auth ---
export async function login(email, password) {
  const { data } = await axios.post(`${API}/auth/login`, { email, password });
  return data; // { token, role, name }
}

export async function register(payload) {
  const adminToken = localStorage.getItem("token");
  const { data } = await axios.post(`${API}/auth/register`, payload, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  return data;
}

// --- users ---
export async function getMe(token) {
  const { data } = await axios.get(`${API}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
export async function updateMe(payload, token) {
  const { data } = await axios.patch(`${API}/users/me`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
export async function listUsers(token) {
  const { data } = await axios.get(`${API}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// New: Update a user by ID
export async function updateUser(id, payload, token) {
  const { data } = await axios.patch(`${API}/users/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// New: Delete a user by ID
export async function deleteUser(id, token) {
  const { data } = await axios.delete(`${API}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}


// --- flights ---
export async function createFlight(payload, token) {
  const { data } = await axios.post(`${API}/flights`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
export async function listFlights(token) {
  const { data } = await axios.get(`${API}/flights`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
export async function searchFlightByNo(flightNo, token) {
  const { data } = await axios.get(
    `${API}/flights/search/${encodeURIComponent(flightNo)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
export async function updateFlight(id, payload, token) {
  const { data } = await axios.patch(`${API}/flights/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
export async function deleteFlight(id, token) {
  const { data } = await axios.delete(`${API}/flights/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// New: Fetch notification list from Redis API endpoint
export async function listNotifications(token) {
  const { data } = await axios.get(`${API}/flights/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}


// --- baggage ---
export async function createBaggage(payload, token) {
  const { data } = await axios.post(`${API}/baggage`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
export async function listBaggage(token, { tagId, flightId } = {}) {
  const { data } = await axios.get(`${API}/baggage`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { tagId, flightId },
  });
  return data;
}
export async function updateBaggage(id, payload, token) {
  const { data } = await axios.patch(`${API}/baggage/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
export async function deleteBaggage(id, token) {
  const { data } = await axios.delete(`${API}/baggage/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// --- passengers ---
export async function myFlights(token) {
  try {
    const { data } = await axios.get(`${API}/passengers/my-flights`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch {
    return [];
  }
}

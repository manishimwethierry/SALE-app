const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
import { auth } from "./auth";

const request = async (path, options = {}) => {
  try {
    const token = auth.getToken();
    const customHeaders = options.headers || {};
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...customHeaders,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot connect to server. Please start backend on http://localhost:5000."
      );
    }
    throw error;
  }
};

export const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  getProducts: () => request("/products"),
  addProduct: (payload) =>
    request("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  getCustomers: () => request("/customers"),
  addCustomer: (payload) =>
    request("/customers", { method: "POST", body: JSON.stringify(payload) }),
  updateCustomer: (id, payload) =>
    request(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),

  getSales: () => request("/sales"),
  addSale: (payload) =>
    request("/sales", { method: "POST", body: JSON.stringify(payload) }),
};

import axios from "axios";

// Create axios instance
// Using 127.0.0.1 is often more reliable than localhost for Node.js backends
const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    // Only include token in request if it's a real JWT token (not a mock token)
    // Mock tokens are for frontend-only authentication and should not be sent to backend
    if (
      token &&
      !token.startsWith("mock_jwt_token_") &&
      token.trim() !== "" &&
      token.length > 10
    ) {
      // Basic validation - JWT tokens are typically longer
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Suppress heavy logging for demo/network errors to keep console clean
    if (error.message === "Network Error") {
      console.warn("API Network Error: Backend might be offline.");
    } else {
      console.error("API Error:", error.message);
    }

    if (error.response) {
      if (error.response.status === 401) {
        // Don't auto-logout for mock token users - they work offline
        const token = localStorage.getItem("token");
        if (token && !token.startsWith("mock_jwt_token_")) {
          // Only auto logout if it's a real token that failed
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/#/login";
        }
        // For mock tokens, just let the error pass silently
      }
    }

    return Promise.reject(error);
  }
);

export default api;

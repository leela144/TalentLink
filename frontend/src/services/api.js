import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

const API_URL = "http://localhost:5000"

/* ========================= AUTH ========================= */

export const authAPI = {
  googleAuth: () => {
    window.location.href = `${API_URL}/api/auth/google`
  },
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  logout: () => API.post("/auth/logout"),
  verifyToken: () => API.get("/auth/verify"),
  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password })
}

/* ========================= PROJECTS ========================= */

export const projectAPI = {
  getAll: () => API.get("/projects"),
  getOpen: () => API.get("/projects/open"),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post("/projects", data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
  getClientProjects: () => API.get("/projects/my"),
  updateStatus: (id, status) => API.patch(`/projects/${id}/status`, { status })
}

/* ========================= PROPOSALS ========================= */

export const proposalAPI = {
  create: (data) => API.post("/proposals", data),

  // FIXED: CORRECT PROPOSAL ENDPOINT
  getByProject: (projectId) => {
    console.log(`🔗 API: Fetching proposals for project: ${projectId}`);
    return API.get(`/proposals/project/${projectId}`);
  },

  getMyProposals: () => API.get("/proposals/my"),
  getFreelancerProposals: () => API.get("/proposals/freelancer"),
  updateStatus: (id, status) =>
    API.patch(`/proposals/${id}/status`, { status }),
  delete: (id) => API.delete(`/proposals/${id}`)
}

/* ========================= CONTRACTS ========================= */

export const contractAPI = {
  create: (data) => API.post("/contracts", data),
  getAll: () => API.get("/contracts"),
  getMyContracts: () => API.get("/contracts/my"),
  getById: (id) => API.get(`/contracts/${id}`),
  update: (id, data) => API.put(`/contracts/${id}`, data),
  updateStatus: (id, status) =>
    API.patch(`/contracts/${id}/status`, { status }),
  acceptContract: (id) => API.post(`/contracts/${id}/accept`),
  delete: (id) => API.delete(`/contracts/${id}`)
}

/* ========================= CHAT ========================= */

export const chatAPI = {
  getChats: () => API.get("/chats"),
  accessChat: (data) => API.post("/chats", data),
  checkCanChat: (userId) => API.get(`/chats/can-chat/${userId}`),
  getContractChat: (contractId) => API.get(`/contracts/${contractId}/chat`),
  getMessages: (chatId) => API.get(`/messages/${chatId}`),
  sendMessage: (data) => API.post("/messages", data),
  sendFile: (formData) => API.post("/messages/file", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  clearChat: (chatId) => API.delete(`/chats/${chatId}/messages`)
};

/* ========================= USERS ========================= */

export const userAPI = {
  getProfile: () => API.get("/users/profile"),
  updateProfile: (data) => API.put("/users/profile", data),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return API.post("/users/profile/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  searchUsers: (q) => API.get(`/users/search?q=${q}`),
  getUserById: (id) => API.get(`/users/${id}`)
}

/* ========================= DASHBOARD ========================= */

export const dashboardAPI = {
  getStats: () => API.get("/dashboard"),
  getClientStats: () => API.get("/dashboard/client"),
  getFreelancerStats: () => API.get("/dashboard/freelancer")
}

/* ========================= EXPORT ========================= */

export default API
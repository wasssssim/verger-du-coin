import axios from 'axios'
import useAuthStore from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/compte?redirect=auth'
    }
    return Promise.reject(error)
  }
)

// API Endpoints
export const api = {
  // Authentification
  auth: {
    login: (username, password) =>
      apiClient.post('/auth/token/', { username, password }),
    register: (data) =>
      apiClient.post('/customers/', data),
  },
  
  // Produits
  products: {
    getAll: (params) =>
      apiClient.get('/products/', { params }),
    getInSeason: () =>
      apiClient.get('/products/in_season/'),
    getById: (id) =>
      apiClient.get(`/products/${id}/`),
    getByCategory: (categoryId) =>
      apiClient.get('/products/', { params: { category: categoryId } }),
  },
  
  // Catégories
  categories: {
    getAll: () =>
      apiClient.get('/products/categories/'),
  },
  
  // Stocks
  inventory: {
    getStocks: async (params) => {
      const response = await apiClient.get('/inventory/stocks/', { params })
      return { data: response.data.results || response.data }
    },
    getLocations: async () => {
      const response = await apiClient.get('/inventory/locations/')
      return { data: response.data.results || response.data }
    },
  },
  
  // Clients
  customers: {
    getMe: () =>
      apiClient.get('/customers/me/'),
    update: (id, data) =>
      apiClient.patch(`/customers/${id}/`, data),
    searchByCard: (cardNumber) =>
      apiClient.post('/customers/search_by_card/', { card_number: cardNumber }),
  },
  
  // Commandes/Ventes
  sales: {
    create: (data) =>
      apiClient.post('/sales/', data),
    getMyOrders: async () => {
      const response = await apiClient.get('/sales/my_orders/')
      return { data: response.data.results || response.data }
    },
    getById: (id) =>
      apiClient.get(`/sales/${id}/`),
  },
  
  // Abonnements
  subscriptions: {
    getPlans: () =>
      apiClient.get('/subscriptions/plans/'),
    getPlanById: (id) =>
      apiClient.get(`/subscriptions/plans/${id}/`),
    getCurrentBasket: (planId) =>
      apiClient.get(`/subscriptions/plans/${planId}/current_basket/`),
    
    getMySubscriptions: () =>
      apiClient.get('/subscriptions/my_subscriptions/'),
    create: (data) =>
      apiClient.post('/subscriptions/', data),
    getById: (id) =>
      apiClient.get(`/subscriptions/${id}/`),
    pause: (id) =>
      apiClient.post(`/subscriptions/${id}/pause/`),
    resume: (id) =>
      apiClient.post(`/subscriptions/${id}/resume/`),
    cancel: (id, reason) =>
      apiClient.post(`/subscriptions/${id}/cancel/`, { reason }),
  },
  
  // Livraisons
  deliveries: {
    getUpcoming: async () => {
      const response = await apiClient.get('/subscriptions/deliveries/', { params: { status: 'PENDING' } })
      return { data: response.data.results || response.data }
    },
  },
}

export default apiClient

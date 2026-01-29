import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const api = {
  // Authentification
  auth: {
    login: async (username, password) => {
      const response = await apiClient.post('/auth/token/', { username, password })
      return response.data
    },
  },
  
  // Produits
  products: {
    getAll: async () => {
      const response = await apiClient.get('/products/')
      return response.data.results || response.data
    },
  },
  
  // Catégories
  categories: {
    getAll: async () => {
      const response = await apiClient.get('/products/categories/')
      return response.data.results || response.data
    },
  },
  
  // Clients
  customers: {
    searchByCard: async (cardNumber, token) => {
      const response = await apiClient.post(
        '/customers/search_by_card/',
        { card_number: cardNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return response.data
    },
  },
  
  // Ventes
  sales: {
    create: async (data, token) => {
      const response = await apiClient.post('/sales/', data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    },
  },
}

export default apiClient

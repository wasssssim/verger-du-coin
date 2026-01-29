import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      updateUser: (userData) => {
        set(state => ({ user: { ...state.user, ...userData } }))
      },
      
      // Vérifier si l'utilisateur a un rôle spécifique
      hasRole: (role) => {
        const { user } = get()
        if (!user) return false
        return user.role === role || user.is_staff || user.is_superuser
      },
      
      // Vérifier si l'utilisateur est staff (vendeur/admin)
      isStaff: () => {
        const { user } = get()
        return user?.is_staff || user?.is_superuser || false
      },
      
      // Vérifier si l'utilisateur est superuser
      isSuperuser: () => {
        const { user } = get()
        return user?.is_superuser || false
      },
      
      // Vérifier si l'utilisateur peut accéder au dashboard
      canAccessDashboard: () => {
        const { user } = get()
        // Seulement staff, superuser ou rôle vendor/admin
        return user?.is_staff || user?.is_superuser || 
               user?.role === 'VENDOR' || user?.role === 'ADMIN'
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore

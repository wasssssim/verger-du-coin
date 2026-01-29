import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

export default function ProtectedRoute({ children, requireStaff = false }) {
  const { isAuthenticated, isStaff } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion avec l'URL de retour
    return <Navigate to={`/compte?redirect=auth&from=${location.pathname}`} replace />
  }

  if (requireStaff && !isStaff()) {
    // Utilisateur connecté mais pas de permissions staff
    return <Navigate to="/" replace />
  }

  return children
}

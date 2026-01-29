// AccountPage.jsx
import { Link } from 'react-router-dom'
import { User } from 'lucide-react'

export function AccountPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <User className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mon Compte
          </h1>
          <p className="text-gray-600 mb-8">
            Fonctionnalité de compte utilisateur en développement.
          </p>
          <Link to="/boutique" className="btn-primary">
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  )
}

// OrderConfirmationPage.jsx
import { useParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export function OrderConfirmationPage() {
  const { orderId } = useParams()
  
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Commande confirmée !
          </h1>
          <p className="text-gray-600 mb-2">
            Merci pour votre commande #{orderId}
          </p>
          <p className="text-gray-600 mb-8">
            Vous recevrez un email de confirmation sous peu.
          </p>
          <Link to="/boutique" className="btn-primary">
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  )
}

// NotFoundPage.jsx
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-9xl font-bold text-green-500 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h2>
          <p className="text-gray-600 mb-8">
            Désolé, cette page n'existe pas.
          </p>
          <Link to="/" className="btn-primary">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

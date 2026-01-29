import { Link } from 'react-router-dom'
import { User } from 'lucide-react'

export default function AccountPage() {
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

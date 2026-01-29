// CheckoutPage.jsx - Page de commande
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Finaliser ma commande
          </h1>
          <p className="text-gray-600 mb-8">
            Cette fonctionnalité sera disponible prochainement.
          </p>
          <Link to="/boutique" className="btn-primary">
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  )
}

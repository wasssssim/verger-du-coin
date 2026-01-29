import { Link, useParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export default function OrderConfirmationPage() {
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

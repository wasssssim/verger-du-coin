import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import useCartStore from '../stores/cartStore'
import useAuthStore from '../stores/authStore'
import { api } from '../api/client'
import { useToast } from '../components/Toaster'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, clearCart } = useCartStore()
  const total = items.reduce((sum, item) => sum + (item.product.base_price * item.quantity), 0)
  const { isAuthenticated, user } = useAuthStore()
  const { success, error: showError } = useToast()
  const [loading, setLoading] = useState(false)
  console.log('user : ',user)

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/compte?redirect=auth&from=/panier')
      return
    }

    if (items.length === 0) {
      showError('Votre panier est vide')
      return
    }

    setLoading(true)

    try {
      // Préparer les lignes de commande
      const lines = items.map(item => ({
        product: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.base_price,
        vat_rate: item.product.vat_rate || 5.5,
        discount_percent: 0
      }))

      // Créer la vente
      const orderData = {
        channel: 'WEB',
        location: 1,
        customer: user?.customer_id || null,
        payment_method: 'CARD',
        lines: lines
      }

      const response = await api.sales.create(orderData)

      success('Commande passée avec succès !')
      clearCart()
      
      setTimeout(() => {
        navigate(`/commande/${response.data.id}`)
      }, 1500)

    } catch (err) {
      console.error('Erreur lors de la commande:', err)
      showError(err.response?.data?.detail || 'Erreur lors de la commande')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits frais et locaux
            </p>
            <Link to="/boutique" className="btn-primary inline-block">
              Voir la boutique
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Mon Panier</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                    🍎
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                        {item.product.category_name && (
                          <span className="text-sm text-gray-500">{item.product.category_name}</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-semibold text-lg min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <span className="text-gray-500 text-sm">× {item.product.base_price}€</span>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {(item.quantity * item.product.base_price).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Résumé</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TVA (5.5%)</span>
                  <span>{(total * 0.055).toFixed(2)}€</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-green-600">{(total * 1.055).toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    Vous devez être connecté pour passer commande
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mb-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    Passer commande
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <Link to="/boutique" className="btn-secondary w-full text-center block">
                Continuer mes achats
              </Link>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 text-center">
                  Paiement sécurisé • Livraison gratuite dès 50€
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

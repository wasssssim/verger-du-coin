import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import useCartStore from '../stores/cartStore'
import { useToast } from '../components/Toaster'

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, getTotalWithVAT, clearCart } = useCartStore()
  const { success, info } = useToast()
  
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      if (confirm('Voulez-vous retirer ce produit du panier ?')) {
        removeItem(productId)
        info('Produit retiré du panier')
      }
    } else {
      updateQuantity(productId, newQuantity)
    }
  }
  
  const handleRemoveItem = (productId, productName) => {
    if (confirm(`Retirer ${productName} du panier ?`)) {
      removeItem(productId)
      info('Produit retiré du panier')
    }
  }
  
  const handleClearCart = () => {
    if (confirm('Voulez-vous vider tout le panier ?')) {
      clearCart()
      info('Panier vidé')
    }
  }
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Votre panier est vide
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Découvrez nos produits frais et locaux !
              </p>
            </div>
            <Link to="/boutique" className="btn-primary inline-flex items-center gap-2">
              Parcourir la boutique
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  const total = getTotal()
  const totalWithVAT = getTotalWithVAT()
  const vat = totalWithVAT - total
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Panier</h1>
          <p className="text-gray-600">
            {items.length} produit{items.length > 1 ? 's' : ''} dans votre panier
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.product.id} className="card">
                <div className="flex gap-4">
                  {/* Image produit */}
                  <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                    🍎
                  </div>
                  
                  {/* Informations produit */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {item.product.base_price}€ / {item.product.unit}
                    </p>
                    
                    {/* Contrôles quantité */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                        className="ml-auto text-red-600 hover:text-red-700 transition-colors"
                        title="Retirer du panier"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Prix total ligne */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-green-600">
                      {(item.product.base_price * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Bouton vider le panier */}
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Vider le panier
            </button>
          </div>
          
          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Récapitulatif
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-medium">{total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TVA (5,5%)</span>
                  <span className="font-medium">{vat.toFixed(2)}€</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-green-600">{totalWithVAT.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
              
              <Link to="/commander" className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
                Passer commande
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link to="/boutique" className="btn-secondary w-full text-center block">
                Continuer mes achats
              </Link>
              
              {/* Informations */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>🚚 Retrait gratuit</strong><br />
                  Au kiosque ou sur les marchés locaux
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { ShoppingCart, LogOut, CreditCard, Banknote, Trash2, X } from 'lucide-react'
import { api } from './api/client'


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [token, setToken,] = useState(null)
  const [products, setProducts] = useState([])
  const [cart, setCart,] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [customerCard, setCustomerCard] = useState('')
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastSale, setLastSale] = useState(null)

  // Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const username = e.target.username.value
    const password = e.target.password.value

    try {
      const data = await api.auth.login(username, password)
      setToken(data.access)
      setIsLoggedIn(true)
      loadData()
    } catch (error) {
      alert('Erreur de connexion: ' + (error.response?.data?.detail || 'Vérifiez vos identifiants'))
    } finally {
      setLoading(false)
    }
  }

  // Charger les données
  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll()
      ])
      setProducts(Array.isArray(productsData) ? productsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Erreur chargement données:', error)
      alert('Erreur de chargement des données')
    }
  }

  // Ajouter au panier
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  // Modifier quantité
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId))
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  // Scanner carte fidélité
  const scanCard = async () => {
    if (!customerCard) {
      alert('Veuillez entrer un numéro de carte')
      return
    }
    
    setLoading(true)
    try {
      const data = await api.customers.searchByCard(customerCard, token)
      setCustomer(data)
      alert(`Client trouvé: ${data.first_name} ${data.last_name}`)
    } catch (error) {
      alert('Carte non trouvée')
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  // Paiement
const handlePayment = async (method) => {
  if (cart.length === 0) {
    alert('Le panier est vide')
    return
  }

  // 1. On calcule le total actuel AVANT de vider le panier
  const finalTotal = total; 

  if (!confirm(`Confirmer le paiement de ${finalTotal.toFixed(2)}€ par ${method === 'CASH' ? 'ESPÈCES' : 'CARTE'} ?`)) {
    return
  }

  setLoading(true)
  try {
    const saleData = await api.sales.create({
      channel: 'KIOSK',
      location: 1,
      customer: customer?.customer?.id || null,
      payment_method: method,
      lines: cart.map(item => ({
        product: item.product.id,
        quantity: item.quantity,
        unit_price: parseFloat(item.product.base_price),
        vat_rate: parseFloat(item.product.vat_rate)
      }))
    }, token)

    // 2. On injecte le total calculé dans l'objet lastSale 
    // pour que le modal ne dépende plus du panier vide
    setLastSale({ ...saleData, total: finalTotal })
    
    setCart([])
    setCustomer(null)
    setCustomerCard('')
  } catch (error) {
    console.error('Erreur paiement:', error)
    alert('Erreur lors du paiement: ' + (error.response?.data?.detail || 'Erreur inconnue'))
  } finally {
    setLoading(false)
  }
}
  // Filtrer produits
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?.id === selectedCategory)
    : products

  const total = cart.reduce((sum, item) => 
    sum + (parseFloat(item.product.base_price) * item.quantity), 0
  )

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🍎 Verger POS</h1>
            <p className="text-gray-600">Point de vente</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                name="username"
                defaultValue="admin"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                defaultValue="admin123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            
            <button type="submit" className="btn-pos w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍎</span>
          <div>
            <h1 className="text-xl font-bold">Verger du Coin</h1>
            <p className="text-sm text-green-100">Point de vente</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (confirm('Se déconnecter ?')) {
              setIsLoggedIn(false)
              setCart([])
              setCustomer(null)
            }
          }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Produits */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Catégories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tous ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grille produits */}
          <div className="flex-1 overflow-auto">
            {filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-500 text-xl mb-2">Aucun produit disponible</p>
                  <p className="text-gray-400">Ajoutez des produits dans l'admin Django</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="product-card"
                  >
                    <div className="text-5xl mb-2 text-center">🍎</div>
                    <h3 className="font-bold text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {parseFloat(product.base_price).toFixed(2)}€
                    </p>
                    <p className="text-sm text-gray-500">/{product.unit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panier */}
        <div className="w-96 bg-white shadow-xl flex flex-col">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Panier ({cart.length})
            </h2>
          </div>

          {/* Client */}
          <div className="p-4 border-b">
            <label className="block text-sm font-medium mb-2">
              Carte fidélité
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customerCard}
                onChange={(e) => setCustomerCard(e.target.value)}
                placeholder="VDC123456"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={scanCard}
                disabled={loading}
                className="btn-pos-secondary px-4"
              >
                Scanner
              </button>
            </div>
            {customer && (
              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-sm text-green-600">
                      Points: {customer.loyalty_card?.points_balance || 0}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCustomer(null)
                      setCustomerCard('')
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {cart.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Panier vide</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product.id} className="cart-item">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {parseFloat(item.product.base_price).toFixed(2)}€ x {item.quantity} = {(parseFloat(item.product.base_price) * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded-lg font-bold hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateQuantity(item.product.id, 0)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Total et Paiement */}
          <div className="p-4 border-t bg-gray-50">
            <div className="text-3xl font-bold text-center mb-4 text-green-600">
              Total: {total.toFixed(2)}€
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => handlePayment('CASH')}
                disabled={cart.length === 0 || loading}
                className="btn-pos flex items-center justify-center gap-2"
              >
                <Banknote className="h-6 w-6" />
                Espèces
              </button>
              <button
                onClick={() => handlePayment('CARD')}
                disabled={cart.length === 0 || loading}
                className="btn-pos flex items-center justify-center gap-2"
              >
                <CreditCard className="h-6 w-6" />
                Carte
              </button>
            </div>
            
            <button
              onClick={() => {
                if (confirm('Vider le panier ?')) {
                  setCart([])
                  setCustomer(null)
                  setCustomerCard('')
                }
              }}
              className="btn-pos-danger w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              Vider le panier
            </button>
          </div>
        </div>
              {/* Modal Ticket de Caisse */}
      {lastSale && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 no-print-bg">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm relative">
            
            {/* Contenu du Ticket */}
            <div id="receipt-print" className="font-mono text-sm text-black p-2">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold uppercase">Le Verger du Coin</h2>
                <p>123 Rue du Marché, Marseille</p>
                <p>Tél: 04 00 00 00 00</p>
                <div className="border-b border-dashed border-black my-2"></div>
                <p className="text-xs">Vente: #{lastSale.sale_number || lastSale.id}</p>
                <p className="text-xs">{new Date().toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                {lastSale.lines.map((line, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="flex-1">{line.product_name || 'Produit'}</span>
                    <span className="mx-2">x{parseFloat(line.quantity)}</span>
                    <span>{(line.quantity * line.unit_price).toFixed(2)}€</span>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-black my-2"></div>
              
              <div className="flex justify-between font-bold text-lg">
                <span>TOTAL</span>
                <span>{parseFloat(lastSale.total || total).toFixed(2)}€</span>
              </div>
              
              <div className="text-xs mt-2">
                <p>Mode: {lastSale.payment_method === 'CASH' ? 'ESPÈCES' : 'CARTE'}</p>
                {customer && <p>Client: {customer.first_name} {customer.last_name}</p>}
              </div>

              <div className="text-center mt-6 italic text-xs">
                Merci de votre visite ! 🍎
              </div>
            </div>

            {/* Boutons d'action (cachés à l'impression) */}
            <div className="mt-6 flex gap-3 no-print">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-900"
              >
                Imprimer
              </button>
              <button 
                onClick={() => setLastSale(null)}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style spécifique pour l'impression */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #receipt-print, #receipt-print * { 
            visibility: visible; 
          }
          #receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print-bg { background: none !important; }
        }
      `}</style>
      </div>

    </div>
  )
}

export default App

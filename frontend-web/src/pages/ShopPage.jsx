import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { api } from '../api/client'
import useCartStore from '../stores/cartStore'
import { useToast } from '../components/Toaster'

export default function ShopPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  const { addItem } = useCartStore()
  const { success } = useToast()
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll()
      ])
      
      // FIX: S'assurer que c'est un tableau
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : [])
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
    } catch (error) {
      console.error('Erreur:', error)
      setProducts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }
  
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category?.id === selectedCategory)
    : products
  
  const handleAddToCart = (product) => {
    addItem(product, 1)
    success(`${product.name} ajouté au panier`)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Notre Boutique</h1>
        
        {/* Catégories */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              !selectedCategory
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border'
            }`}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        
        {/* Produits */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Aucun produit disponible</p>
            <p className="text-sm text-gray-400 mt-2">Ajoutez des produits dans l'admin Django</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCartStore()
  
  const handleAdd = () => {
    addItem(product, quantity)
    setQuantity(1)
  }
  
  return (
    <div className="product-card group">
      <div className="h-56 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-7xl">
        🍎
      </div>
      
      <div className="p-5">
        {product.category && (
          <span className="badge badge-success mb-2">
            {product.category.name}
          </span>
        )}
        
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-3xl font-bold text-green-600">
            {product.base_price}€
          </span>
          <span className="text-gray-500 text-sm">/ {product.unit}</span>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="font-semibold text-lg min-w-[2rem] text-center">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        
        <button onClick={handleAdd} className="w-full btn-primary flex items-center justify-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Ajouter
        </button>
      </div>
    </div>
  )
}
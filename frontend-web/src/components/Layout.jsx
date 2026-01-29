import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import useCartStore from '../stores/cartStore'
import useAuthStore from '../stores/authStore'

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { getTotalItems } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()
  
  const cartItemsCount = getTotalItems()
  
  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Boutique', href: '/boutique' },
    { name: 'Abonnements', href: '/abonnements' },
  ]
  
  const isActive = (path) => location.pathname === path
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🍎</span>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                Le Verger du Coin
              </span>
            </Link>
            
            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-green-600'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Panier */}
              <Link
                to="/panier"
                className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              
              {/* Compte */}
              <Link
                to="/compte"
                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-green-600 transition-colors"
              >
                <User className="h-6 w-6" />
                {isAuthenticated && (
                  <span className="hidden lg:block text-sm font-medium">
                    {user?.first_name || 'Mon compte'}
                  </span>
                )}
              </Link>
              
              {/* Menu Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          
          {/* Navigation Mobile */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 px-4 font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">🍎 Le Verger du Coin</h3>
              <p className="text-gray-400 text-sm">
                Fruits et légumes frais en circuit court depuis 1985
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-white">Accueil</Link></li>
                <li><Link to="/boutique" className="hover:text-white">Boutique</Link></li>
                <li><Link to="/abonnements" className="hover:text-white">Abonnements</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Informations</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white">CGV</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>contact@vergercoin.fr</li>
                <li>Route de la Ferme</li>
                <li>Auvergne-Rhône-Alpes</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Le Verger du Coin. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

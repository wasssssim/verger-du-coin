import { Link } from 'react-router-dom'
import { ShoppingBag, Calendar, Leaf, MapPin, Clock, Award } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function HomePage() {
  const [seasonalProducts, setSeasonalProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadSeasonalProducts()
  }, [])
  
  const loadSeasonalProducts = async () => {
    try {
      const response = await api.products.getInSeason()
      setSeasonalProducts(response.data.slice(0, 4))
    } catch (error) {
      console.error('Erreur chargement produits:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              🍎 Le Verger du Coin
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Fruits et légumes frais en circuit court depuis 1985
            </p>
            <p className="text-lg text-gray-600 mb-10">
              Commandez en ligne, récupérez à la ferme ou sur les marchés locaux
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/boutique" className="btn-primary">
                <ShoppingBag className="inline-block mr-2 h-5 w-5" />
                Commander maintenant
              </Link>
              <Link to="/abonnements" className="btn-secondary">
                <Calendar className="inline-block mr-2 h-5 w-5" />
                Nos abonnements
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Notre Engagement */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Notre Engagement
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">100% Local</h3>
              <p className="text-gray-600">
                Tous nos produits sont cultivés sur place en Auvergne-Rhône-Alpes
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Qualité Garantie</h3>
              <p className="text-gray-600">
                Des produits fraîchement récoltés, sans pesticides
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Circuit Court</h3>
              <p className="text-gray-600">
                Du producteur au consommateur, sans intermédiaire
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Produits de Saison */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Produits de Saison
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Découvrez nos produits frais du moment
          </p>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
              {seasonalProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-6xl">
                    🍎
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-green-600">
                        {product.base_price}€
                      </span>
                      <span className="text-sm text-gray-500">
                        / {product.unit}
                      </span>
                    </div>
                    {product.category && (
                      <span className="badge badge-success mt-2">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center">
            <Link to="/boutique" className="btn-primary">
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>
      
      {/* Comment ça marche */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comment ça marche ?
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Choisissez vos produits</h3>
                <p className="text-gray-600">
                  Parcourez notre catalogue en ligne et ajoutez les produits à votre panier
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Validez votre commande</h3>
                <p className="text-gray-600">
                  Choisissez votre créneau de retrait et finalisez votre commande
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Récupérez vos produits</h3>
                <p className="text-gray-600">
                  Venez chercher votre commande au kiosque ou sur un marché local
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Horaires et Contact */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="card">
              <div className="flex items-start mb-4">
                <Clock className="h-6 w-6 text-green-600 mr-3 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Horaires</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Kiosque à la ferme:</strong></p>
                    <p>Mardi - Samedi: 9h - 19h</p>
                    <p>Dimanche: 9h - 13h</p>
                    <p className="mt-3"><strong>Marchés:</strong></p>
                    <p>Samedi matin: Marché de la ville</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-start mb-4">
                <MapPin className="h-6 w-6 text-green-600 mr-3 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold mb-3">Nous trouver</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Adresse:</strong></p>
                    <p>Le Verger du Coin</p>
                    <p>Route de la Ferme</p>
                    <p>Auvergne-Rhône-Alpes</p>
                    <p className="mt-3"><strong>Contact:</strong></p>
                    <p>contact@vergercoin.fr</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à découvrir nos produits frais ?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Commandez dès maintenant et récupérez vos produits sous 24h
          </p>
          <Link to="/boutique" className="inline-block bg-white text-green-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            Accéder à la boutique
          </Link>
        </div>
      </section>
    </div>
  )
}

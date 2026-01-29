import { useState, useEffect } from 'react'
import { Package, TrendingUp, AlertTriangle, CheckCircle, Calendar, ShoppingBag, Users } from 'lucide-react'
import { api } from '../api/client'
import useAuthStore from '../stores/authStore'

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [deliveries, setDeliveries] = useState([])
  const [stocks, setStocks] = useState([])
  const [preparationList, setPreparationList] = useState([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalDeliveries: 0,
    lowStockItems: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Charger toutes les données en parallèle
      const [ordersRes, deliveriesRes, stocksRes] = await Promise.all([
        api.sales.getMyOrders(),
        api.deliveries.getUpcoming(),
        api.inventory.getStocks()
      ])

      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.results || [])
      const deliveriesData = Array.isArray(deliveriesRes.data) ? deliveriesRes.data : (deliveriesRes.data.results || [])
      const stocksData = Array.isArray(stocksRes.data) ? stocksRes.data : (stocksRes.data.results || [])

      // Filtrer les commandes du jour
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = ordersData.filter(order => 
        order.created_at?.startsWith(today)
      )

      setOrders(todayOrders)
      setDeliveries(deliveriesData)
      setStocks(stocksData)

      // Calculer la liste de préparation
      const prepList = calculatePreparationList(todayOrders, deliveriesData)
      setPreparationList(prepList)

      // Calculer les statistiques
      const lowStock = stocksData.filter(stock => 
        stock.quantity < (stock.alert_threshold || 10)
      ).length

      const totalRevenue = todayOrders.reduce((sum, order) => 
        sum + parseFloat(order.total_amount || 0), 0
      )

      setStats({
        totalOrders: todayOrders.length,
        totalDeliveries: deliveriesData.length,
        lowStockItems: lowStock,
        totalRevenue
      })

    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePreparationList = (orders, deliveries) => {
    const productMap = new Map()

    // Ajouter les produits des commandes
    orders.forEach(order => {
      if (order.lines && Array.isArray(order.lines)) {
        order.lines.forEach(line => {
          const productName = line.product_name || line.product?.name || 'Produit inconnu'
          const quantity = parseFloat(line.quantity || 0)
          
          if (productMap.has(productName)) {
            productMap.get(productName).quantity += quantity
            productMap.get(productName).orders += 1
          } else {
            productMap.set(productName, {
              name: productName,
              quantity,
              unit: line.product?.unit || 'unité',
              orders: 1,
              deliveries: 0
            })
          }
        })
      }
    })

    // Ajouter les produits des livraisons d'abonnements
    deliveries.forEach(delivery => {
      if (delivery.basket_items && Array.isArray(delivery.basket_items)) {
        delivery.basket_items.forEach(item => {
          const productName = item.product_name || item.product?.name || 'Produit inconnu'
          const quantity = parseFloat(item.quantity || 0)
          
          if (productMap.has(productName)) {
            productMap.get(productName).quantity += quantity
            productMap.get(productName).deliveries += 1
          } else {
            productMap.set(productName, {
              name: productName,
              quantity,
              unit: item.product?.unit || 'unité',
              orders: 0,
              deliveries: 1
            })
          }
        })
      }
    })

    // Convertir en tableau et trier par quantité décroissante
    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès restreint</h2>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder au tableau de bord</p>
          <a href="/compte" className="btn-primary">
            Se connecter
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord vendeur</h1>
          <p className="text-gray-600">
            Préparez vos produits pour la journée - {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Commandes du jour"
            value={stats.totalOrders}
            color="blue"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            title="Livraisons abonnements"
            value={stats.totalDeliveries}
            color="green"
          />
          <StatCard
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Alertes stock"
            value={stats.lowStockItems}
            color="orange"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="CA estimé"
            value={`${stats.totalRevenue.toFixed(2)}€`}
            color="purple"
          />
        </div>

        {/* Liste de préparation principale */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-7 w-7 text-green-600" />
              Liste de préparation totale
            </h2>
            <button
              onClick={() => window.print()}
              className="btn-secondary"
            >
              Imprimer
            </button>
          </div>

          {preparationList.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune préparation nécessaire pour aujourd'hui</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Produit</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Quantité totale</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Commandes</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Abonnements</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {preparationList.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="text-2xl font-bold text-green-600">
                          {item.quantity.toFixed(1)} {item.unit}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="badge badge-primary">{item.orders} commandes</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="badge badge-success">{item.deliveries} livraisons</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <input
                          type="checkbox"
                          className="h-5 w-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Détails des commandes et livraisons */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Commandes du jour */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
              Commandes à préparer ({orders.length})
            </h3>
            
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune commande aujourd'hui</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        Commande #{order.id}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <Users className="h-4 w-4 inline mr-1" />
                      {order.customer_name || 'Client'}
                    </p>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      {order.lines?.map((line, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{line.product_name || 'Produit'}</span>
                          <span className="font-medium">{line.quantity} {line.product?.unit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-gray-900">
                        Total: {parseFloat(order.total_amount || 0).toFixed(2)}€
                      </span>
                      <span className="badge badge-warning">
                        {order.payment_method === 'CASH' ? 'Espèces' : 'Carte'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Livraisons d'abonnements */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-green-600" />
              Livraisons abonnements ({deliveries.length})
            </h3>
            
            {deliveries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune livraison prévue aujourd'hui</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {deliveries.map(delivery => (
                  <div key={delivery.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        Abonnement #{delivery.subscription_id}
                      </span>
                      <span className="badge badge-success">
                        {delivery.delivery_date ? new Date(delivery.delivery_date).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <Users className="h-4 w-4 inline mr-1" />
                      {delivery.customer_name || 'Client'}
                    </p>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      {delivery.basket_items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.product_name || 'Produit'}</span>
                          <span className="font-medium">{item.quantity} {item.product?.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alertes stock bas */}
        {stats.lowStockItems > 0 && (
          <div className="mt-8 bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-orange-900 mb-2">
                  Alertes de stock ({stats.lowStockItems})
                </h3>
                <p className="text-orange-800 mb-3">
                  Certains produits ont un stock faible. Pensez à réapprovisionner.
                </p>
                <div className="space-y-2">
                  {stocks
                    .filter(stock => stock.quantity < (stock.alert_threshold || 10))
                    .slice(0, 5)
                    .map(stock => (
                      <div key={stock.id} className="flex items-center justify-between bg-white rounded px-3 py-2">
                        <span className="font-medium text-gray-900">
                          {stock.product_name || 'Produit'}
                        </span>
                        <span className="text-orange-600 font-bold">
                          {stock.quantity} {stock.product?.unit || 'unités'} restant(s)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

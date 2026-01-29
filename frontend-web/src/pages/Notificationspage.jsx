import { useState, useEffect } from 'react'
import { Bell, ShoppingBag, Calendar, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react'
import { api } from '../api/client'
import useAuthStore from '../stores/authStore'

export default function NotificationsPage() {
  const { isAuthenticated, isStaff } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, unread, read

  useEffect(() => {
    if (isAuthenticated && isStaff()) {
      loadNotifications()
    }
  }, [isAuthenticated])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      // Charger les commandes récentes
      const ordersResponse = await api.sales.getAll({ 
        ordering: '-created_at',
        page_size: 50 
      })
      
      const orders = ordersResponse.data || []
      
      // Charger les notifications depuis localStorage
      const savedNotifs = JSON.parse(localStorage.getItem('notifications') || '{}')
      
      // Créer les notifications à partir des commandes
const notifs = orders.map(order => {
  // Extraire le nom du client
  let customerName = 'Client'
  if (order.customer_name) {
    customerName = order.customer_name
  } else if (order.customer) {
    // Si c'est un objet customer
    if (typeof order.customer === 'object') {
      customerName = order.customer.full_name || order.customer.first_name || 'Client'
    }
  }
  
  // Compter les articles
  const itemCount = order.lines?.reduce((sum, line) => sum + parseFloat(line.quantity || 0), 0) || 0
  
  return {
    id: `order-${order.id}`,
    type: 'order',
    orderId: order.id,
    title: `Commande #${order.id}`,
    message: `${customerName} - ${parseFloat(order.total || 0).toFixed(2)}€`,
    details: `${itemCount} article(s) - ${order.payment_method === 'CARD' ? 'Carte' : 'Espèces'} - ${order.channel}`,
    time: order.created_at,
    read: savedNotifs[`order-${order.id}`]?.read || false,
    icon: ShoppingBag,
    color: 'blue'
  }
})
      
      // Trier par date décroissante
      notifs.sort((a, b) => new Date(b.time) - new Date(a.time))
      
      setNotifications(notifs)
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (notifId) => {
    // Mettre à jour l'état
    setNotifications(prev => 
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    )
    
    // Sauvegarder dans localStorage
    const savedNotifs = JSON.parse(localStorage.getItem('notifications') || '{}')
    savedNotifs[notifId] = { read: true }
    localStorage.setItem('notifications', JSON.stringify(savedNotifs))
  }

  const markAsUnread = (notifId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notifId ? { ...n, read: false } : n)
    )
    
    const savedNotifs = JSON.parse(localStorage.getItem('notifications') || '{}')
    savedNotifs[notifId] = { read: false }
    localStorage.setItem('notifications', JSON.stringify(savedNotifs))
  }

  const markAllAsRead = () => {
    const savedNotifs = {}
    notifications.forEach(n => {
      savedNotifs[n.id] = { read: true }
    })
    localStorage.setItem('notifications', JSON.stringify(savedNotifs))
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId))
    
    const savedNotifs = JSON.parse(localStorage.getItem('notifications') || '{}')
    delete savedNotifs[notifId]
    localStorage.setItem('notifications', JSON.stringify(savedNotifs))
  }

  const clearAll = () => {
    if (confirm('Voulez-vous vraiment supprimer toutes les notifications ?')) {
      setNotifications([])
      localStorage.removeItem('notifications')
    }
  }

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'read') return n.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  if (!isAuthenticated || !isStaff()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès réservé</h2>
          <p className="text-gray-600">Cette page est réservée au personnel</p>
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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Bell className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? (
                    <span className="font-medium text-green-600">
                      {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    'Aucune nouvelle notification'
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={loadNotifications}
              className="btn-secondary"
            >
              Actualiser
            </button>
          </div>

          {/* Filtres et actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-lg shadow-sm p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Non lues ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'read'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lues ({notifications.length - unreadCount})
              </button>
            </div>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Tout marquer comme lu
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Tout supprimer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Liste des notifications */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'unread' ? 'Aucune notification non lue' : 
               filter === 'read' ? 'Aucune notification lue' : 
               'Aucune notification'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notif => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onMarkAsRead={() => markAsRead(notif.id)}
                onMarkAsUnread={() => markAsUnread(notif.id)}
                onDelete={() => deleteNotification(notif.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationCard({ notification, onMarkAsRead, onMarkAsUnread, onDelete }) {
  const Icon = notification.icon
  const [expanded, setExpanded] = useState(false)

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays === 1) return 'Hier'
    if (diffDays < 7) return `Il y a ${diffDays} jours`
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 transition-all ${
      !notification.read ? 'border-l-4 border-green-500' : ''
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-3 rounded-full flex-shrink-0 ${colorClasses[notification.color]}`}>
          <Icon className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
          
          {notification.details && (
            <p className="text-gray-500 text-xs mb-2">{notification.details}</p>
          )}
          
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs">
              {formatTime(notification.time)}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!notification.read ? (
                <button
                  onClick={onMarkAsRead}
                  className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                  title="Marquer comme lu"
                >
                  <CheckCircle className="h-4 w-4" />
                  Marquer comme lu
                </button>
              ) : (
                <button
                  onClick={onMarkAsUnread}
                  className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
                  title="Marquer comme non lu"
                >
                  <EyeOff className="h-4 w-4" />
                  Non lu
                </button>
              )}
              
              <button
                onClick={onDelete}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
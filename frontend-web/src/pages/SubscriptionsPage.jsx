import { useState, useEffect } from 'react'
import { Check, Calendar, Package } from 'lucide-react'
import { api } from '../api/client'
import useAuthStore from '../stores/authStore'
import { useToast } from '../components/Toaster'
import { useNavigate } from 'react-router-dom'

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuthStore()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()
  
  useEffect(() => {
    loadPlans()
  }, [])
  
  const loadPlans = async () => {
    try {
      const response = await api.subscriptions.getPlans()
      setPlans(response.data)
    } catch (error) {
      console.error('Erreur chargement plans:', error)
      showError('Erreur de chargement des abonnements')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubscribe = (plan) => {
    if (!isAuthenticated) {
      navigate('/compte?redirect=abonnements')
      return
    }
    
    // Ici vous pourriez ouvrir un modal de confirmation
    // ou rediriger vers une page de configuration
    success(`Vous avez choisi le plan ${plan.name}`)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Nos Abonnements
          </h1>
          <p className="text-xl text-gray-600">
            Recevez chaque semaine un panier de produits frais de saison.
            Économisez du temps et profitez du meilleur de notre production !
          </p>
        </div>
        
        {/* Avantages */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Panier Personnalisé</h3>
            <p className="text-gray-600">
              Composition variable selon la saison et vos préférences
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Livraison Régulière</h3>
            <p className="text-gray-600">
              Récupérez votre panier le jour qui vous convient
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Flexible</h3>
            <p className="text-gray-600">
              Mettez en pause ou annulez à tout moment
            </p>
          </div>
        </div>
        
        {/* Plans d'abonnement */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
        
        {/* Comment ça marche */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Choisissez votre plan',
                description: 'Sélectionnez la fréquence qui vous convient'
              },
              {
                step: '2',
                title: 'Configurez votre abonnement',
                description: 'Choisissez votre jour de retrait préféré'
              },
              {
                step: '3',
                title: 'Recevez votre panier',
                description: 'Récupérez votre panier frais chaque semaine'
              },
              {
                step: '4',
                title: 'Profitez !',
                description: 'Savourez des produits locaux et de saison'
              }
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlanCard({ plan, onSubscribe }) {
  const frequencyLabels = {
    'WEEKLY': 'Hebdomadaire',
    'BIWEEKLY': 'Bimensuel',
    'MONTHLY': 'Mensuel',
  }
  
  const frequencyDescriptions = {
    'WEEKLY': 'Chaque semaine',
    'BIWEEKLY': 'Toutes les 2 semaines',
    'MONTHLY': 'Chaque mois',
  }
  
  const benefits = [
    'Produits frais de saison',
    'Cultivés localement',
    'Sans pesticides',
    'Pause à tout moment',
    'Annulation facile'
  ]
  
  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {plan.name}
        </h3>
        <p className="text-gray-600 mb-4">
          {frequencyDescriptions[plan.frequency]}
        </p>
        <div className="mb-2">
          <span className="text-5xl font-bold text-green-600">
            {plan.price}€
          </span>
        </div>
        <p className="text-sm text-gray-500">
          {frequencyLabels[plan.frequency].toLowerCase()}
        </p>
      </div>
      
      {plan.description && (
        <p className="text-gray-600 text-center mb-6">
          {plan.description}
        </p>
      )}
      
      <ul className="space-y-3 mb-8">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{benefit}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={() => onSubscribe(plan)}
        className="btn-primary w-full"
      >
        S'abonner
      </button>
    </div>
  )
}

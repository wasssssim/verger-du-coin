import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '../api/client'
import useAuthStore from '../stores/authStore'

export default function AccountPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, user, login, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState(searchParams.get('redirect') === 'auth' ? 'login' : 'profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Formulaire de connexion
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  })

  // Formulaire d'inscription
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  })

const handleLogin = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    // Appel API d'authentification
    const response = await api.auth.login(loginData.username, loginData.password)
    
    const token = response.data.access
    
    // Créer un objet user temporaire
    const tempUser = {
      username: loginData.username,
      email: '',
      is_staff: false,
      is_superuser: false
    }
    
    // Stocker dans le store AVANT de récupérer les infos
    login(tempUser, token)
    
    // Maintenant récupérer les vraies infos utilisateur
    try {
      const userResponse = await api.customers.getMe()
      // Mettre à jour avec les vraies infos
      login(userResponse.data, token)
    } catch (userErr) {
      console.error('Erreur récupération user:', userErr)
      // Même si ça échoue, on a le token, donc on peut continuer
    }
    
    setSuccess('Connexion réussie !')
    
    // Redirection
    setTimeout(() => {
      const redirectTo = searchParams.get('from') || '/'
      navigate(redirectTo)
    }, 1000)
  } catch (err) {
    console.error('Erreur de connexion:', err)
    setError(err.response?.data?.detail || 'Identifiants incorrects')
  } finally {
    setLoading(false)
  }
}

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (registerData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      console.log('Données envoyées:', registerData) 
      const response = await api.auth.register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        phone: registerData.phone
      })

          console.log('Réponse:', response.data) // 👈 Debug


      setSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.')
      
      // Basculer vers l'onglet connexion
      setTimeout(() => {
        setActiveTab('login')
        setLoginData({
          username: registerData.username,
          password: registerData.password
        })
      }, 2000)
    } catch (err) {
            console.error('Erreur complète:', err)
  console.error('Status:', err.response?.status) // 👈 Ajoute
  console.error('Data:', err.response?.data) // 👈 Ajoute
  console.error('Headers:', err.response?.headers) // 👈 Ajoute
      console.error('Erreur d\'inscription:', err)
      setError(err.response?.data?.detail || err.response?.data?.username?.[0] || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      logout()
      setSuccess('Déconnexion réussie')
      setTimeout(() => navigate('/'), 1500)
    }
  }

  // Vue profil pour utilisateur connecté
  if (isAuthenticated && activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <LogIn className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </h1>
                    <p className="text-gray-600">@{user?.username}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="btn-secondary"
                >
                  Se déconnecter
                </button>
              </div>

              {/* Badges de rôle */}
              <div className="flex gap-2">
                {user?.is_superuser && (
                  <span className="badge badge-danger">Administrateur</span>
                )}
                {user?.is_staff && !user?.is_superuser && (
                  <span className="badge badge-warning">Personnel</span>
                )}
                {!user?.is_staff && !user?.is_superuser && (
                  <span className="badge badge-primary">Client</span>
                )}
              </div>
            </div>

            {/* Informations */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Informations personnelles</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900">{user?.email || 'Non renseigné'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <p className="text-gray-900">{user?.phone || 'Non renseigné'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <p className="text-gray-900">{user?.address || 'Non renseignée'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <p className="text-gray-900">{user?.postal_code || 'Non renseigné'}</p>
                </div>
              </div>
            </div>

            {/* Carte de fidélité */}
            {user?.loyalty_card && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-8 mb-6 text-white">
                <h2 className="text-2xl font-bold mb-4">Carte de fidélité</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-green-100 mb-1">Numéro de carte</p>
                    <p className="text-3xl font-bold">{user.loyalty_card.card_number}</p>
                  </div>
                  <div>
                    <p className="text-green-100 mb-1">Points accumulés</p>
                    <p className="text-3xl font-bold">{user.loyalty_card.points_balance}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Accès rapide */}
            <div className="grid md:grid-cols-3 gap-4">
              <Link to="/boutique" className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-2">🛒</div>
                <h3 className="font-semibold">Boutique</h3>
                <p className="text-sm text-gray-600">Nos produits</p>
              </Link>
              
              <Link to="/abonnements" className="card p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-2">📦</div>
                <h3 className="font-semibold">Abonnements</h3>
                <p className="text-sm text-gray-600">Paniers hebdo</p>
              </Link>
              
              {(user?.is_staff || user?.is_superuser) && (
                <Link to="/dashboard" className="card p-6 text-center hover:shadow-lg transition-shadow bg-green-50 border-2 border-green-500">
                  <div className="text-4xl mb-2">📊</div>
                  <h3 className="font-semibold text-green-700">Dashboard</h3>
                  <p className="text-sm text-green-600">Espace vendeur</p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vue connexion/inscription
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => {
                  setActiveTab('login')
                  setError('')
                  setSuccess('')
                }}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'login'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LogIn className="h-5 w-5 inline mr-2" />
                Connexion
              </button>
              <button
                onClick={() => {
                  setActiveTab('register')
                  setError('')
                  setSuccess('')
                }}
                className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                  activeTab === 'register'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="h-5 w-5 inline mr-2" />
                Inscription
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'login' ? (
                /* Formulaire de connexion */
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      className="input-field"
                      placeholder="admin"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="input-field pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Compte de test : <code className="bg-gray-100 px-2 py-1 rounded">admin / admin123</code>
                    </p>
                  </div>
                </form>
              ) : (
                /* Formulaire d'inscription */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={registerData.first_name}
                        onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={registerData.last_name}
                        onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'utilisateur *
                    </label>
                    <input
                      type="text"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="input-field"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="input-field"
                      placeholder="Min. 8 caractères"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Inscription...' : 'Créer un compte'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

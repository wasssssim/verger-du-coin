import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/Toaster'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import AccountPage from './pages/AccountPage'
import DashboardPage from './pages/DashboardPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/boutique" element={<ShopPage />} />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/commander" element={<CheckoutPage />} />
          <Route path="/abonnements" element={<SubscriptionsPage />} />
          <Route path="/compte" element={<AccountPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <Toaster />
    </>
  )
}

export default App

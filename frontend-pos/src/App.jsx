// App.jsx - POS SANS LOGIN - Remplace le fichier frontend-pos/src/App.jsx par celui-ci

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';
const api = axios.create({ baseURL: API_URL });

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [cardNumber, setCardNumber] = useState('');

  useEffect(() => {
    api.get('/products/').then(res => setProducts(res.data.results || res.data)).catch(() => alert('Serveur non disponible'));
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const checkout = async (paymentMethod) => {
    if (cart.length === 0) return alert('Panier vide');
    try {
      const res = await api.post('/sales/', {
        channel: 'KIOSK', location: 1, customer: customer?.id,
        payment_method: paymentMethod,
        lines: cart.map(item => ({ product: item.id, quantity: item.quantity, unit_price: item.base_price, vat_rate: item.vat_rate }))
      });
      alert(`✅ Vente ${res.data.sale_number} - ${res.data.total}€`);
      setCart([]); setCustomer(null); setCardNumber('');
    } catch (err) {
      alert('Erreur vente');
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.base_price * item.quantity), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#16a34a', color: 'white', padding: '1rem' }}>
        <h1 style={{ margin: 0, textAlign: 'center' }}>🍎 Le Verger du Coin - POS</h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        
        <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
          <h2>Produits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {products.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} style={{ padding: '1rem', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: 'white' }}>
                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                <div style={{ color: '#16a34a', fontSize: '1.2rem' }}>{p.base_price}€/{p.unit}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
          <h2>Panier</h2>
          
          <input placeholder="Carte fidélité" value={cardNumber} onChange={e => setCardNumber(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }} />

          <div style={{ marginBottom: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f9fafb', marginBottom: '0.5rem', borderRadius: '4px' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '0.875rem' }}>{item.quantity} × {item.base_price}€</div>
                </div>
                <div style={{ fontWeight: 'bold' }}>{(item.quantity * item.base_price).toFixed(2)}€</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px solid #ddd', paddingTop: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
              <span>TOTAL</span>
              <span style={{ color: '#16a34a' }}>{total.toFixed(2)}€</span>
            </div>
          </div>

          <button onClick={() => checkout('CASH')} style={{ width: '100%', padding: '1rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.5rem' }}>
            💵 ESPÈCES
          </button>
          
          <button onClick={() => checkout('CARD')} style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
            💳 CARTE
          </button>
        </div>
      </div>
    </div>
  );
}

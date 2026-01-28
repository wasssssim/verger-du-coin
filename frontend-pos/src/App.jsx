import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';
const api = axios.create({ baseURL: API_URL });

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [lastSale, setLastSale] = useState(null); // Pour stocker le ticket

  useEffect(() => {
    api.get('/products/')
      .then(res => setProducts(res.data.results || res.data))
      .catch(() => alert('Serveur non disponible'));
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const checkout = async (paymentMethod, totalPrice) => {
    if (cart.length === 0) return alert('Panier vide');
    try {
      const res = await api.post('/sales/', {
        channel: 'KIOSK', 
        location: 1, 
        customer: customer?.id,
        payment_method: paymentMethod,
        lines: cart.map(item => ({ 
          product: item.id, 
          quantity: item.quantity, 
          unit_price: item.base_price, 
          vat_rate: item.vat_rate 
        }))
      });
      
      // On stocke la réponse pour le ticket
      setLastSale(res.data);
      
      // Reset du panier
      setCart([]); setCustomer(null); setCardNumber('');
    } catch (err) {
      alert('Erreur lors de la vente');
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.base_price * item.quantity), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'sans-serif' }}>
      {/* HEADER */}
      <div style={{ background: '#16a34a', color: 'white', padding: '1rem' }}>
        <h1 style={{ margin: 0, textAlign: 'center' }}>🍎 Le Verger du Coin - POS</h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        
        {/* GRILLE PRODUITS */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0 }}>Produits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {products.map(p => (
              <button key={p.id} onClick={() => addToCart(p)} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: 'white', transition: 'transform 0.1s' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{p.name}</div>
                <div style={{ color: '#16a34a', fontSize: '1.2rem', fontWeight: 'bold' }}>{p.base_price}€</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>par {p.unit}</div>
              </button>
            ))}
          </div>
        </div>

        {/* PANIER */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginTop: 0 }}>Panier</h2>
          
          <input placeholder="Scanner carte fidélité..." value={cardNumber} onChange={e => setCardNumber(e.target.value)} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} />

          <div style={{ flexGrow: 1, marginBottom: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', marginBottom: '0.5rem', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>{item.quantity} × {item.base_price}€</div>
                </div>
                <div style={{ fontWeight: 'bold' }}>{(item.quantity * item.base_price).toFixed(2)}€</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
              <span>TOTAL</span>
              <span style={{ color: '#16a34a' }}>{total.toFixed(2)}€</span>
            </div>
          </div>

          <button onClick={() => checkout('CASH', total.toFixed(2))} style={{ width: '100%', padding: '1rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '0.75rem' }}>
            💵 ESPÈCES
          </button>
          
          <button onClick={() => checkout('CARD', total.toFixed(2))} style={{ width: '100%', padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            💳 CARTE
          </button>
        </div>
      </div>

      {/* MODAL TICKET DE CAISSE */}
      {lastSale && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '350px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            
            {/* Design du Ticket */}
            <div id="receipt-content" style={{ textAlign: 'center', fontFamily: 'monospace', color: '#000' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>LE VERGER DU COIN</h3>
              <p style={{ fontSize: '0.8rem', margin: 0 }}>123 Rue du Marché, 13000 Marseille</p>
              <p style={{ fontSize: '0.8rem', margin: '0 0 1rem 0' }}>{new Date().toLocaleString()}</p>
              
              <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '0.5rem 0', textAlign: 'left', fontSize: '0.9rem' }}>
                {lastSale.lines.map((line, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{line.product_name} x{parseFloat(line.quantity)}</span>
                    <span>{(parseFloat(line.quantity) * parseFloat(line.unit_price)).toFixed(2)}€</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                TOTAL: {lastSale.lines.reduce((s, l) => s + (parseFloat(l.quantity) * parseFloat(l.unit_price)), 0).toFixed(2)}€
              </div>
              
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', textAlign: 'left' }}>
                Mode de paiement: {lastSale.payment_method === 'CASH' ? 'ESPECES' : 'CARTE'}<br/>
                Canal: {lastSale.channel}
              </p>
              
              <div style={{ marginTop: '1.5rem', fontSize: '0.8rem' }}>
                Merci de votre visite ! 🍎
              </div>
            </div>

            {/* BOUTONS MODAL */}
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => window.print()} style={{ flex: 1, padding: '0.75rem', background: '#4b5563', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Imprimer
              </button>
              <button onClick={() => setLastSale(null)} style={{ flex: 1, padding: '0.75rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Nouvelle vente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS pour l'impression (cache tout sauf le ticket) */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
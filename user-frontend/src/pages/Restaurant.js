import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Restaurant.css';

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'beverage', 'dessert'];
const CAT_LABELS = { breakfast: '🍳 Breakfast', lunch: '🥗 Lunch', dinner: '🍽️ Dinner', beverage: '🍹 Beverages', dessert: '🍰 Desserts' };

const Restaurant = () => {
  const [menu, setMenu] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('breakfast');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderForm, setOrderForm] = useState({ guest_name: '', room_number: '', delivery_type: 'room', special_instructions: '' });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/restaurant/menu'),
      axios.get('http://localhost:5000/api/restaurant/offers')
    ]).then(([menuRes, offersRes]) => {
      setMenu(Array.isArray(menuRes.data) ? menuRes.data : (menuRes.data?.data || []));
      setOffers(Array.isArray(offersRes.data) ? offersRes.data : (offersRes.data?.data || []));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredMenu = menu.filter(item => item.category === activeTab);
  const totalCart = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { setOrderError('Cart is empty'); return; }
    setOrderLoading(true); setOrderError('');
    try {
      await axios.post('http://localhost:5000/api/restaurant/orders', {
        ...orderForm,
        items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
        total_amount: totalCart
      });
      setCart([]); setShowCart(false); setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 6000);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Order failed. Please try again.');
    } finally { setOrderLoading(false); }
  };

  return (
    <div className="restaurant-page">
      <div className="page-header">
        <div className="page-header-bg" />
        <div className="container page-header-content">
          <p className="section-eyebrow">Culinary Experience</p>
          <h1>Our Restaurant</h1>
          <p>Fresh local ingredients, ocean views, and culinary excellence in every bite</p>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        {orderSuccess && <div className="alert alert-success">🎉 Your order has been placed! We'll deliver it shortly.</div>}

        {/* SPECIAL OFFERS */}
        {offers.length > 0 && (
          <div className="rest-offers">
            <h2 className="offers-heading">🎁 Special Offers</h2>
            <div className="offers-grid">
              {offers.map(o => (
                <div className="offer-card" key={o.id}>
                  <div className="offer-icon">🏷️</div>
                  <div>
                    <strong>{o.title}</strong>
                    <p>{o.description}</p>
                    {o.discount_percent > 0 && <span className="badge badge-gold">{o.discount_percent}% OFF</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BUFFET INFO CARDS */}
        <div className="buffet-info">
          {[
            { time: '7:00 AM – 10:30 AM', name: 'Breakfast Buffet', desc: 'Start your day with our extensive breakfast spread featuring Sri Lankan delicacies, continental classics, and fresh tropical fruits.', icon: '🍳', price: 18 },
            { time: '12:00 PM – 3:00 PM', name: 'Lunch Buffet', desc: 'An abundant midday spread with locally-caught seafood, international cuisine, and live cooking stations by the poolside.', icon: '🥗', price: 35 },
            { time: '7:00 PM – 10:30 PM', name: 'Dinner Buffet', desc: 'A grand evening culinary journey with a chef\'s tasting menu, themed nights, and spectacular ocean views under the stars.', icon: '🌙', price: 45 },
          ].map((b, i) => (
            <div className="buffet-card" key={i}>
              <div className="buffet-icon">{b.icon}</div>
              <div className="buffet-info-body">
                <div className="buffet-time">{b.time}</div>
                <h3>{b.name}</h3>
                <p>{b.desc}</p>
              </div>
              <div className="buffet-price">From ${b.price}<small>/person</small></div>
            </div>
          ))}
        </div>

        {/* MENU SECTION */}
        <div className="menu-section">
          <div className="menu-header">
            <h2>Order Online</h2>
            <button className="cart-btn" onClick={() => setShowCart(true)}>
              🛒 Cart {cart.length > 0 && <span className="cart-count">{cart.reduce((s, c) => s + c.qty, 0)}</span>}
            </button>
          </div>

          <div className="menu-tabs">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`menu-tab ${activeTab === cat ? 'active' : ''}`} onClick={() => setActiveTab(cat)}>
                {CAT_LABELS[cat]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loader"><div className="spinner" /></div>
          ) : (
            <div className="menu-grid">
              {filteredMenu.map(item => {
                const inCart = cart.find(c => c.id === item.id);
                return (
                  <div className="menu-item-card" key={item.id}>
                    <div className="img-placeholder food menu-item-img">
                      {item.image_url ? (
                        <img src={`http://localhost:5000${item.image_url}`} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      ) : (
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-light)'}}>🍽️</div>
                      )}
                      {item.is_vegetarian && <span className="veg-badge">🌿 Veg</span>}
                    </div>
                    <div className="menu-item-body">
                      <h4>{item.name}</h4>
                      <p>{item.description}</p>
                      <div className="menu-item-footer">
                        <span className="menu-price">${item.price}</span>
                        {inCart ? (
                          <div className="qty-control">
                            <button onClick={() => updateQty(item.id, inCart.qty - 1)}>−</button>
                            <span>{inCart.qty}</span>
                            <button onClick={() => updateQty(item.id, inCart.qty + 1)}>+</button>
                          </div>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>Add to Order</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredMenu.length === 0 && <p style={{ color: 'var(--text-light)', padding: '40px' }}>No items available in this category.</p>}
            </div>
          )}
        </div>
      </div>

      {/* CART SIDEBAR */}
      {showCart && (
        <div className="cart-overlay" onClick={() => setShowCart(false)}>
          <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Your Order</h3>
              <button onClick={() => setShowCart(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <p style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>Your cart is empty</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                      <div className="qty-control">
                        <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span>Total</span><strong>${totalCart.toFixed(2)}</strong>
                </div>
                {orderError && <div className="alert alert-error">{orderError}</div>}
                <form onSubmit={placeOrder} style={{ padding: '0 20px 20px' }}>
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input className="form-control" placeholder="Guest name" required
                      value={orderForm.guest_name} onChange={e => setOrderForm({ ...orderForm, guest_name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Room Number</label>
                    <input className="form-control" placeholder="e.g. 201"
                      value={orderForm.room_number} onChange={e => setOrderForm({ ...orderForm, room_number: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery</label>
                    <select className="form-control"
                      value={orderForm.delivery_type} onChange={e => setOrderForm({ ...orderForm, delivery_type: e.target.value })}>
                      <option value="room">🛏️ Room Delivery</option>
                      <option value="restaurant">🍽️ Dine in Restaurant</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Special Instructions</label>
                    <textarea className="form-control" rows="2" placeholder="Allergies, preferences..."
                      value={orderForm.special_instructions} onChange={e => setOrderForm({ ...orderForm, special_instructions: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={orderLoading}>
                    {orderLoading ? 'Placing Order...' : `Place Order — $${totalCart.toFixed(2)}`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurant;

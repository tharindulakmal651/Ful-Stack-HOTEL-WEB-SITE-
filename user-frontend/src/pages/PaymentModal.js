import React, { useState } from 'react';
import axios from '../axiosConfig';
import { toRs } from '../utils';
import './PaymentModal.css';

const PaymentModal = ({ booking, onClose, onPaid }) => {
  const [tab,     setTab]     = useState('card'); // card | bank
  const [step,    setStep]    = useState(1);       // 1=details, 2=confirm, 3=success
  const [card,    setCard]    = useState({ name:'', number:'', expiry:'', cvv:'' });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const totalRs = toRs(booking.total_price);
  const f = (k,v) => setCard(p=>({...p,[k]:v}));

  // Format card number with spaces
  const formatNumber = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  // Format expiry MM/YY
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g,'').slice(0,4);
    return d.length>2 ? d.slice(0,2)+'/'+d.slice(2) : d;
  };

  const cardType = () => {
    const n = card.number.replace(/\s/g,'');
    if (/^4/.test(n)) return { name:'Visa', icon:'💳', color:'#1a1f71' };
    if (/^5[1-5]/.test(n)) return { name:'Mastercard', icon:'💳', color:'#eb001b' };
    if (/^3[47]/.test(n)) return { name:'Amex', icon:'💳', color:'#007bc1' };
    return { name:'Card', icon:'💳', color:'#888' };
  };

  const validate = () => {
    const e = {};
    if (!card.name.trim())               e.name   = 'Cardholder name required';
    const raw = card.number.replace(/\s/g,'');
    if (raw.length < 16)                 e.number  = 'Enter a valid 16-digit card number';
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'Enter expiry as MM/YY';
    if (card.cvv.length < 3)             e.cvv    = 'CVV must be 3-4 digits';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // In a real app this would go to a payment gateway (Stripe, PayHere etc.)
      // For now we confirm the booking in the DB
      await axios.put(`/api/bookings/${booking.id}`, { status: 'confirmed' });
      setStep(3);
      setTimeout(() => { onPaid(); onClose(); }, 3000);
    } catch(err) {
      setErrors({ general: err.response?.data?.message || 'Payment failed. Please try again.' });
      setLoading(false);
    }
  };

  const ct = cardType();

  return (
    <div className="pay-overlay" onClick={onClose}>
      <div className="pay-modal" onClick={e=>e.stopPropagation()}>
        <button className="pay-close" onClick={onClose}>✕</button>

        {/* Header */}
        <div className="pay-header">
          <div className="pay-logo">🌊 Araliya Resort</div>
          <div className="pay-amount">
            <div className="pay-total">{totalRs}</div>
            <div className="pay-desc">Booking #{booking.id} — {booking.room_type} Room</div>
          </div>
        </div>

        {/* Steps */}
        <div className="pay-steps">
          {['Payment Details','Confirm','Done'].map((s,i)=>(
            <div key={i} className={`pay-step ${step===i+1?'active':''} ${step>i+1?'done':''}`}>
              <div className="ps-circle">{step>i+1?'✓':i+1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        {/* ── STEP 1: PAYMENT DETAILS ── */}
        {step===1 && (
          <>
            {/* Tab selector */}
            <div className="pay-tabs">
              <button className={`pay-tab ${tab==='card'?'active':''}`} onClick={()=>setTab('card')}>
                💳 Debit / Credit Card
              </button>
              <button className={`pay-tab ${tab==='bank'?'active':''}`} onClick={()=>setTab('bank')}>
                🏦 Bank Transfer
              </button>
            </div>

            {errors.general && <div className="alert alert-error">{errors.general}</div>}

            {/* ── CARD FORM ── */}
            {tab==='card' && (
              <>
                {/* Visual Card Preview */}
                <div className="card-preview" style={{background:`linear-gradient(135deg, ${ct.color}, #1a4a5e)`}}>
                  <div className="cp-top">
                    <span className="cp-bank">Araliya Resort</span>
                    <span className="cp-type">{ct.name}</span>
                  </div>
                  <div className="cp-chip">▣</div>
                  <div className="cp-number">
                    {card.number || '•••• •••• •••• ••••'}
                  </div>
                  <div className="cp-bottom">
                    <div>
                      <div className="cp-sublabel">Card Holder</div>
                      <div className="cp-value">{card.name||'YOUR NAME'}</div>
                    </div>
                    <div>
                      <div className="cp-sublabel">Expires</div>
                      <div className="cp-value">{card.expiry||'MM/YY'}</div>
                    </div>
                  </div>
                </div>

                {/* Accepted cards */}
                <div className="accepted-cards">
                  <span>Accepted:</span>
                  <span className="ac-badge visa">VISA</span>
                  <span className="ac-badge mc">Mastercard</span>
                  <span className="ac-badge amex">Amex</span>
                  <span className="ac-badge" style={{background:'#003087',color:'white'}}>PayPal</span>
                </div>

                {/* Card fields */}
                <div className="pay-fields">
                  <div className="pay-field">
                    <label>Cardholder Name</label>
                    <input className={errors.name?'err':''} type="text"
                      placeholder="Name as on card" value={card.name}
                      onChange={e=>f('name',e.target.value.toUpperCase())}/>
                    {errors.name&&<span className="field-err">{errors.name}</span>}
                  </div>

                  <div className="pay-field">
                    <label>Card Number</label>
                    <div className="card-num-wrap">
                      <input className={errors.number?'err':''} type="text"
                        placeholder="0000 0000 0000 0000" value={card.number}
                        maxLength="19"
                        onChange={e=>f('number',formatNumber(e.target.value))}/>
                      <span className="card-icon">{ct.icon}</span>
                    </div>
                    {errors.number&&<span className="field-err">{errors.number}</span>}
                  </div>

                  <div className="pay-row">
                    <div className="pay-field">
                      <label>Expiry Date</label>
                      <input className={errors.expiry?'err':''} type="text"
                        placeholder="MM/YY" value={card.expiry} maxLength="5"
                        onChange={e=>f('expiry',formatExpiry(e.target.value))}/>
                      {errors.expiry&&<span className="field-err">{errors.expiry}</span>}
                    </div>
                    <div className="pay-field">
                      <label>CVV / CVC <span className="cvv-hint">?</span></label>
                      <input className={errors.cvv?'err':''} type="password"
                        placeholder="•••" value={card.cvv} maxLength="4"
                        onChange={e=>f('cvv',e.target.value.replace(/\D/g,'').slice(0,4))}/>
                      {errors.cvv&&<span className="field-err">{errors.cvv}</span>}
                    </div>
                  </div>
                </div>

                <div className="secure-note">🔒 256-bit SSL Encrypted — Your card details are safe</div>
                <button className="btn-pay" onClick={()=>{if(validate())setStep(2);}}>
                  Continue to Confirm →
                </button>
              </>
            )}

            {/* ── BANK TRANSFER ── */}
            {tab==='bank' && (
              <div className="bank-info">
                <h4>Bank Transfer Details</h4>
                <div className="bank-row"><span>Bank</span><strong>Bank of Ceylon</strong></div>
                <div className="bank-row"><span>Account Name</span><strong>Araliya Resort & Spa</strong></div>
                <div className="bank-row"><span>Account No.</span><strong>00123456789</strong></div>
                <div className="bank-row"><span>Branch</span><strong>Galle</strong></div>
                <div className="bank-row"><span>Amount</span><strong className="bank-amount">{totalRs}</strong></div>
                <div className="bank-row"><span>Reference</span><strong>Booking #{booking.id}</strong></div>
                <div className="bank-note">
                  ⚠️ Please use your Booking ID as the payment reference. 
                  Email your bank slip to <strong>reservations@araliyaresort.lk</strong> 
                  to confirm your booking.
                </div>
                <button className="btn-pay" onClick={()=>{onPaid();onClose();}}>
                  I've Made the Transfer ✓
                </button>
              </div>
            )}
          </>
        )}

        {/* ── STEP 2: CONFIRM ── */}
        {step===2 && (
          <div className="pay-confirm">
            <div className="confirm-icon">🔍</div>
            <h3>Confirm Payment</h3>
            <div className="confirm-details">
              <div className="cd-row"><span>Room</span><strong>{booking.room_type} — Rm {booking.room_number}</strong></div>
              <div className="cd-row"><span>Check-in</span><strong>{new Date(booking.check_in).toLocaleDateString()}</strong></div>
              <div className="cd-row"><span>Check-out</span><strong>{new Date(booking.check_out).toLocaleDateString()}</strong></div>
              <div className="cd-row"><span>Card</span><strong>•••• •••• •••• {card.number.replace(/\s/g,'').slice(-4)}</strong></div>
              <div className="cd-row total"><span>Total</span><strong>{totalRs}</strong></div>
            </div>
            <div className="confirm-actions">
              <button className="btn-back" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn-pay" onClick={handlePay} disabled={loading} style={{flex:2}}>
                {loading ? '⏳ Processing...' : `💳 Pay ${totalRs}`}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step===3 && (
          <div className="pay-success">
            <div className="success-icon">✅</div>
            <h3>Payment Successful!</h3>
            <p>Your booking has been confirmed.</p>
            <div className="success-details">
              <div className="cd-row"><span>Booking ID</span><strong>#{booking.id}</strong></div>
              <div className="cd-row"><span>Room</span><strong>{booking.room_type}</strong></div>
              <div className="cd-row"><span>Amount Paid</span><strong>{totalRs}</strong></div>
            </div>
            <p style={{color:'var(--text-light)',fontSize:'0.85rem',marginTop:12}}>
              A confirmation email will be sent shortly. Redirecting...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;

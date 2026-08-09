import React, { useState } from 'react';
import { QrCode, Copy, Check, X, ArrowRight, Info } from 'lucide-react';

export default function UpiDepositModal({
  isOpen,
  onClose,
  depositAmount = 500,
  onSubmitUtr,
  upiId = "satian2990@okicici"
}) {
  const [utr, setUtr] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(500);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUtr = utr.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      setError('Please enter a valid 12-digit UPI UTR / Reference ID from your payment app.');
      return;
    }

    setIsSubmitting(true);
    await onSubmitUtr(cleanUtr, selectedAmount);
    setIsSubmitting(false);
    onClose();
  };

  // Generate dynamic QR Code for UPI payment
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=${upiId}&pn=CodeStake&am=${selectedAmount}&cu=INR`
  )}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', background: 'var(--bg-card)' }}>
        <div className="modal-header">
          <div className="title-with-icon">
            <QrCode size={22} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ color: 'var(--text-main)' }}>Deposit Collateral</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', margin: 0 }}>
          <div className="modal-body" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
            
            {/* Amount Selection */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                Select Deposit Amount (₹) 
              </label>
              <select 
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                className="form-control"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}
              >
                {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500].map(amt => (
                  <option key={amt} value={amt}>₹{amt}</option>
                ))}
              </select>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Scan the UPI QR code below using <strong>GPay, PhonePe, Paytm, or BHIM</strong> to transfer ₹{selectedAmount} collateral.
            </p>

            {/* QR Code Container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-card-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
              <img
                src={qrCodeUrl}
                alt="CodeStake UPI QR Code"
                style={{ width: '180px', height: '180px', borderRadius: 'var(--radius-sm)', background: '#ffffff', padding: '8px' }}
              />
              <span style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Scan to Pay ₹{selectedAmount} via any UPI App</span>

              {/* UPI ID Row */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-card)', padding: '8px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>UPI ID: {upiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copied ? '#10b981' : 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '600' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="modern-alert modern-alert-danger" style={{ marginBottom: '12px' }}>
                <Info size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* UTR Input Field */}
            <div className="form-group">
              <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                Enter 12-Digit UPI Ref / UTR Number
              </label>
              <input
                type="text"
                placeholder="e.g. 421908123456"
                value={utr}
                onChange={(e) => { setUtr(e.target.value); setError(''); }}
                required
                className="form-control"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', letterSpacing: '0.5px' }}
                autoFocus
              />
              <small style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                You can find the UTR / Ref No. in your GPay / PhonePe payment receipt.
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Submitting...' : 'Submit UTR for Verification'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

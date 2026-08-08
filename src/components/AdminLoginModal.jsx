import React, { useState } from 'react';
import { Shield, ArrowRight, X, ShieldAlert } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onAdminLogin, adminLoginError, onClearError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onAdminLogin(email, password);
    setIsLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', background: 'var(--bg-card)' }}>
        <div className="modal-header">
          <div className="title-with-icon">
            <Shield size={22} style={{ color: '#10b981' }} />
            <h2 style={{ color: 'var(--text-main)' }}>Moderator & Admin Portal</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', margin: 0 }}>
          <div className="modal-body" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Enter administrative credentials to manage problem sheets, verify member solutions, and apply stake penalties.
            </p>

            {adminLoginError && (
              <div className="modern-alert modern-alert-danger">
                <ShieldAlert size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                <div className="modern-alert-content" style={{ flex: 1 }}>
                  <span className="modern-alert-title">Access Denied</span>
                  <span className="modern-alert-text">{adminLoginError}</span>
                </div>
                <button 
                  type="button" 
                  className="alert-dismiss-btn"
                  onClick={onClearError}
                  title="Dismiss error"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="form-group">
              <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>Admin Email or Username</label>
              <input 
                type="text" 
                placeholder="admin@codestake.app or admin" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-control"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: '600', marginBottom: '6px', display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>Admin Password</label>
              <input 
                type="password" 
                placeholder="Admin password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ background: '#0f172a', borderColor: '#334155' }}>
              <span>{isLoading ? 'Verifying...' : 'Login to Admin Panel'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

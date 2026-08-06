import React, { useState } from 'react';
import { ShieldCheck, Copy, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { verifyLeetCodeBio } from '../services/leetcodeService';

export default function MemberManagementModal({ onAddMember, onClose }) {
  const [step, setStep] = useState(1); // 1: Info Input | 2: Bio Token Verification
  const [name, setName] = useState('');
  const [gmail, setGmail] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [initialDeposit, setInitialDeposit] = useState(500);

  // Generated secret verification token for LeetCode bio verification
  const [verificationToken] = useState(() => `STAKE-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);
  const [bioStatus, setBioStatus] = useState(null); // { success: boolean, message: string }
  const [copied, setCopied] = useState(false);

  const handleNextToVerification = (e) => {
    e.preventDefault();
    if (!name.trim() || !gmail.trim() || !leetcodeUsername.trim()) return;

    if (!gmail.includes('@')) {
      alert("Please enter a valid Gmail address.");
      return;
    }

    setStep(2);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(verificationToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckBio = async () => {
    setIsVerifyingBio(true);
    setBioStatus(null);

    const result = await verifyLeetCodeBio(leetcodeUsername, verificationToken);
    setIsVerifyingBio(false);

    if (result.verified) {
      setBioStatus({ success: true, message: "✅ Verification Successful! Secret token confirmed in LeetCode bio." });
      setTimeout(() => finalizeMemberCreation(true), 1200);
    } else {
      setBioStatus({ 
        success: false, 
        message: result.error || "Token not found in LeetCode profile bio yet. Please paste and save your LeetCode profile!" 
      });
    }
  };

  const finalizeMemberCreation = (verifiedBioStatus) => {
    const newMember = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      gmail: gmail.trim().toLowerCase(),
      leetcodeUsername: leetcodeUsername.trim(),
      verifiedBio: verifiedBioStatus,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(leetcodeUsername)}`,
      color: '#ffb300', // CodeChef Gold Accent
      initialDeposit: Number(initialDeposit),
      depositBalance: Number(initialDeposit),
      currentStreak: 0,
      totalPoints: 0,
      solvedCount: 0,
      penaltiesPaid: 0,
      history: {}
    };

    onAddMember(newMember);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content member-modal">
        <div className="modal-header">
          <div className="title-with-icon">
            <ShieldCheck className="text-gold" size={24} />
            <h2>CodeChef Style Member Verification</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNextToVerification}>
            <div className="modal-body">
              <div className="step-indicator">
                <span className="step-badge active">Step 1: Account Info</span>
                <span className="step-badge">Step 2: Bio Ownership Check</span>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Sharma" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Gmail Address (Must be primary login Gmail)</label>
                <input 
                  type="email" 
                  placeholder="e.g. rahul.sharma@gmail.com" 
                  value={gmail}
                  onChange={(e) => setGmail(e.target.value)}
                  required
                  className="form-control"
                />
                <small className="form-hint">Used for verified identity & notifications.</small>
              </div>

              <div className="form-group">
                <label>LeetCode Username (Exact Public Handle)</label>
                <input 
                  type="text" 
                  placeholder="e.g. rahul_code123" 
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Initial Security Deposit (Collateral Stake)</label>
                <div className="input-with-symbol">
                  <span className="currency-symbol">₹</span>
                  <input 
                    type="number" 
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(e.target.value)}
                    min="100"
                    step="50"
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-gold">
                <span>Proceed to Bio Verification →</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="modal-body">
            <div className="step-indicator">
              <span className="step-badge">Step 1: Account Info</span>
              <span className="step-badge active">Step 2: Bio Ownership Check</span>
            </div>

            <div className="verification-box">
              <p className="verify-instruction">
                To prove that <strong>@{leetcodeUsername}</strong> belongs to <strong>{gmail}</strong>, please temporarily add this verification token to your LeetCode profile bio:
              </p>

              <div className="token-display">
                <code>{verificationToken}</code>
                <button type="button" className="btn btn-xs btn-outline" onClick={handleCopyToken}>
                  <Copy size={14} />
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <ol className="verify-steps-list">
                <li>Go to your <a href={`https://leetcode.com/${leetcodeUsername}/`} target="_blank" rel="noopener noreferrer" className="link-gold">LeetCode Profile <ExternalLink size={12} /></a>.</li>
                <li>Edit your <strong>Summary / About Me</strong> section and paste <code>{verificationToken}</code>.</li>
                <li>Save profile changes on LeetCode, then click <strong>"Verify Bio Ownership"</strong> below.</li>
              </ol>

              {bioStatus && (
                <div className={`bio-status-alert ${bioStatus.success ? 'alert-success' : 'alert-warning'}`}>
                  {bioStatus.success ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                  <span>{bioStatus.message}</span>
                </div>
              )}

              <div className="verify-actions">
                <button 
                  type="button" 
                  className="btn btn-gold w-full"
                  onClick={handleCheckBio}
                  disabled={isVerifyingBio}
                >
                  <RefreshCw size={16} className={isVerifyingBio ? 'spin' : ''} />
                  <span>{isVerifyingBio ? 'Checking LeetCode Profile...' : 'Verify Bio Ownership'}</span>
                </button>

                <button 
                  type="button"
                  className="btn btn-link btn-xs text-muted"
                  onClick={() => finalizeMemberCreation(true)}
                  title="Bypass bio check for demo/local testing"
                >
                  (Demo Bypass: Link Account Directly)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function Captcha({ onVerify }) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [input, setInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setInput('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    
    if (val !== '' && parseInt(val, 10) === num1 + num2) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  };

  return (
    <div className={`captcha-container ${isVerified ? 'verified' : ''}`}>
      <label className="captcha-label">Security Check: What is {num1} + {num2} ?</label>
      <div className="captcha-input-group">
        <input 
          type="number" 
          value={input} 
          onChange={handleChange} 
          placeholder="Answer"
          className="captcha-input"
        />
        <button 
          type="button" 
          className="btn-secondary captcha-refresh" 
          onClick={generateCaptcha}
          title="Refresh Captcha"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}

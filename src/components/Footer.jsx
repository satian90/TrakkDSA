import React from 'react';
import { Sun, Moon, Trophy } from 'lucide-react';

export default function Footer({ theme, onToggleTheme, onOpenAdminModal, userRole }) {
  return (
    <footer className="minimal-footer-big">
      <div className="footer-big-container">
        {/* Minimal Brand Section */}
        <div className="footer-brand-section">
          <div className="brand-logo" style={{ justifyContent: 'center' }}>
            <div className="logo-icon-modern" style={{ width: '40px', height: '40px' }}>
              <Trophy size={22} className="logo-svg" />
            </div>
            <h2 className="brand-title" style={{ fontSize: '1.6rem' }}>CodeStake</h2>
          </div>
          <p className="footer-tagline">
            Automated LeetCode & Codeforces verification & deposit stake pool for competitive coders.
          </p>
        </div>

        {/* Hypertext Links Row */}
        <div className="footer-hyperlinks-row">
          {userRole !== 'member' && userRole !== 'admin' && (
            <>
              <a 
                href="#admin" 
                className="footer-hyperlink"
                onClick={(e) => { e.preventDefault(); onOpenAdminModal(); }}
              >
                Admin Login
              </a>
              <span className="footer-link-divider">•</span>
            </>
          )}

          <button 
            className="footer-theme-hyperlink"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={14} className="text-orange" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={14} className="text-accent" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Copyright Line */}
        <div className="footer-bottom-line">
          <span>CodeStake DSA Tracker © {new Date().getFullYear()} • Verified LeetCode GraphQL & Codeforces API</span>
        </div>
      </div>
    </footer>
  );
}

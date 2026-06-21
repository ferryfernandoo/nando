import { useState, useEffect } from 'react';
import './CookieConsent.css';

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has accepted cookies
    const hasAcceptedCookies = localStorage.getItem('cookie_consent_accepted');
    
    if (!hasAcceptedCookies) {
      // Show consent on first load
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    // Set cookie acceptance
    localStorage.setItem('cookie_consent_accepted', 'true');
    localStorage.setItem('cookie_consent_timestamp', new Date().toISOString());
    
    // Also set a non-httpOnly cookie to signal consent
    document.cookie = 'consent=all; path=/; max-age=31536000; SameSite=Lax';
    
    console.log('✅ Cookie consent accepted');
    setShowConsent(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookie_consent_accepted', 'false');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-modal">
        <div className="cookie-consent-header">
          <h2>🍪 Persetujuan Cookie</h2>
        </div>
        
        <div className="cookie-consent-body">
          <p>
            <strong>Deepernova memerlukan cookie untuk:</strong>
          </p>
          <ul>
            <li>✓ Menyimpan session login kamu</li>
            <li>✓ Menjaga riwayat chat tetap tersimpan</li>
            <li>✓ Keamanan data akun kamu</li>
            <li>✓ Akses seamless di berbagai perangkat</li>
          </ul>
          <p className="cookie-note">
            <strong>Tanpa persetujuan cookie, kamu tidak bisa login dan menyimpan riwayat chat.</strong>
          </p>
        </div>

        <div className="cookie-consent-actions">
          <button 
            className="btn-accept-all"
            onClick={handleAcceptAll}
          >
            ✅ Setuju Semua Cookie
          </button>
          <button 
            className="btn-reject"
            onClick={handleRejectAll}
            disabled
            title="Login memerlukan cookie"
          >
            Tolak (Tidak Bisa Login)
          </button>
        </div>

        <p className="cookie-footer">
          🔒 Data kamu aman. Cookie hanya digunakan untuk session authentication.
        </p>
      </div>
    </div>
  );
}

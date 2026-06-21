import React, { useState } from 'react';
import { API_BASE_URL } from '../apiConfig';
import './AuthForms.css';

const LoginForm = ({ onLoginSuccess, onSwitchToRegister, onGuestLogin }) => {
  const [email, setEmail] = useState('tulis@deepmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'user-not-found', 'wrong-password', 'validation', 'network'
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setErrorType(null);

    if (!email.trim()) {
      setError('Email harus diisi');
      setErrorType('validation');
      return;
    }
    // Enforce @deepmail.com domain for all accounts
    if (!email.toLowerCase().endsWith('@deepmail.com')) {
      setError('Email harus menggunakan domain @deepmail.com (contoh: user@deepmail.com)');
      setErrorType('validation');
      return;
    }
    if (!password) {
      setError('Password harus diisi');
      setErrorType('validation');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error types from backend
        if (data.message === 'Username tidak ditemukan') {
          setError(`❌ Username tidak ditemukan. Email "${email}" belum terdaftar.`);
          setErrorType('user-not-found');
        } else if (data.message === 'Password salah') {
          setError('🔐 Password salah. Silakan cek kembali password Anda.');
          setErrorType('wrong-password');
        } else {
          setError(`❌ ${data.error || data.message || 'Login gagal'}`);
          setErrorType('network');
        }
        throw new Error(data.error || data.message || 'Login gagal');
      }

      setEmail('');
      setPassword('');
      onLoginSuccess?.(data.user);
    } catch (err) {
      console.error('Login error:', err);
      // Error message already set above
    } finally {
      setLoading(false);
    }
  };

  // waktu lokal untuk ucapan selamat
  const now = new Date();
  const hour = now.getHours();
  let timeLabel = '';
  if (hour >= 4 && hour < 12) timeLabel = 'Pagi';
  else if (hour >= 12 && hour < 15) timeLabel = 'Siang';
  else if (hour >= 15 && hour < 18) timeLabel = 'Sore';
  else timeLabel = 'Malam';
  const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="auth-container">
      <div className="auth-box modern">
        <aside className="auth-side-left" aria-hidden="true">
          <div className="visual-brand">
            <h1 className="brand-title">🚀 Orion AI</h1>
            <p className="brand-subtitle">AI gratis untuk semua siswa Indonesia</p>
            <div className="brand-deco" />
          </div>
        </aside>

        <main className="auth-side-right">
          <div className="auth-card">
            <p className="auth-welcome">Selamat datang</p>

            {error && <div className={`error-message ${errorType || ''}`}>{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@deepmail.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <button
                className="auth-submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-divider">atau</div>

            <p className="guest-subtitle">Gunakan AI Lokal & Keamanan Kuat tanpa Login</p>

            <button className="guest-btn" onClick={onGuestLogin} disabled={loading}>
              🔐 Gunakan AI Lokal Keamanan Kuat
            </button>

            <div className="auth-footer">
              <p>Belum punya akun?</p>
              <button
                className="switch-auth-btn"
                onClick={onSwitchToRegister}
                disabled={loading}
              >
                Daftar sekarang
              </button>
            </div>

            <div className="greeting-banner" aria-live="polite">
              <div className="greeting-time">{`${timeLabel} • ${timeString}`}</div>
              <div className="greeting-text">selamat datang di deepernova orion ai</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginForm;

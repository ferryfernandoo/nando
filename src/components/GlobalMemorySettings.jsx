import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';
import './GlobalMemorySettings.css';

/**
 * GlobalMemorySettings Component
 * Allows users to view and edit their global memory (persistent knowledge base)
 */
export default function GlobalMemorySettings({ isOpen, onClose, isAuthenticated, isGuest }) {
  const [memory, setMemory] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [error, setError] = useState(null);

  // Define all functions before any returns
  const loadMemory = async () => {
    try {
      setError(null);
      
      // For guests or if authenticated fails, use localStorage
      if (isGuest || !isAuthenticated) {
        const stored = localStorage.getItem('guest_global_memory');
        const timestamp = localStorage.getItem('guest_global_memory_updated');
        setMemory(stored || '');
        setLastUpdated(timestamp);
        setMessageCount(0);
        return;
      }
      
      // For authenticated users, try API
      const res = await fetch(`${API_BASE_URL}/api/memory/global`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`Gagal memuat memori: ${res.status}`);
      }

      const data = await res.json();
      setMemory(data.globalMemory || '');
      setLastUpdated(data.lastUpdatedAt);
      setMessageCount(data.messageCount || 0);
    } catch (err) {
      setError(err.message);
      console.error('Error loading global memory:', err);
      
      // Fallback to localStorage on error
      const stored = localStorage.getItem('guest_global_memory');
      setMemory(stored || '');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // For guests, save to localStorage
      if (isGuest || !isAuthenticated) {
        localStorage.setItem('guest_global_memory', memory);
        localStorage.setItem('guest_global_memory_updated', new Date().toISOString());
        setLastUpdated(new Date().toISOString());
        setIsEditing(false);
        console.log('[GLOBAL_MEMORY] Saved to localStorage successfully');
        return;
      }

      // For authenticated users, save to API
      const res = await fetch(`${API_BASE_URL}/api/memory/global`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ globalMemory: memory })
      });

      if (!res.ok) {
        throw new Error(`Gagal menyimpan memori: ${res.status}`);
      }

      const data = await res.json();
      setMemory(data.globalMemory);
      setLastUpdated(data.lastUpdatedAt);
      setMessageCount(data.messageCount || 0);
      setIsEditing(false);

      console.log('[GLOBAL_MEMORY] Saved successfully');
    } catch (err) {
      setError(err.message);
      console.error('Error saving global memory:', err);
      
      // Fallback to localStorage on error
      localStorage.setItem('guest_global_memory', memory);
      localStorage.setItem('guest_global_memory_updated', new Date().toISOString());
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    loadMemory();
    setIsEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus semua Global Memory? Ini akan mengosongkan ingatan jangka panjang Anda.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      // For guests, delete from localStorage
      if (isGuest || !isAuthenticated) {
        localStorage.removeItem('guest_global_memory');
        localStorage.removeItem('guest_global_memory_updated');
        setMemory('');
        setLastUpdated(null);
        setMessageCount(0);
        setIsEditing(false);
        setError(null);
        console.log('[GLOBAL_MEMORY] Deleted from localStorage successfully');
        return;
      }

      // For authenticated users, delete from API
      const res = await fetch(`${API_BASE_URL}/api/memory/global`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`Gagal menghapus memori: ${res.status}`);
      }

      const data = await res.json();
      setMemory(data.globalMemory || '');
      setLastUpdated(data.lastUpdatedAt);
      setMessageCount(data.messageCount || 0);
      setIsEditing(false);
      setError(null);

      console.log('[GLOBAL_MEMORY] Deleted successfully');
    } catch (err) {
      setError(err.message);
      console.error('Error deleting global memory:', err);
      
      // Fallback to localStorage on error
      localStorage.removeItem('guest_global_memory');
      localStorage.removeItem('guest_global_memory_updated');
      setMemory('');
      setIsEditing(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Tidak pernah';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Load memory on open
  useEffect(() => {
    if (isOpen) {
      loadMemory();
    }
  }, [isOpen, isAuthenticated, isGuest]);

  if (!isOpen) return null;

  return (
    <div className="global-memory-modal-overlay" onClick={onClose}>
      <div className="global-memory-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🧠 Memori Global</h2>
          <p className="subtitle">{isGuest ? '💾 Disimpan di perangkat ini' : 'Pengetahuan yang dipelajari AI tentang Anda'}</p>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        <div className="memory-info">
          <div className="info-item">
            <span className="label">📊 Pesan dalam sesi:</span>
            <span className="value">{messageCount}</span>
          </div>
          <div className="info-item">
            <span className="label">⏱️ Diperbarui:</span>
            <span className="value">{formatDate(lastUpdated)}</span>
          </div>
        </div>

        <div className="memory-content">
          {isEditing ? (
            <textarea
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="Memori global kosong. AI akan mengisinya otomatis berdasarkan percakapan Anda."
              className="memory-textarea"
            />
          ) : (
            <div className="memory-display">
              {memory ? (
                <p>{memory}</p>
              ) : (
                <p className="empty-message">
                  🔄 Belum ada memori global. AI akan mulai mencatat poin-poin penting setiap kali Anda mengirim chat.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="modal-actions">
          {!isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn-primary"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isDeleting || !memory}
                className="btn-secondary"
                style={{ marginLeft: '8px' }}
              >
                {isDeleting ? '🗑️ Menghapus...' : '🗑️ Hapus Memori'}
              </button>
              <button onClick={onClose} className="btn-secondary" style={{ marginLeft: '8px' }}>
                Tutup
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? '💾 Menyimpan...' : '💾 Simpan'}
              </button>
              <button 
                onClick={handleReset} 
                disabled={isSaving}
                className="btn-secondary"
              >
                ↩️ Batal
              </button>
            </>
          )}
        </div>

        <div className="memory-info-text">
          <p>💡 Memori Global adalah pengetahuan tentang Anda yang dipelajari AI. Setiap kali Anda mengirim chat, AI secara otomatis merangkum poin penting agar ingat preferensi, fakta, dan tujuan Anda di percakapan berikutnya.</p>
        </div>
      </div>
    </div>
  );
}

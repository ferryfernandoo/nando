import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';
import './SavedImagesGallery.css';

const SavedImagesGallery = ({ isOpen, onClose, isAuthenticated, user }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userLanguage, setUserLanguage] = useState('id');

  // Fetch saved images when panel opens
  useEffect(() => {
    const lang = localStorage.getItem('orion_language') || 'id';
    setUserLanguage(lang);

    // Only fetch if authenticated (not guest)
    const isReallyAuthenticated = isAuthenticated && user && !user.guest;
    if (isOpen && isReallyAuthenticated) {
      fetchSavedImages();
    }
  }, [isOpen, isAuthenticated, user?.guest, user?.id]);

  const fetchSavedImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/user`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status}`);
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (err) {
      console.error('[SavedImages] Error fetching:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (image) => {
    try {
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `orion-${image.id.substring(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('[SavedImages] Download error:', err);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm(userLanguage === 'id' ? 'Hapus gambar ini?' : 'Delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete image: ${response.status}`);
      }

      // Remove from local state
      setImages(images.filter(img => img.id !== imageId));
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
    } catch (err) {
      console.error('[SavedImages] Delete error:', err);
      setError(err.message);
    }
  };

  if (!isOpen || !isAuthenticated || user?.guest) return null;

  return (
    <div className="saved-images-overlay" onClick={onClose}>
      <div className="saved-images-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="saved-images-header">
          <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Main Content */}
        <div className="saved-images-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{userLanguage === 'id' ? 'Memuat gambar...' : 'Loading images...'}</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>❌ {error}</p>
              <button onClick={fetchSavedImages} className="retry-btn">
                {userLanguage === 'id' ? 'Coba Lagi' : 'Retry'}
              </button>
            </div>
          ) : images.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" role="img" aria-label="No images">📷</div>
            </div>
          ) : (
            <div className="images-container">
              <div className="gallery-grid">
                {images.map((image) => (
                  <div 
                    key={image.id} 
                    className="gallery-item"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img src={image.imageUrl} alt={userLanguage === 'id' ? 'Gambar tersimpan' : 'Saved image'} />
                  </div>
                ))}
              </div>

              {/* Selected Image Detail */}
              {selectedImage && (
                <div className="image-detail">
                  <div className="detail-header">
                    <button 
                      className="detail-close"
                      onClick={() => setSelectedImage(null)}
                      aria-label="Close details"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <img src={selectedImage.imageUrl} alt={selectedImage.prompt} className="detail-image" />

                  <div className="detail-actions">
                    <button 
                      className="btn-icon btn-download"
                      onClick={() => handleDownload(selectedImage)}
                      aria-label="Download image"
                    >
                      ⬇️
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(selectedImage.id)}
                      aria-label="Delete image"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="saved-images-footer">
          <button className="btn-refresh" onClick={fetchSavedImages} aria-label="Refresh images">
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedImagesGallery;

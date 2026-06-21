import React, { useState, useEffect } from 'react';
import './ImageGenerator.css';
import ImageGenerationService from '../services/imageGenerationService';

const ImageGenerator = ({ isOpen, onClose, prompt, userLanguage = 'id', referenceImage = null }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [reasoning, setReasoning] = useState('');
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    console.log('[ImageGenerator] useEffect triggered. isOpen:', isOpen, 'prompt:', prompt, 'hasGenerated:', hasGenerated);
    
    // Detect if we should use edit mode
    const shouldEditMode = !!referenceImage && ImageGenerationService.detectImageEditRequest(prompt);
    setIsEditMode(shouldEditMode);
    
    if (isOpen && prompt && prompt !== currentPrompt) {
      console.log('[ImageGenerator] Starting image generation for prompt:', prompt);
      console.log('[ImageGenerator] Edit mode:', shouldEditMode);
      setCurrentPrompt(prompt);
      setGeneratedImageUrl(null);
      setError(null);
      setReasoning('');
      setHasGenerated(false);
      generateImage();
      setHasGenerated(true);
    } else if (!isOpen) {
      // Reset when modal closes
      setHasGenerated(false);
      setCurrentPrompt(null);
      setIsEditMode(false);
    }
  }, [isOpen, prompt, referenceImage]);

  const generateImage = async () => {
    try {
      console.log('[ImageGenerator] generateImage called with prompt:', prompt);
      console.log('[ImageGenerator] Edit mode:', isEditMode, 'Reference image:', !!referenceImage);
      setIsGenerating(true);
      setError(null);

      // Generate reasoning
      const reasoningText = ImageGenerationService.generateImageReasoning(prompt);
      setReasoning(reasoningText);

      // Enhance prompt with quality keywords
      const enhancedPrompt = ImageGenerationService.enhancePrompt(prompt);

      // Generate or edit image based on mode
      let result;
      if (isEditMode && referenceImage) {
        console.log('[ImageGenerator] Using edit mode with reference image');
        result = await ImageGenerationService.editImage(enhancedPrompt, referenceImage);
      } else {
        console.log('[ImageGenerator] Using generation mode');
        result = await ImageGenerationService.generateImage(enhancedPrompt);
      }

      if (result.success && result.image.url) {
        setGeneratedImageUrl(result.image.url);
        console.log('[ImageGenerator] Image', isEditMode ? 'edited' : 'generated', 'successfully');
      } else {
        setError(userLanguage === 'id' ? 'Gagal menghasilkan gambar' : 'Failed to generate image');
      }
    } catch (err) {
      console.error('[ImageGenerator] Error:', err);
      setError(err.message || (userLanguage === 'id' ? 'Terjadi kesalahan saat membuat gambar' : 'Error generating image'));
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImageUrl) return;

    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${isEditMode ? 'edited' : 'generated'}-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('[ImageGenerator] Download error:', err);
      setError(userLanguage === 'id' ? 'Gagal mengunduh gambar' : 'Failed to download image');
    }
  };

  const handleImageError = (e) => {
    console.error('[ImageGenerator] 🖼️ Image load error - URL:', generatedImageUrl);
    console.error('[ImageGenerator] 🖼️ Error event:', e);
    console.error('[ImageGenerator] 🖼️ Image element:', e.target);
    
    // Try to fetch the image to see what error we get
    fetch(generatedImageUrl)
      .then(res => {
        console.log('[ImageGenerator] 🖼️ Fetch response status:', res.status, res.statusText);
        console.log('[ImageGenerator] 🖼️ Content-Type:', res.headers.get('Content-Type'));
        return res.blob();
      })
      .then(blob => {
        console.log('[ImageGenerator] 🖼️ Blob size:', blob.size, 'Type:', blob.type);
      })
      .catch(fetchErr => {
        console.error('[ImageGenerator] 🖼️ Fetch error:', fetchErr.message);
      });
    
    setError(`${userLanguage === 'id' ? 'Gagal memuat gambar' : 'Failed to load image'} - URL: ${generatedImageUrl}`);
  };

  const handleImageLoad = () => {
    console.log('[ImageGenerator] ✅ Image loaded successfully - URL:', generatedImageUrl);
  };

  const handleRetry = () => {
    setHasGenerated(false);
    setGeneratedImageUrl(null);
    setError(null);
    setReasoning('');
  };

  if (!isOpen) return null;

  return (
    <div className="image-generator-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content image-modal">
        <div className="modal-header">
          <h2>
            {isEditMode ? '✏️' : '🎨'} {userLanguage === 'id' ? 'Generator Gambar' : 'Image Generator'}
            {isEditMode && <span className="edit-badge"> (Edit Mode)</span>}
          </h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {isGenerating ? (
            <div className="generating-state">
              <div className="spinner"></div>
              <p>{userLanguage === 'id' ? `Sedang ${isEditMode ? 'mengedit' : 'membuat'} gambar...` : `${isEditMode ? 'Editing' : 'Generating'} image...`}</p>
            </div>
          ) : error ? (
            <div className="error-section">
              <p className="error-message">❌ {error}</p>
              <button className="retry-btn" onClick={handleRetry}>
                {userLanguage === 'id' ? '🔄 Coba Lagi' : '🔄 Retry'}
              </button>
            </div>
          ) : generatedImageUrl ? (
            <div className="image-result">
              <div className="reasoning-box">
                <p className="reasoning-title">
                  {userLanguage === 'id' ? (isEditMode ? '✏️ Hasil Edit:' : '💭 Alasan Pembuatan:') : (isEditMode ? '✏️ Edit Result:' : '💭 Generation Reasoning:')}
                </p>
                <p className="reasoning-text">{reasoning}</p>
              </div>

              <div className="prompt-info">
                <p><strong>{userLanguage === 'id' ? 'Prompt: ' : 'Prompt: '}</strong>{prompt}</p>
                {isEditMode && <p className="edit-info">{userLanguage === 'id' ? '📷 Mode: Edit dengan referensi gambar' : '📷 Mode: Edit with reference image'}</p>}
              </div>

              <div className="image-container">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated" 
                  className="generated-image"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>

              <div className="action-buttons">
                <button className="btn-download" onClick={downloadImage}>
                  ⬇️ {userLanguage === 'id' ? 'Unduh' : 'Download'}
                </button>
                <button className="btn-regenerate" onClick={handleRetry}>
                  🔄 {userLanguage === 'id' ? 'Buat Ulang' : 'Regenerate'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;

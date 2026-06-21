import React from 'react';

const DeepernovaUniverse = ({ onNavigate }) => {
  const openEditor = (type) => {
    if (typeof onNavigate === 'function') onNavigate('documents', type);
  };

  return (
    <div className="universe-page">
      <div className="universe-header">
        <button className="back-btn" onClick={() => onNavigate?.('chat')}>← Kembali</button>
        <div>
          <h1>🌌 Deepernova Universe</h1>
          <p className="universe-sub">Platform kreatif: Typernova (Word), Spreadsheet, dan Presentasi.</p>
        </div>
      </div>

      <div className="universe-grid">
        <div className="universe-card" onClick={() => openEditor('word')} role="button" tabIndex={0}>
          <div className="universe-icon">✏️</div>
          <h3>Typernova (Word)</h3>
          <p>Buat dokumen seperti Word dengan editor teks canggih.</p>
        </div>

        <div className="universe-card" onClick={() => openEditor('excel')} role="button" tabIndex={0}>
          <div className="universe-icon">📊</div>
          <h3>Sheets</h3>
          <p>Spreadsheet interaktif untuk perhitungan dan analisis.</p>
        </div>

        <div className="universe-card" onClick={() => openEditor('ppt')} role="button" tabIndex={0}>
          <div className="universe-icon">📽️</div>
          <h3>Presentasi</h3>
          <p>Buat slide PowerPoint dengan template siap pakai.</p>
        </div>
      </div>
    </div>
  );
};

export default DeepernovaUniverse;

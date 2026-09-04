import React from 'react';
import { Search, X, Bell, Smartphone, Monitor } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  isFrameMode,
  setIsFrameMode,
  unreadRemindersCount,
  onOpenReminders
}) {
  return (
    <header className="app-header">
      <div className="header-top-row">
        <div className="brand-wrapper">
          <span className="brand-balloon-icon">🎈</span>
          <div>
            <h1 className="brand-title">Kapadokya</h1>
            <div className="brand-subtitle">Etkinlik & Keşif Rehberi</div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="header-icon-btn"
            onClick={() => setIsFrameMode(!isFrameMode)}
            title={isFrameMode ? "Geniş Ekrana Geç" : "Telefon Görünümüne Geç"}
            aria-label="Cihaz Görünümünü Değiştir"
          >
            {isFrameMode ? <Monitor size={17} /> : <Smartphone size={17} />}
          </button>

          <button
            className="header-icon-btn"
            onClick={onOpenReminders}
            title="Hatırlatıcılar ve Bildirimler"
            aria-label="Bildirimler"
          >
            <Bell size={17} />
            {unreadRemindersCount > 0 && (
              <span className="badge-counter">{unreadRemindersCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="search-box-container">
        <Search className="search-icon" size={16} />
        <input
          type="text"
          className="search-input"
          placeholder="Etkinlik, konser, atölye veya vadi ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="clear-search-btn"
            onClick={() => setSearchQuery('')}
            aria-label="Aramayı Temizle"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </header>
  );
}

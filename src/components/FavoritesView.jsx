import React from 'react';
import EventCard from './EventCard';
import { Heart, Calendar, Download, Trash2 } from 'lucide-react';
import { downloadIcsCalendar } from '../services/calendar';

export default function FavoritesView({
  events,
  favorites,
  onToggleFavorite,
  onSelectEvent,
  onQuickReminder,
  onShare,
  onClearAllFavorites
}) {
  const favoriteEvents = events.filter(e => favorites.includes(e.id));

  const handleExportAll = () => {
    favoriteEvents.forEach((evt, idx) => {
      setTimeout(() => {
        downloadIcsCalendar(evt);
      }, idx * 300);
    });
  };

  return (
    <div className="subpage-container">
      <div className="subpage-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="subpage-title">💖 Favori Etkinliklerim</h2>
            <div className="subpage-subtitle">
              {favoriteEvents.length} kayıtlı Kapadokya etkinliği
            </div>
          </div>

          {favoriteEvents.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="header-icon-btn"
                onClick={handleExportAll}
                title="Tümünü Takvime İndir"
              >
                <Download size={16} />
              </button>
              <button
                className="header-icon-btn"
                onClick={onClearAllFavorites}
                title="Tüm Favorileri Temizle"
                style={{ color: '#f72585' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {favoriteEvents.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon">🎈💔</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Henüz favori etkinliğiniz yok
          </h3>
          <p className="empty-state-text">
            Beğendiğiniz etkinliklerin üzerindeki kalp simgesine dokunarak ajandanıza ekleyebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="events-list" style={{ padding: 0 }}>
          {favoriteEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelectEvent={onSelectEvent}
              onQuickReminder={onQuickReminder}
              onShare={onShare}
            />
          ))}
        </div>
      )}
    </div>
  );
}

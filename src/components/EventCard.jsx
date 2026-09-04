import React from 'react';
import { Calendar, Clock, MapPin, Heart, Bell, Share2, Globe, ShieldCheck, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { notificationService } from '../services/notification';
import { evaluateEventTrust } from '../services/verification';

export default function EventCard({
  event,
  isFavorite,
  onToggleFavorite,
  onSelectEvent,
  onQuickReminder,
  onShare,
  onDeleteCustomEvent
}) {
  const trustData = evaluateEventTrust(event);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(event.id);
    if (!isFavorite) {
      notificationService.playChime('favorite');
      notificationService.vibrate([40]);
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 20,
        spread: 45,
        origin: { x, y },
        colors: ['#f72585', '#ff6e40', '#ffd166'],
        disableForReducedMotion: true
      });
    }
  };

  const handleOpenSource = (e) => {
    e.stopPropagation();
    if (event.sourceUrl) {
      window.open(event.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'short'
  });

  const isCustomEvent = event.isCustom || event.id.startsWith('custom-evt-');

  return (
    <div className="event-card" onClick={() => onSelectEvent(event)}>
      <div className="event-card-cover">
        <img
          src={event.image}
          alt={event.title}
          className="event-card-img"
          loading="lazy"
        />

        <div className="event-card-tags">
          <span className="badge-category">
            {event.categoryIcon} {event.town}
          </span>
          {event.isFree ? (
            <span className="badge-free">Ücretsiz</span>
          ) : (
            <span className="badge-price">{event.priceLabel}</span>
          )}
          
          {/* Dynamic Trust Badge */}
          <span
            className="badge-category"
            style={{
              background: trustData.trustScore >= 80 ? 'rgba(6, 214, 160, 0.2)' : 'rgba(255, 209, 102, 0.2)',
              borderColor: trustData.trustScore >= 80 ? 'rgba(6, 214, 160, 0.5)' : 'rgba(255, 209, 102, 0.5)',
              color: trustData.badgeColor,
              fontSize: 10,
              fontWeight: 700
            }}
          >
            {trustData.verificationLevel === 'OFFICIAL' ? '✓ %100 Resmi' : trustData.verificationLevel === 'VERIFIED_ORG' ? '✓ Teyitli' : '⚠️ Topluluk'}
          </span>
        </div>

        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, zIndex: 3 }}>
          {isCustomEvent && onDeleteCustomEvent && (
            <button
              className="card-favorite-btn"
              style={{ background: 'rgba(239, 68, 68, 0.85)', color: '#fff' }}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCustomEvent(event.id);
              }}
              title="Bu Etkinliği Sil"
            >
              <Trash2 size={15} />
            </button>
          )}

          <button
            className={`card-favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      <div className="event-card-body">
        <h2 className="card-title">{event.title}</h2>

        <div className="card-meta-grid">
          <div className="card-meta-item">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
          <div className="card-meta-item">
            <Clock size={14} />
            <span>{event.time}</span>
          </div>
        </div>

        <div className="card-meta-item" style={{ marginBottom: 12, fontSize: 12 }}>
          <MapPin size={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.locationName}
          </span>
        </div>

        <div className="card-footer">
          <span className="card-organizer" title={event.organizer}>
            🏛️ {event.organizer}
          </span>

          <div className="card-actions-row">
            {/* Source Webpage Button */}
            {event.sourceUrl && (
              <button
                className="card-quick-action"
                onClick={handleOpenSource}
                title={`Kaynak Web Sayfası: ${event.sourceName || trustData.domainInfo.domain}`}
                style={{ color: '#ffd166', borderColor: 'rgba(255, 209, 102, 0.3)' }}
              >
                <Globe size={13} />
                <span>Kaynak</span>
              </button>
            )}

            <button
              className="card-quick-action"
              onClick={(e) => {
                e.stopPropagation();
                onQuickReminder(event);
              }}
              title="Hatırlatıcı Kur"
            >
              <Bell size={13} />
              <span>Hatırlat</span>
            </button>

            <button
              className="card-quick-action"
              onClick={(e) => {
                e.stopPropagation();
                onShare(event);
              }}
              title="Paylaş"
            >
              <Share2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

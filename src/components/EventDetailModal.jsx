import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Clock, MapPin, Heart, Bell, Share2, 
  Download, ExternalLink, Compass, ShieldCheck, Ticket, Check, Globe,
  AlertTriangle, Trash2, Flag, ShieldAlert
} from 'lucide-react';
import { downloadIcsCalendar, getGoogleCalendarUrl } from '../services/calendar';
import { notificationService } from '../services/notification';
import { evaluateEventTrust } from '../services/verification';

export default function EventDetailModal({
  event,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddReminder,
  onNavigateToMap,
  onShare,
  onDeleteCustomEvent,
  onReportEvent
}) {
  const [reminderOption, setReminderOption] = useState('1_day');
  const [reminderSaved, setReminderSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  
  // Reporting state
  const [isReportingOpen, setIsReportingOpen] = useState(false);
  const [reportReason, setReportReason] = useState('fake');
  const [reportNotes, setReportNotes] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Trust evaluation for this event
  const trustData = evaluateEventTrust(event);

  // Calculate live countdown
  useEffect(() => {
    if (!event) return;

    const updateCountdown = () => {
      const targetTime = new Date(`${event.date}T${(event.time || "10:00").split("-")[0].trim()}:00`);
      const now = new Date();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft('Etkinlik Başladı / Bugün');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        setTimeLeft(`${days} Gün ${hours} Saat ${mins} Dk Kaldı`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) return null;

  const handleCreateReminder = () => {
    const labels = {
      '1_day': '1 Gün Önce',
      '3_hours': '3 Saat Önce',
      '30_mins': '30 Dakika Önce'
    };

    const newReminder = {
      id: `rem-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      notifyBefore: reminderOption,
      notifyBeforeLabel: labels[reminderOption],
      createdAt: new Date().toISOString(),
      isActive: true
    };

    onAddReminder(newReminder);
    notificationService.playChime('success');
    notificationService.sendBrowserNotification(`⏰ Hatırlatıcı Kuruldu: ${event.title}`, {
      body: `Etkinlik zamanı: ${event.date} ${event.time} - ${event.locationName}`
    });
    setReminderSaved(true);
    setTimeout(() => setReminderSaved(false), 3000);
  };

  const handleSendReport = (e) => {
    e.preventDefault();
    const report = {
      eventId: event.id,
      eventTitle: event.title,
      reason: reportReason,
      notes: reportNotes,
      reportedDate: new Date().toLocaleDateString('tr-TR')
    };

    if (onReportEvent) {
      onReportEvent(report);
    }
    setReportSubmitted(true);
    notificationService.playChime('warning');
    setTimeout(() => {
      setIsReportingOpen(false);
      setReportSubmitted(false);
    }, 2500);
  };

  const formattedDate = new Date(event.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="event-detail-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-drag-handle" />
        
        <button className="drawer-close-btn" onClick={onClose} aria-label="Kapat">
          <X size={20} />
        </button>

        <div className="detail-cover-wrapper">
          <img src={event.image} alt={event.title} className="detail-cover-img" />
        </div>

        <div className="detail-body">
          {/* Countdown banner */}
          <div className="detail-countdown-banner">
            <span className="countdown-label">⏳ Başlamasına Kalan Süre:</span>
            <span className="countdown-digits">{timeLeft}</span>
          </div>

          <h2 className="detail-title">{event.title}</h2>

          {/* Quick Info Grid */}
          <div className="detail-grid-cards">
            <div className="detail-info-box">
              <div className="info-box-label">
                <Calendar size={13} />
                <span>Tarih & Gün</span>
              </div>
              <div className="info-box-value">{formattedDate}</div>
            </div>

            <div className="detail-info-box">
              <div className="info-box-label">
                <Clock size={13} />
                <span>Saat Aralığı</span>
              </div>
              <div className="info-box-value">{event.time}</div>
            </div>

            <div className="detail-info-box">
              <div className="info-box-label">
                <MapPin size={13} />
                <span>Bölge & Konum</span>
              </div>
              <div className="info-box-value">📍 {event.town}</div>
            </div>

            <div className="detail-info-box">
              <div className="info-box-label">
                <Ticket size={13} />
                <span>Katılım Ücreti</span>
              </div>
              <div className="info-box-value" style={{ color: event.isFree ? '#06d6a0' : '#ffab40' }}>
                {event.isFree ? "Ücretsiz" : event.priceLabel}
              </div>
            </div>
          </div>

          {/* Location detail */}
          <div className="detail-description-section">
            <div className="section-label">Açık Adres & Konum</div>
            <p className="detail-description-text" style={{ fontWeight: 600, color: '#fff' }}>
              {event.locationName}
            </p>
          </div>

          {/* Description */}
          <div className="detail-description-section">
            <div className="section-label">Etkinlik Hakkında</div>
            <p className="detail-description-text">{event.description}</p>

            {event.highlights && event.highlights.length > 0 && (
              <div className="highlights-pill-group">
                {event.highlights.map((item, idx) => (
                  <span key={idx} className="highlight-pill">
                    ✨ {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Verification & Trust Badge Section */}
          <div className="detail-description-section">
            <div className="section-label">Doğrulama & Güvenilirlik Derecesi</div>
            <div style={{
              background: trustData.trustScore >= 80 ? 'rgba(6, 214, 160, 0.1)' : 'rgba(255, 209, 102, 0.1)',
              border: `1px solid ${trustData.trustScore >= 80 ? 'rgba(6, 214, 160, 0.3)' : 'rgba(255, 209, 102, 0.3)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={20} color={trustData.badgeColor} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: trustData.badgeColor }}>
                      {event.verificationBadge || trustData.badgeText}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      Güven Skoru: <strong>%{trustData.trustScore}</strong> | Kaynak: {event.sourceName || trustData.domainInfo.domain}
                    </div>
                  </div>
                </div>

                {event.sourceUrl && (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#ffd166',
                      fontSize: 11,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontWeight: 700,
                      background: 'rgba(255, 209, 102, 0.15)',
                      padding: '5px 9px',
                      borderRadius: 8,
                      border: '1px solid rgba(255, 209, 102, 0.3)'
                    }}
                  >
                    <span>Resmi Kaynak</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Reasons list */}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 6 }}>
                {trustData.reasons.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ color: trustData.badgeColor }}>•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Organizer details */}
          <div className="detail-description-section">
            <div className="section-label">Düzenleyen Kurum / Organizatör</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div>
                <strong>Organizatör:</strong> {event.organizer}
              </div>
              {event.organizerContact && (
                <div>
                  <strong>İletişim:</strong> <a href={`tel:${event.organizerContact}`} style={{ color: '#ffab40' }}>{event.organizerContact}</a>
                </div>
              )}
              {event.organizerInstagram && (
                <div>
                  <strong>Instagram:</strong> <a href={`https://instagram.com/${event.organizerInstagram}`} target="_blank" rel="noreferrer" style={{ color: '#e1306c', textDecoration: 'none' }}>@{event.organizerInstagram}</a>
                </div>
              )}
            </div>
          </div>

          {/* Reminder Setup Box */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: 16,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginTop: 16
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Bell size={16} color="var(--primary)" />
              <span>Etkinlik Hatırlatıcısı Kur</span>
            </div>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[
                { id: '1_day', label: '1 Gün Önce' },
                { id: '3_hours', label: '3 Saat Önce' },
                { id: '30_mins', label: '30 Dk Önce' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setReminderOption(opt.id)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    border: reminderOption === opt.id ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                    background: reminderOption === opt.id ? 'rgba(255,110,64,0.2)' : 'var(--bg-surface)',
                    color: reminderOption === opt.id ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', padding: '10px 14px' }}
              onClick={handleCreateReminder}
            >
              {reminderSaved ? <><Check size={16} /> Hatırlatıcı Kaydedildi!</> : <><Bell size={16} /> Hatırlatıcı Ekle</>}
            </button>
          </div>

          {/* Report Event Panel / Trigger */}
          <div style={{ marginTop: 16 }}>
            {!isReportingOpen ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsReportingOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f72585',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    cursor: 'pointer',
                    padding: '6px 0'
                  }}
                >
                  <Flag size={13} />
                  <span>Bu etkinlik gerçek değil mi? Sahte veya hatalı etkinlik bildir</span>
                </button>

                {/* If custom event, allow immediate delete */}
                {(event.isCustom || event.id.startsWith('custom-evt-')) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteCustomEvent) onDeleteCustomEvent(event.id);
                      onClose();
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#ef4444',
                      borderRadius: 6,
                      fontSize: 11,
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Etkinliği Sil</span>
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSendReport} style={{
                background: 'rgba(247, 37, 133, 0.1)',
                border: '1px solid rgba(247, 37, 133, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: 12,
                marginTop: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f72585', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <ShieldAlert size={15} />
                    <span>Hatalı / Sahte Etkinlik Bildirimi</span>
                  </div>
                  <button type="button" onClick={() => setIsReportingOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>

                {reportSubmitted ? (
                  <div style={{ color: '#06d6a0', fontSize: 12, textAlign: 'center', padding: '10px 0' }}>
                    ✓ Bildiriminiz alındı! Moderatörlerimiz etkinliği inceleyecektir.
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Bildirim Nedeni:</label>
                      <select
                        className="search-input"
                        style={{ padding: '6px 10px', fontSize: 11 }}
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                      >
                        <option value="fake">🚫 Böyle bir etkinlik gerçekte yok (Sahte Veri)</option>
                        <option value="cancelled">🛑 Etkinlik iptal edildi veya ertelendi</option>
                        <option value="wrong_date">📅 Tarih / Saat bilgisi hatalı</option>
                        <option value="wrong_location">📍 Konum / Mekan bilgisi yanlış</option>
                        <option value="other">💬 Diğer</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <input
                        type="text"
                        className="search-input"
                        style={{ padding: '6px 10px', fontSize: 11 }}
                        placeholder="Ek açıklama (isteğe bağlı)..."
                        value={reportNotes}
                        onChange={(e) => setReportNotes(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '6px 10px', fontSize: 11, flex: 1 }}
                        onClick={() => setIsReportingOpen(false)}
                      >
                        Vazgeç
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '6px 10px', fontSize: 11, flex: 2, background: '#f72585', borderColor: '#f72585' }}
                      >
                        Raporu Gönder
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>

          {/* Action Buttons Stack */}
          <div className="action-buttons-stack" style={{ marginTop: 20 }}>
            {/* Direct Source Webpage Button */}
            {event.sourceUrl && (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{
                  textDecoration: 'none',
                  background: 'linear-gradient(135deg, rgba(255, 209, 102, 0.15), rgba(255, 110, 64, 0.15))',
                  borderColor: 'rgba(255, 209, 102, 0.4)',
                  color: '#ffd166',
                  fontWeight: 700
                }}
              >
                <Globe size={16} />
                <span>Kaynak Web Sayfasına Git ({event.sourceName || 'Orijinal Sayfa'})</span>
                <ExternalLink size={14} />
              </a>
            )}

            {/* Ticket button if paid */}
            {!event.isFree && event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <Ticket size={16} />
                <span>Bilet Al ({event.priceLabel})</span>
                <ExternalLink size={14} />
              </a>
            )}

            {/* Favorite toggle */}
            <button
              className={`btn-secondary ${isFavorite ? 'active' : ''}`}
              onClick={() => onToggleFavorite(event.id)}
            >
              <Heart size={16} fill={isFavorite ? "var(--accent-rose)" : "none"} color={isFavorite ? "var(--accent-rose)" : "currentColor"} />
              <span>{isFavorite ? "Favorilerimden Çıkar" : "Favorilerime Ekle"}</span>
            </button>

            {/* Google Calendar & .ics download */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                className="btn-secondary"
                onClick={() => downloadIcsCalendar(event)}
                title="Apple & Telefon Takvimine Ekle"
              >
                <Download size={15} />
                <span>Takvime Kaydet (.ics)</span>
              </button>

              <a
                href={getGoogleCalendarUrl(event)}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                <Calendar size={15} />
                <span>Google Takvim</span>
              </a>
            </div>

            {/* Map Locator */}
            <button
              className="btn-secondary"
              onClick={() => {
                onClose();
                onNavigateToMap(event);
              }}
            >
              <Compass size={16} />
              <span>Kapadokya Haritasında Göster</span>
            </button>

            {/* Share */}
            <button
              className="btn-secondary"
              onClick={() => onShare(event)}
            >
              <Share2 size={16} />
              <span>Etkinliği Paylaş</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

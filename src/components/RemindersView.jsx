import React from 'react';
import { Bell, BellOff, Volume2, Trash2, Calendar, Clock, CheckCircle } from 'lucide-react';
import { notificationService } from '../services/notification';

export default function RemindersView({
  reminders,
  onRemoveReminder,
  onTriggerTestAlarm,
  onSelectEventById
}) {
  const handleTestSound = () => {
    notificationService.playChime('alarm');
    notificationService.sendBrowserNotification("🎈 Kapadokya Etkinlik Hatırlatması", {
      body: "Test Alarmı: Kapadokya Balon Festivali için 1 saat kaldı!"
    });
    if (onTriggerTestAlarm) {
      onTriggerTestAlarm();
    }
  };

  return (
    <div className="subpage-container">
      <div className="subpage-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="subpage-title">⏰ Etkinlik Hatırlatıcıları</h2>
            <div className="subpage-subtitle">
              {reminders.length} aktif etkinlik alarmı ve bildirim
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ padding: '8px 12px', fontSize: 11 }}
            onClick={handleTestSound}
            title="Sesi ve Bildirimi Test Et"
          >
            <Volume2 size={14} />
            <span>Test Sesi Çal</span>
          </button>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="empty-state-box">
          <div className="empty-state-icon">🔔✨</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
            Kayıtlı hatırlatıcı bulunmuyor
          </h3>
          <p className="empty-state-text">
            Kaçırmak istemediğiniz etkinliklerin detay sayfasından veya kartından hatırlatıcı kurabilirsiniz.
          </p>
        </div>
      ) : (
        <div>
          {reminders.map((rem) => (
            <div key={rem.id} className="reminder-card is-active">
              <div
                className="reminder-info"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectEventById(rem.eventId)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    background: 'rgba(255,110,64,0.15)',
                    padding: '2px 8px',
                    borderRadius: 12
                  }}>
                    🔔 {rem.notifyBeforeLabel || "1 Gün Önce"}
                  </span>
                  <span style={{ fontSize: 10, color: '#06d6a0', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle size={10} /> Aktif
                  </span>
                </div>

                <div className="reminder-title">{rem.eventTitle}</div>

                <div className="reminder-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Calendar size={12} /> {rem.eventDate}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={12} /> {rem.eventTime}
                  </span>
                </div>
              </div>

              <div>
                <button
                  className="header-icon-btn"
                  onClick={() => onRemoveReminder(rem.id)}
                  title="Hatırlatıcıyı Sil"
                  style={{ color: '#f72585' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

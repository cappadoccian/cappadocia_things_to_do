import React, { useState } from 'react';
import { DATA_SOURCES, DATA_SOURCE_CATEGORIES, withRuntimeStatus } from '../data/sources';
import {
  RefreshCw, PlusCircle, CheckCircle, Terminal, Globe, Camera, Radio,
  Play, ExternalLink, Filter, ShieldCheck, ShieldAlert, Trash2, Check, X, AlertTriangle
} from 'lucide-react';
import { notificationService } from '../services/notification';
import { evaluateEventTrust } from '../services/verification';

export default function ScraperDashboard({
  onAddNewEvent,
  scrapedMeta,
  onRefreshScrapedData,
  customEvents = [],
  reports = [],
  onApproveEvent,
  onRejectEvent,
  onDeleteEvent,
  onClearAllCustomEvents,
  onDeleteReport
}) {
  const [activeTab, setActiveTab] = useState('sources'); // 'sources' | 'moderation' | 'reports'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSourceCategory, setSelectedSourceCategory] = useState('all');

  const sourcesWithRuntimeStatus = withRuntimeStatus(DATA_SOURCES, scrapedMeta);
  const activeSourceCount = sourcesWithRuntimeStatus.filter(s => s.status === 'Aktif').length;

  const logs = scrapedMeta
    ? [
        `✅ Son senkronizasyon: ${new Date(scrapedMeta.lastRunAt).toLocaleString('tr-TR')}`,
        `📡 Toplam ${scrapedMeta.totalEvents} etkinlik, ${scrapedMeta.sources.length} aktif kaynaktan çekildi.`,
        ...scrapedMeta.sources.map(s =>
          s.status === 'ok'
            ? `🟢 [${s.name}] ${s.itemsCount} etkinlik başarıyla çekildi.`
            : `🔴 [${s.name}] Hata: ${s.error}`
        ),
      ]
    : [
        "⏳ Henüz senkronizasyon verisi yok.",
        "GitHub Actions üzerinde zamanlanan scraper ilk kez çalıştığında (veya `python -m scraper.run_scrapers` yerel çalıştırıldığında) burada gerçek sonuçlar görünecek.",
      ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    notificationService.playChime('favorite');
    Promise.resolve(onRefreshScrapedData && onRefreshScrapedData()).finally(() => {
      setTimeout(() => {
        setIsRefreshing(false);
        notificationService.playChime('success');
      }, 400);
    });
  };

  const filteredSources = selectedSourceCategory === 'all'
    ? sourcesWithRuntimeStatus
    : sourcesWithRuntimeStatus.filter(s => s.category === selectedSourceCategory);

  const pendingEvents = customEvents.filter(e => e.status === 'pending');

  return (
    <div className="subpage-container">
      <div className="subpage-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="subpage-title">🤖 Veri Yönetimi & Doğrulama</h2>
            <div className="subpage-subtitle">
              Resmi kaynaklar, otomatik botlar ve sahte etkinlik önleme merkezi
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ padding: '8px 12px', fontSize: 11 }}
            onClick={onAddNewEvent}
          >
            <PlusCircle size={14} />
            <span>Etkinlik Ekle</span>
          </button>
        </div>

        {/* Sub Navigation */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
          <button
            className={`quick-pill-btn ${activeTab === 'sources' ? 'active' : ''}`}
            onClick={() => setActiveTab('sources')}
            style={{ fontSize: 11, padding: '6px 12px' }}
          >
            <Globe size={13} />
            <span>Resmi Kaynaklar ({activeSourceCount}/{DATA_SOURCES.length} Aktif)</span>
          </button>

          <button
            className={`quick-pill-btn ${activeTab === 'moderation' ? 'active' : ''}`}
            onClick={() => setActiveTab('moderation')}
            style={{ fontSize: 11, padding: '6px 12px' }}
          >
            <ShieldCheck size={13} />
            <span>Moderasyon Havuzu ({customEvents.length})</span>
          </button>

          <button
            className={`quick-pill-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
            style={{ fontSize: 11, padding: '6px 12px' }}
          >
            <ShieldAlert size={13} />
            <span>Raporlar ({reports.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'sources' && (
        <>
          {/* Action Card */}
          <div className="scraper-dashboard-card" style={{ background: 'linear-gradient(135deg, rgba(34,26,51,0.95), rgba(18,12,28,0.95))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Otomatik Resmi Veri Senkronizasyonu</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {activeSourceCount} aktif kaynak · zamanlanmış GitHub Actions botu tarafından periyodik olarak taranır
                </div>
              </div>

              <button
                className="btn-primary"
                style={{ padding: '10px 14px', fontSize: 12 }}
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Bot arka planda zamanlı çalışır; bu düğme sadece en son yayınlanan sonucu yeniden çeker"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? 'Yenileniyor...' : 'Son Veriyi Yenile'}</span>
              </button>
            </div>

            {/* Live Terminal Log */}
            <div style={{ fontSize: 11, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Terminal size={13} />
              <span>Canlı Bot & Güvenlik Konsolu</span>
            </div>
            <div className="terminal-log-window">
              {logs.map((log, idx) => (
                <div key={idx} className="terminal-line" style={{ color: log.includes('🛡️') ? '#4cc9f0' : log.includes('✅') ? '#06d6a0' : '#e2e8f0' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Sources Category Filter */}
          <div className="quick-filter-pills" style={{ marginBottom: 12 }}>
            {DATA_SOURCE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`quick-pill-btn ${selectedSourceCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedSourceCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Data Sources List */}
          <div className="sources-grid">
            {filteredSources.map((src) => (
              <div key={src.id} className="source-item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {src.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{src.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{src.type}</div>
                    </div>
                  </div>

                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--secondary)', padding: 4 }}
                    title="Siteye Git"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '8px 0', lineHeight: 1.4 }}>
                  {src.description}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: 'var(--text-muted)', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    color: src.status === 'Aktif' ? '#06d6a0' : src.status === 'Hata' ? '#ef4444' : 'var(--text-muted)'
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: src.status === 'Aktif' ? '#06d6a0' : src.status === 'Hata' ? '#ef4444' : 'var(--text-muted)'
                    }} />
                    {src.status === 'Aktif' ? 'Bağlı Kaynak' : src.status}
                  </span>
                  <span>{src.itemsCount != null ? `${src.itemsCount} Aktif Kayıt` : '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Moderation Controls Header */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: 14,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Kullanıcı & Test Etkinlikleri Yönetimi</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {customEvents.length} adet harici/kullanıcı etkinliği kayıtlı
              </div>
            </div>

            {customEvents.length > 0 && (
              <button
                className="btn-secondary"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#ef4444',
                  fontSize: 11,
                  padding: '6px 12px'
                }}
                onClick={() => {
                  if (onClearAllCustomEvents) onClearAllCustomEvents();
                }}
              >
                <Trash2 size={13} />
                <span>Tüm Test/Özel Verileri Temizle</span>
              </button>
            )}
          </div>

          {customEvents.length === 0 ? (
            <div className="empty-state-box" style={{ margin: '20px 0' }}>
              <ShieldCheck size={36} color="#06d6a0" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ color: '#fff', fontSize: 14 }}>Harici / Test Etkinliği Bulunmuyor</h4>
              <p className="empty-state-text">
                Tüm etkinlikler %100 resmi kurum ve belediye veri tabanından gelmektedir. Sahte veya kontrolsüz veri bulunmamaktadır.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customEvents.map((evt) => {
                const trust = evaluateEventTrust(evt);
                return (
                  <div
                    key={evt.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 16 }}>{evt.categoryIcon}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{evt.title}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          📍 {evt.town} ({evt.locationName}) | 📅 {evt.date} {evt.time}
                        </div>
                      </div>

                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 12,
                        background: trust.trustScore >= 80 ? 'rgba(6, 214, 160, 0.2)' : 'rgba(255, 209, 102, 0.2)',
                        color: trust.badgeColor
                      }}>
                        Güven: %{trust.trustScore}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 6 }}>
                      <div><strong>Kaynak URL:</strong> {evt.sourceUrl || 'Belirtilmedi'}</div>
                      <div><strong>Organizatör:</strong> {evt.organizer} ({evt.organizerContact})</div>
                      <div style={{ color: trust.badgeColor, marginTop: 4 }}>
                        Durum: <strong>{evt.status === 'approved' ? '✓ Onaylı (Yayında)' : '⏳ İncelemede (Onay Bekliyor)'}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                      {evt.status !== 'approved' && (
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: 11, background: '#06d6a0', borderColor: '#06d6a0' }}
                          onClick={() => onApproveEvent && onApproveEvent(evt.id)}
                        >
                          <Check size={13} />
                          <span>Onayla ve Yayınla</span>
                        </button>
                      )}

                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: 11, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                        onClick={() => {
                          if (onDeleteEvent) onDeleteEvent(evt.id);
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Sil / Reddet</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: 14,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Kullanıcı Sahte & Hatalı Etkinlik Bildirimleri</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Topluluk tarafından iletilen şüpheli veya var olmayan etkinlik şikayetleri
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="empty-state-box" style={{ margin: '20px 0' }}>
              <CheckCircle size={36} color="#06d6a0" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ color: '#fff', fontSize: 14 }}>Şu Anda Aktif Rapor Bulunmuyor</h4>
              <p className="empty-state-text">
                Kullanıcılar tarafından bildirilmiş sahte veya hatalı etkinlik kaydı bulunmamaktadır.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    background: 'rgba(247, 37, 133, 0.08)',
                    border: '1px solid rgba(247, 37, 133, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                      {rep.eventTitle}
                    </div>
                    <div style={{ fontSize: 11, color: '#f72585', marginTop: 2 }}>
                      Neden: {rep.reason === 'fake' ? '🚫 Sahte / Gerçekte Yok' : rep.reason === 'cancelled' ? '🛑 İptal Edildi' : '⚠️ Hatalı Bilgi'}
                    </div>
                    {rep.notes && (
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                        Açıklama: "{rep.notes}" ({rep.reportedDate})
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: 11, color: '#ef4444' }}
                      onClick={() => {
                        if (onDeleteEvent) onDeleteEvent(rep.eventId);
                        if (onDeleteReport) onDeleteReport(rep.id);
                      }}
                      title="Etkinliği Sil"
                    >
                      <Trash2 size={13} />
                      <span>Etkinliği Kaldır</span>
                    </button>

                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 8px', fontSize: 11 }}
                      onClick={() => onDeleteReport && onDeleteReport(rep.id)}
                      title="Raporu Kapat"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

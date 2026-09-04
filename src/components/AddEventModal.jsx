import React, { useState, useMemo } from 'react';
import { X, Plus, Image as ImageIcon, MapPin, Calendar, Clock, DollarSign, ShieldCheck, AlertTriangle, Globe, CheckCircle } from 'lucide-react';
import { TOWNS, CATEGORIES } from '../data/events';
import { notificationService } from '../services/notification';
import { checkDomainTrust, evaluateEventTrust } from '../services/verification';

export default function AddEventModal({ onClose, onAddEvent }) {
  const [title, setTitle] = useState('');
  const [town, setTown] = useState('Göreme');
  const [locationName, setLocationName] = useState('');
  const [category, setCategory] = useState('konser');
  const [date, setDate] = useState('2026-09-06');
  const [time, setTime] = useState('19:00 - 22:00');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('0');
  const [organizer, setOrganizer] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('/images/balloons.jpg');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const townCoordinates = {
    'Göreme': [38.6431, 34.8289],
    'Ürgüp': [38.6322, 34.9125],
    'Avanos': [38.7183, 34.8465],
    'Uçhisar': [38.6300, 34.8055],
    'Ortahisar': [38.6210, 34.8640],
    'Çavuşin': [38.6575, 34.8488],
    'Ihlara': [38.2541, 34.2982],
    'Nevşehir Merkez': [38.6244, 34.7144]
  };

  const categoryIcons = {
    balon: '🎈',
    konser: '🎵',
    atolye: '🏺',
    gastronomi: '🍷',
    doga: '🥾',
    kultur: '🏛️'
  };

  // Real-time domain verification preview
  const domainTrust = useMemo(() => {
    return checkDomainTrust(sourceUrl);
  }, [sourceUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !locationName) {
      alert('Lütfen etkinlik başlığını ve konumunu giriniz.');
      return;
    }

    // Temporary draft event for trust evaluation
    const draftEvent = {
      title,
      town,
      locationName,
      coordinates: townCoordinates[town] || [38.6431, 34.8289],
      organizer: organizer || 'Kapadokya Yerel Organizatör',
      organizerContact: organizerContact || '',
      sourceName: sourceName || domainTrust.label,
      sourceUrl: sourceUrl.trim()
    };

    const trustResult = evaluateEventTrust(draftEvent);

    const newEvent = {
      id: `custom-evt-${Date.now()}`,
      title,
      category,
      categoryName: CATEGORIES.find(c => c.id === category)?.name || 'Etkinlik',
      categoryIcon: categoryIcons[category] || '🎈',
      town,
      locationName,
      coordinates: townCoordinates[town] || [38.6431, 34.8289],
      date,
      time,
      price: isFree ? 0 : parseFloat(price) || 0,
      isFree,
      priceLabel: isFree ? 'Ücretsiz' : `${price} ₺`,
      organizer: organizer || 'Kapadokya Yerel Organizatör',
      organizerContact: organizerContact || '+90 384 000 00 00',
      organizerInstagram: 'kapadokya',
      image: image || '/images/balloons.jpg',
      description: description || 'Kapadokya bölgesinde düzenlenen yerel etkinlik.',
      highlights: ['Yerel Katılım', 'Rehberli', 'Fotoğraf Alanı'],
      sourceName: sourceName || domainTrust.label,
      sourceUrl: sourceUrl.trim(),
      trustScore: trustResult.trustScore,
      verificationLevel: trustResult.verificationLevel,
      verificationBadge: trustResult.badgeText,
      verificationStatus: trustResult.badgeText,
      status: trustResult.status, // 'approved' if official/high trust, 'pending' if community
      isCustom: true,
      isPopular: false,
      isToday: false,
      isWeekend: true
    };

    onAddEvent(newEvent, trustResult);
    notificationService.playChime('success');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="event-detail-drawer" onClick={(e) => e.stopPropagation()} style={{ padding: 20 }}>
        <div className="drawer-drag-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>➕ Doğrulanabilir Etkinlik Ekle</h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              Gerçek ve teyit edilebilir etkinlik bilgileri giriniz
            </p>
          </div>
          <button className="header-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Security & Verification Banner */}
        <div style={{
          background: 'rgba(76, 201, 240, 0.1)',
          border: '1px solid rgba(76, 201, 240, 0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <ShieldCheck size={20} color="#4cc9f0" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4 }}>
            <strong style={{ color: '#4cc9f0' }}>Doğrulama Politikası:</strong> Resmi kurum (.gov.tr, .bel.tr) ve akredite bilet platformu bağlantısı olan etkinlikler doğrudan onaylanır; diğerleri moderasyon onayına gönderilir.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Etkinlik Başlığı *</label>
            <input
              type="text"
              className="search-input"
              style={{ padding: '10px 14px' }}
              placeholder="Örn: Paşabağları Gece Akustik Konseri"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Official Source URL */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Resmi Kaynak / Web Sayfası URL'si *
              </label>
              {sourceUrl && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: domainTrust.isOfficial ? '#06d6a0' : domainTrust.isTicketing ? '#4cc9f0' : '#ffd166',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3
                }}>
                  {domainTrust.isOfficial ? '✓ Resmi Alan Adı' : domainTrust.isTicketing ? '✓ Akredite Bilet' : '⚠️ Topluluk Bildirimi'}
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="url"
                className="search-input"
                style={{
                  padding: '10px 14px',
                  borderColor: domainTrust.isOfficial ? '#06d6a0' : domainTrust.isTicketing ? '#4cc9f0' : 'var(--border-subtle)'
                }}
                placeholder="https://cappadociaultratrail.com veya biletix/bubilet bağlantısı"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
              Alan adı: <strong style={{ color: '#fff' }}>{domainTrust.domain}</strong> ({domainTrust.label})
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Kategori</label>
              <select
                className="search-input"
                style={{ padding: '10px 14px' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="konser">🎵 Konser & Müzik</option>
                <option value="balon">🎈 Balon & Gökyüzü</option>
                <option value="gastronomi">🍷 Bağ Bozumu & Gastronomi</option>
                <option value="atolye">🏺 Sanat & Çömlek</option>
                <option value="doga">🥾 Doğa & Spor</option>
                <option value="kultur">🏛️ Tarih & Kültür</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>İlçe / Bölge</label>
              <select
                className="search-input"
                style={{ padding: '10px 14px' }}
                value={town}
                onChange={(e) => setTown(e.target.value)}
              >
                {TOWNS.filter(t => t !== 'Tümü').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Açık Konum & Mekan Adı *</label>
            <input
              type="text"
              className="search-input"
              style={{ padding: '10px 14px' }}
              placeholder="Örn: Paşabağları Ören Yeri Açık Hava Sahnesi"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Tarih</label>
              <input
                type="date"
                className="search-input"
                style={{ padding: '10px 14px' }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Saat Aralığı</label>
              <input
                type="text"
                className="search-input"
                style={{ padding: '10px 14px' }}
                placeholder="19:00 - 22:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Organizatör / Kurum</label>
              <input
                type="text"
                className="search-input"
                style={{ padding: '10px 14px' }}
                placeholder="Örn: Nevşehir Valiliği"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>İletişim Tel / E-posta</label>
              <input
                type="text"
                className="search-input"
                style={{ padding: '10px 14px' }}
                placeholder="+90 384 ..."
                value={organizerContact}
                onChange={(e) => setOrganizerContact(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#fff', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <span>Ücretsiz Katılım</span>
            </label>

            {!isFree && (
              <div>
                <input
                  type="number"
                  className="search-input"
                  style={{ padding: '8px 12px' }}
                  placeholder="Ücret (₺)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Açıklama & Detaylar</label>
            <textarea
              className="search-input"
              style={{ padding: '10px 14px', minHeight: 70, resize: 'vertical' }}
              placeholder="Etkinliğin program akışı, katılım koşulları vb..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2 }}
            >
              <Plus size={16} />
              <span>Etkinliği Kaydet ve Gönder</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import EventCard from './components/EventCard';
import EventDetailModal from './components/EventDetailModal';
import MapView from './components/MapView';
import FavoritesView from './components/FavoritesView';
import RemindersView from './components/RemindersView';
import ScraperDashboard from './components/ScraperDashboard';
import AddEventModal from './components/AddEventModal';
import BottomNav from './components/BottomNav';

import { INITIAL_EVENTS } from './data/events';
import {
  getFavorites, toggleFavorite as toggleFavStorage,
  getReminders, saveReminder, removeReminder,
  getCustomEvents, addCustomEvent, deleteCustomEvent,
  clearCustomEvents, updateCustomEventStatus,
  getReports, reportEvent as saveReportToStorage, deleteReport
} from './services/storage';
import { fetchScrapedEvents, fetchScrapedMeta, isSameEvent } from './services/eventsApi';
import { notificationService } from './services/notification';
import { evaluateEventTrust } from './services/verification';
import { Sparkles, Compass, Share2, ShieldCheck } from 'lucide-react';

export default function App() {
  // Navigation & View Modes
  const [currentTab, setCurrentTab] = useState('explore');
  const [isFrameMode, setIsFrameMode] = useState(true);

  // Custom Events, Reports & Data
  const [customEvents, setCustomEvents] = useState(getCustomEvents);
  const [reports, setReports] = useState(getReports);
  const [favorites, setFavorites] = useState(getFavorites);
  const [reminders, setReminders] = useState(getReminders);

  // Real events pulled by the scheduled scraper (see src/services/eventsApi.js)
  const [scrapedEvents, setScrapedEvents] = useState([]);
  const [scrapedMeta, setScrapedMeta] = useState(null);

  const loadScrapedData = () => {
    fetchScrapedEvents().then(setScrapedEvents);
    fetchScrapedMeta().then(setScrapedMeta);
  };

  useEffect(() => {
    loadScrapedData();
  }, []);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTown, setSelectedTown] = useState('Tümü');
  const [quickFilter, setQuickFilter] = useState('all');

  // Modals & Navigation targets
  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const [focusedMapEvent, setFocusedMapEvent] = useState(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Combine approved custom events, live-scraped events and the curated seed
  // list. A curated event is dropped when a scraped event already covers the
  // same real-world event (matched via isSameEvent — same sourceUrl, or same
  // date + overlapping title, since the same festival often appears under a
  // different URL in each source), since the scraper's data is fresher.
  const allActiveEvents = useMemo(() => {
    const approvedCustom = customEvents.filter(e => e.status === 'approved');
    const seedEvents = INITIAL_EVENTS.filter(
      seed => !scrapedEvents.some(scraped => isSameEvent(seed, scraped))
    );

    const combined = [...approvedCustom, ...scrapedEvents, ...seedEvents];
    const seenIds = new Set();
    return combined.filter(e => {
      if (seenIds.has(e.id)) return false;
      seenIds.add(e.id);
      return true;
    });
  }, [customEvents, scrapedEvents]);

  // Toggle Favorite
  const handleToggleFavorite = (eventId) => {
    const updated = toggleFavStorage(eventId);
    setFavorites(updated);
    if (updated.includes(eventId)) {
      showToast('💖 Favorilere Eklendi!');
    } else {
      showToast('Favorilerden kaldırıldı');
    }
  };

  const handleClearAllFavorites = () => {
    if (window.confirm('Tüm favori etkinlikleri temizlemek istediğinize emin misiniz?')) {
      localStorage.setItem("cappadocia_favorites_v2", JSON.stringify([]));
      setFavorites([]);
      showToast('Tüm favoriler temizlendi');
    }
  };

  // Add Reminder
  const handleAddReminder = (newReminder) => {
    const updated = saveReminder(newReminder);
    setReminders(updated);
    showToast(`⏰ "${newReminder.eventTitle.slice(0, 24)}..." için hatırlatıcı kuruldu!`);
  };

  // Remove Reminder
  const handleRemoveReminder = (id) => {
    const updated = removeReminder(id);
    setReminders(updated);
    showToast('Hatırlatıcı kaldırıldı');
  };

  // Add Custom Event with Verification Evaluation
  const handleAddCustomEvent = (newEvent, trustResult) => {
    const updated = addCustomEvent(newEvent);
    setCustomEvents(updated);

    if (trustResult.status === 'approved') {
      showToast('✨ Resmi kurum onaylı etkinlik yayınlandı!');
    } else {
      showToast('⏳ Etkinlik moderasyon havuzuna alındı (Onay bekleniyor)');
    }
  };

  // Delete Custom Event (Immediate purge of fake/test events)
  const handleDeleteCustomEvent = (eventId) => {
    const updated = deleteCustomEvent(eventId);
    setCustomEvents(updated);
    if (selectedEventForModal && selectedEventForModal.id === eventId) {
      setSelectedEventForModal(null);
    }
    showToast('🗑️ Etkinlik başarıyla silindi ve yayından kaldırıldı');
  };

  // Clear All Custom Events (Clean test data)
  const handleClearAllCustomEvents = () => {
    const updated = clearCustomEvents();
    setCustomEvents(updated);
    showToast('🧹 Tüm test ve sahte etkinlikler temizlendi!');
  };

  // Approve Event from Moderation
  const handleApproveEvent = (eventId) => {
    const updated = updateCustomEventStatus(eventId, 'approved');
    setCustomEvents(updated);
    showToast('✅ Etkinlik onaylandı ve ana akışta yayınlandı!');
  };

  // Report Event (Fake / cancelled / wrong information)
  const handleReportEvent = (report) => {
    const updated = saveReportToStorage(report);
    setReports(updated);
    showToast('🛡️ Bildiriminiz için teşekkürler! Moderasyon ekibimiz inceleyecektir.');
  };

  // Delete Report
  const handleDeleteReport = (reportId) => {
    const updated = deleteReport(reportId);
    setReports(updated);
  };

  // Switch to Map and focus on a specific event
  const handleNavigateToMap = (event) => {
    setFocusedMapEvent(event);
    setCurrentTab('map');
  };

  // Quick reminder from card
  const handleQuickReminder = (event) => {
    const defaultReminder = {
      id: `rem-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      notifyBefore: '1_day',
      notifyBeforeLabel: '1 Gün Önce',
      createdAt: new Date().toISOString(),
      isActive: true
    };
    handleAddReminder(defaultReminder);
    notificationService.playChime('success');
  };

  // Share Event
  const handleShare = (event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Kapadokya'da bu etkinliğe katılmalısın: ${event.title} (${event.date} - ${event.town})`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${event.title} - ${event.date} - Kapadokya Etkinlik Rehberi`);
      showToast('📋 Etkinlik bağlantısı panoya kopyalandı!');
      notificationService.playChime('success');
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allActiveEvents.filter(evt => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchDesc = evt.description?.toLowerCase().includes(q);
        const matchTown = evt.town.toLowerCase().includes(q);
        const matchOrg = evt.organizer.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTown && !matchOrg) return false;
      }

      // Category
      if (selectedCategory !== 'all' && evt.category !== selectedCategory) {
        return false;
      }

      // Town
      if (selectedTown !== 'Tümü' && evt.town !== selectedTown) {
        return false;
      }

      // Quick Filter
      if (quickFilter === 'verified') {
        const trust = evaluateEventTrust(evt);
        if (trust.verificationLevel !== 'OFFICIAL' && trust.verificationLevel !== 'VERIFIED_ORG') {
          return false;
        }
      }
      if (quickFilter === 'today' && !evt.isToday) return false;
      if (quickFilter === 'weekend' && !evt.isWeekend) return false;
      if (quickFilter === 'free' && !evt.isFree) return false;
      if (quickFilter === 'popular' && !evt.isPopular) return false;

      return true;
    });
  }, [allActiveEvents, searchQuery, selectedCategory, selectedTown, quickFilter]);

  // Featured Event for Hero Banner
  const featuredEvent = useMemo(() => {
    return allActiveEvents.find(e => e.isPopular) || allActiveEvents[0];
  }, [allActiveEvents]);

  return (
    <div className={`app-viewport-wrapper ${isFrameMode ? 'is-frame-mode' : ''}`}>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-container">
          <Sparkles size={16} color="#ffd166" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Container / Mockup Frame */}
      <div className="mobile-device-frame">
        {/* Notch / Dynamic Island for realistic phone frame */}
        {isFrameMode && (
          <div className="device-notch">
            <div className="sensor-dot" />
            <div className="camera-lens" />
          </div>
        )}

        {/* Status bar */}
        <div className="device-status-bar">
          <span>09:41</span>
          <span style={{ fontSize: 11, letterSpacing: 1 }}>5G 􀙇 100%</span>
        </div>

        {/* Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFrameMode={isFrameMode}
          setIsFrameMode={setIsFrameMode}
          unreadRemindersCount={reminders.length}
          onOpenReminders={() => setCurrentTab('reminders')}
        />

        {/* Scrollable Body Content */}
        <main className="app-screen-container">
          {currentTab === 'explore' && (
            <>
              {/* Featured Banner */}
              {!searchQuery && selectedCategory === 'all' && selectedTown === 'Tümü' && quickFilter === 'all' && (
                <div
                  className="hero-banner-card"
                  onClick={() => setSelectedEventForModal(featuredEvent)}
                >
                  <img src={featuredEvent.image} alt={featuredEvent.title} className="hero-image" />
                  <div className="hero-gradient-overlay">
                    <div className="hero-tag">
                      <Sparkles size={12} />
                      <span>Haftanın Öne Çıkanı</span>
                    </div>

                    <div className="hero-content">
                      <h2 className="hero-title">{featuredEvent.title}</h2>
                      <div className="hero-meta">
                        <span className="hero-meta-item">📍 {featuredEvent.town}</span>
                        <span className="hero-meta-item">🗓️ {featuredEvent.date}</span>
                        <span className="hero-meta-item" style={{ color: '#06d6a0' }}>
                          {featuredEvent.isFree ? 'Ücretsiz' : featuredEvent.priceLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <FilterBar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedTown={selectedTown}
                setSelectedTown={setSelectedTown}
                quickFilter={quickFilter}
                setQuickFilter={setQuickFilter}
              />

              {/* Events Feed Header */}
              <div className="events-feed-header">
                <h3 className="feed-title">
                  {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Kapadokya Etkinlikleri'}
                </h3>
                <span className="feed-count">{filteredEvents.length} Doğrulanmış Etkinlik</span>
              </div>

              {/* Events Feed List */}
              {filteredEvents.length === 0 ? (
                <div className="empty-state-box" style={{ margin: '0 20px' }}>
                  <div className="empty-state-icon">🔍🎈</div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    Aradığınız kriterlere uygun etkinlik bulunamadı
                  </h4>
                  <p className="empty-state-text">
                    Filtreleri temizleyebilir veya veri toplayıcı botu çalıştırarak yeni etkinlikleri çekebilirsiniz.
                  </p>
                  <button
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: 12 }}
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedTown('Tümü');
                      setQuickFilter('all');
                    }}
                  >
                    Filtreleri Sıfırla
                  </button>
                </div>
              ) : (
                <div className="events-list">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isFavorite={favorites.includes(event.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectEvent={setSelectedEventForModal}
                      onQuickReminder={handleQuickReminder}
                      onShare={handleShare}
                      onDeleteCustomEvent={handleDeleteCustomEvent}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {currentTab === 'map' && (
            <MapView
              events={allActiveEvents}
              selectedTown={selectedTown}
              setSelectedTown={setSelectedTown}
              onSelectEvent={setSelectedEventForModal}
              focusedEvent={focusedMapEvent}
            />
          )}

          {currentTab === 'favorites' && (
            <FavoritesView
              events={allActiveEvents}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectEvent={setSelectedEventForModal}
              onQuickReminder={handleQuickReminder}
              onShare={handleShare}
              onClearAllFavorites={handleClearAllFavorites}
            />
          )}

          {currentTab === 'reminders' && (
            <RemindersView
              reminders={reminders}
              onRemoveReminder={handleRemoveReminder}
              onTriggerTestAlarm={() => showToast('🔔 Test Alarmı Çalıyor!')}
              onSelectEventById={(id) => {
                const target = allActiveEvents.find(e => e.id === id);
                if (target) setSelectedEventForModal(target);
              }}
            />
          )}

          {currentTab === 'scraper' && (
            <ScraperDashboard
              onAddNewEvent={() => setIsAddEventOpen(true)}
              scrapedMeta={scrapedMeta}
              onRefreshScrapedData={() => {
                loadScrapedData();
                showToast('🔄 Son yayınlanan veri yeniden çekildi');
              }}
              customEvents={customEvents}
              reports={reports}
              onApproveEvent={handleApproveEvent}
              onRejectEvent={handleDeleteCustomEvent}
              onDeleteEvent={handleDeleteCustomEvent}
              onClearAllCustomEvents={handleClearAllCustomEvents}
              onDeleteReport={handleDeleteReport}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          favoritesCount={favorites.length}
          remindersCount={reminders.length}
        />

        {/* Detail Modal */}
        {selectedEventForModal && (
          <EventDetailModal
            event={selectedEventForModal}
            onClose={() => setSelectedEventForModal(null)}
            isFavorite={favorites.includes(selectedEventForModal.id)}
            onToggleFavorite={handleToggleFavorite}
            onAddReminder={handleAddReminder}
            onNavigateToMap={handleNavigateToMap}
            onShare={handleShare}
            onDeleteCustomEvent={handleDeleteCustomEvent}
            onReportEvent={handleReportEvent}
          />
        )}

        {/* Add Event Modal */}
        {isAddEventOpen && (
          <AddEventModal
            onClose={() => setIsAddEventOpen(false)}
            onAddEvent={handleAddCustomEvent}
          />
        )}
      </div>
    </div>
  );
}

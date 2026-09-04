import React from 'react';
import { Compass, Map, Heart, Bell, Bot } from 'lucide-react';

export default function BottomNav({
  currentTab,
  setCurrentTab,
  favoritesCount,
  remindersCount
}) {
  const tabs = [
    { id: 'explore', label: 'Keşfet', icon: <Compass size={20} /> },
    { id: 'map', label: 'Harita', icon: <Map size={20} /> },
    {
      id: 'favorites',
      label: 'Favoriler',
      icon: <Heart size={20} />,
      badge: favoritesCount > 0 ? favoritesCount : null
    },
    {
      id: 'reminders',
      label: 'Hatırlatıcı',
      icon: <Bell size={20} />,
      badge: remindersCount > 0 ? remindersCount : null
    },
    { id: 'scraper', label: 'Veri & Bot', icon: <Bot size={20} /> }
  ];

  return (
    <nav className="bottom-nav-bar" aria-label="Alt Menü">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${currentTab === tab.id ? 'active' : ''}`}
          onClick={() => setCurrentTab(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge && <span className="nav-badge-dot" />}
        </button>
      ))}
    </nav>
  );
}

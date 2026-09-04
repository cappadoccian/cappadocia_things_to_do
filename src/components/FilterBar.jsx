import React from 'react';
import { CATEGORIES, TOWNS } from '../data/events';
import { Sparkles, Calendar, Sun, DollarSign, Flame, ShieldCheck } from 'lucide-react';

export default function FilterBar({
  selectedCategory,
  setSelectedCategory,
  selectedTown,
  setSelectedTown,
  quickFilter,
  setQuickFilter
}) {
  const quickFilters = [
    { id: 'all', label: 'Tümü', icon: <Sparkles size={13} /> },
    { id: 'verified', label: '🛡️ Sadece Doğrulanmış', icon: <ShieldCheck size={13} /> },
    { id: 'today', label: 'Bugün', icon: <Sun size={13} /> },
    { id: 'weekend', label: 'Hafta Sonu', icon: <Calendar size={13} /> },
    { id: 'free', label: 'Ücretsiz', icon: <DollarSign size={13} /> },
    { id: 'popular', label: 'Öne Çıkanlar', icon: <Flame size={13} /> },
  ];

  return (
    <div className="filter-section">
      {/* Quick Filter Buttons */}
      <div className="quick-filter-pills">
        {quickFilters.map((qf) => (
          <button
            key={qf.id}
            className={`quick-pill-btn ${quickFilter === qf.id ? 'active' : ''}`}
            onClick={() => setQuickFilter(qf.id)}
          >
            {qf.icon}
            {qf.label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="quick-filter-pills" style={{ marginBottom: 10 }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`quick-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Town Filter Badges */}
      <div className="town-filter-row">
        {TOWNS.map((town) => (
          <button
            key={town}
            className={`town-pill ${selectedTown === town ? 'active' : ''}`}
            onClick={() => setSelectedTown(town)}
          >
            📍 {town}
          </button>
        ))}
      </div>
    </div>
  );
}

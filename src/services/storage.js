// Local Storage Service for Cappadocia Events App with Moderation & Verification

const FAVORITES_KEY = "cappadocia_favorites_v2";
const REMINDERS_KEY = "cappadocia_reminders_v2";
const CUSTOM_EVENTS_KEY = "cappadocia_custom_events_v2";
const REPORTS_KEY = "cappadocia_event_reports_v2";

export const getFavorites = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ["cap-real-1", "cap-real-3"]; // 54. Ürgüp Bağ Bozumu ve Kültür Yolu Festivali
  } catch {
    return [];
  }
};

export const toggleFavorite = (eventId) => {
  const current = getFavorites();
  const exists = current.includes(eventId);
  const updated = exists ? current.filter(id => id !== eventId) : [...current, eventId];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

export const getReminders = () => {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: "rem-1",
        eventId: "cap-real-1",
        eventTitle: "54. Uluslararası Ürgüp Bağ Bozumu ve Gastronomi Festivali",
        eventDate: "2026-09-04",
        eventTime: "10:00",
        notifyBefore: "1_day", // 1_day, 2_hours, at_start
        notifyBeforeLabel: "1 Gün Önce",
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];
  } catch {
    return [];
  }
};

export const saveReminder = (reminder) => {
  const current = getReminders();
  const existingIdx = current.findIndex(r => r.eventId === reminder.eventId);
  let updated;
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = reminder;
  } else {
    updated = [reminder, ...current];
  }
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

export const removeReminder = (reminderId) => {
  const current = getReminders();
  const updated = current.filter(r => r.id !== reminderId && r.eventId !== reminderId);
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

// ================= Custom Events & Moderation =================

export const getCustomEvents = () => {
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addCustomEvent = (event) => {
  const current = getCustomEvents();
  const updated = [event, ...current];
  try {
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

export const deleteCustomEvent = (eventId) => {
  const current = getCustomEvents();
  const updated = current.filter(e => e.id !== eventId);
  try {
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

export const clearCustomEvents = () => {
  try {
    localStorage.removeItem(CUSTOM_EVENTS_KEY);
    localStorage.removeItem("cappadocia_custom_events");
    localStorage.removeItem(REPORTS_KEY);
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify([]));
    localStorage.setItem(REPORTS_KEY, JSON.stringify([]));
  } catch {}
  return [];
};

export const updateCustomEventStatus = (eventId, status) => {
  const current = getCustomEvents();
  const updated = current.map(e => e.id === eventId ? { ...e, status } : e);
  try {
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

// ================= Event Reporting System =================

export const getReports = () => {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const reportEvent = (report) => {
  const current = getReports();
  const updated = [{ ...report, id: `rep-${Date.now()}`, createdAt: new Date().toISOString() }, ...current];
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

export const deleteReport = (reportId) => {
  const current = getReports();
  const updated = current.filter(r => r.id !== reportId);
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
};

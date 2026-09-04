// Service for adding Cappadocia events directly to iOS / Android / Google Calendars

export const downloadIcsCalendar = (event) => {
  const parseDateAndTimeToUTC = (dateStr, timeStr) => {
    try {
      const [startTime] = (timeStr || "10:00").split("-").map(s => s.trim());
      const [hours, minutes] = startTime.split(":").map(Number);
      const date = new Date(dateStr);
      date.setHours(hours || 10, minutes || 0, 0);

      const pad = (n) => String(n).padStart(2, '0');
      const year = date.getUTCFullYear();
      const month = pad(date.getUTCMonth() + 1);
      const day = pad(date.getUTCDate());
      const hour = pad(date.getUTCHours());
      const min = pad(date.getUTCMinutes());
      const sec = "00";

      return `${year}${month}${day}T${hour}${min}${sec}Z`;
    } catch {
      return "20260901T090000Z";
    }
  };

  const startUtc = parseDateAndTimeToUTC(event.date, event.time);
  // Default 2 hours duration
  const endUtc = parseDateAndTimeToUTC(event.date, (parseInt((event.time||"10").split(":")[0], 10) + 2) + ":00");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kapadokya Etkinlikleri//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:kapadokya-${event.id}-${Date.now()}@cappadocia.events`,
    `DTSTAMP:${startUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:🎈 ${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}\\n\\nOrganizatör: ${event.organizer}\\nDetaylar: Kapadokya Etkinlik Rehberi`,
    `LOCATION:${event.locationName}, ${event.town}, Kapadokya`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Kapadokya Etkinliği Hatırlatması",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${event.title.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ]/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getGoogleCalendarUrl = (event) => {
  const startTime = (event.time || "10:00").split("-")[0].trim().replace(":", "");
  const cleanDate = event.date.replace(/-/g, "");
  const startParam = `${cleanDate}T${startTime}00`;
  const endParam = `${cleanDate}T${String(parseInt(startTime.slice(0,2)||10, 10) + 2).padStart(2,'0')}${startTime.slice(2)||'00'}00`;

  const details = encodeURIComponent(`${event.description}\n\nOrganizatör: ${event.organizer}\nKonum: ${event.locationName}`);
  const title = encodeURIComponent(`🎈 ${event.title}`);
  const location = encodeURIComponent(`${event.locationName}, ${event.town}, Kapadokya`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startParam}/${endParam}&details=${details}&location=${location}`;
};

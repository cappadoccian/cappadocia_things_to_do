export const DATA_SOURCE_CATEGORIES = [
  { id: "all", name: "Tüm Kaynaklar", icon: "🌐" },
  { id: "resmi", name: "Resmi Kurumlar", icon: "🏛️" },
  { id: "universite", name: "Üniversiteler", icon: "🎓" },
  { id: "bilet", name: "Bilet & Gösteri", icon: "🎫" },
  { id: "dernek", name: "Turizm & Doğa Dernekleri", icon: "🧭" },
  { id: "instagram", name: "Instagram & Sosyal Medya", icon: "📸" },
  { id: "basin", name: "Yerel Haber & Basın", icon: "📰" }
];

// itemsCount / lastScraped / status below are placeholders only for sources
// that don't have a working adapter yet (status: "Yakında"). For src-5, the
// real values are looked up at render time from public/scraped-meta.json
// (written by scraper/run_scrapers.py) — see getSourceRuntimeStatus below.
export const DATA_SOURCES = [
  // 1. Resmi Kurumlar
  {
    id: "src-1",
    name: "Nevşehir Valiliği & İl Kültür Turizm",
    category: "resmi",
    type: "Resmi Kurum Portalı",
    url: "https://nevsehir.ktb.gov.tr",
    status: "Yakında",
    color: "#e67e22",
    icon: "🏛️",
    description: "Nevşehir ve Kapadokya geneli resmi konser, sergi, panel ve anma töreni duyuruları."
  },
  {
    id: "src-2",
    name: "Kapadokya Alan Başkanlığı",
    category: "resmi",
    type: "Bölgesel Yönetim & Festivaller",
    url: "https://kapadokyaalan.ktb.gov.tr",
    status: "Yakında",
    color: "#9b59b6",
    icon: "🎈",
    description: "Uluslararası Sıcak Hava Balon Festivalleri, vadi koruma etkinlikleri ve kültürel etkinlikler."
  },
  {
    id: "src-3",
    name: "Türkiye Kültür Yolu Festivali (Kapadokya)",
    category: "resmi",
    type: "Ulusal Kültür & Sanat Festivali",
    url: "https://kulturyolufestivali.com",
    status: "Yakında",
    color: "#e74c3c",
    icon: "🎭",
    description: "Bakanlık destekli dev konserler, tiyatrolar, açık hava sergileri ve çocuk etkinlikleri."
  },
  {
    id: "src-4",
    name: "Göreme, Ürgüp, Avanos & Uçhisar Belediyeleri",
    category: "resmi",
    type: "Yerel Belediye Kültür Portalları",
    url: "https://goreme.bel.tr",
    status: "Yakında",
    color: "#2ecc71",
    icon: "📢",
    description: "İlçe festivalleri, çömlek yarışmaları, bağbozumu şenlikleri ve açık hava sinemaları."
  },

  // 2. Üniversiteler & Akademik
  {
    id: "src-5",
    name: "Kapadokya Üniversitesi (KUN) Kültür Merkezi",
    category: "universite",
    type: "Akademik & Kültür Sanat",
    url: "https://kapadokya.edu.tr/etkinlikler",
    status: "Aktif",
    color: "#16a085",
    icon: "🎓",
    description: "Mustafapaşa yerleşkesi atölyeleri, felsefe günleri, gastronomi sempozyumları ve seminerler."
  },
  {
    id: "src-6",
    name: "Nevşehir Hacı Bektaş Veli Üniversitesi (NEVÜ)",
    category: "universite",
    type: "Üniversite Etkinlik Takvimi",
    url: "https://nevsehir.edu.tr/tr/etkinlikler",
    status: "Yakında",
    color: "#2980b9",
    icon: "🏫",
    description: "Kongre merkezi tiyatro oyunları, bahar şenlikleri, halk dansları ve öğrenci kulüp konserleri."
  },

  // 3. Biletleme & Gösteri Portalları
  {
    id: "src-7",
    name: "Biletix Kapadokya",
    category: "bilet",
    type: "Bilet Satış & Organizasyon",
    url: "https://biletix.com",
    status: "Yakında",
    color: "#0984e3",
    icon: "🎫",
    description: "Bölgedeki popüler konserler, stand-up gösterileri ve özel vadi müzik etkinlikleri biletleri."
  },
  {
    id: "src-8",
    name: "Passo & Bubilet Kapadokya",
    category: "bilet",
    type: "Etkinlik & Festival Biletleri",
    url: "https://passo.com.tr",
    status: "Yakında",
    color: "#6c5ce7",
    icon: "🎟️",
    description: "Kültür Yolu etkinlikleri biletleri, gastronomi tadım biletleri ve özel gece turları."
  },

  // 4. Turizm & Doğa Dernekleri
  {
    id: "src-9",
    name: "KAPTİD (Kapadokya Turistik Otelciler Derneği)",
    category: "dernek",
    type: "Turizm & Konaklama Birliği",
    url: "https://kaptid.org.tr",
    status: "Yakında",
    color: "#d35400",
    icon: "🏨",
    description: "Otel teras konserleri, yerel mutfak günleri ve turizm tanıtım workshopları."
  },
  {
    id: "src-10",
    name: "KADOS & Kapadokya Doğa Sporları Kulübü",
    category: "dernek",
    type: "Doğa & Macera Kulübü",
    url: "https://kados.org.tr",
    status: "Yakında",
    color: "#27ae60",
    icon: "🥾",
    description: "Güllüdere, Kızılçukur ve Ihlara vadisi hafta sonu trekking turları, kaya tırmanışı ve yoga."
  },

  // 5. Instagram & Sosyal Medya
  {
    id: "src-11",
    name: "Instagram @kapadokyaetkinlik",
    category: "instagram",
    type: "Sosyal Medya Etkinlik Sayfası",
    url: "https://instagram.com/kapadokyaetkinlik",
    status: "Desteklenmiyor",
    color: "#e1306c",
    icon: "📸",
    description: "Kapadokya'daki kafe konserleri, teras akustik geceleri ve bağımsız sanat buluşmaları. (Instagram kullanım şartları gereği otomatik veri çekimi yapılmıyor.)"
  },
  {
    id: "src-12",
    name: "Instagram @cappadocia_events & #kapadokyaetkinlik",
    category: "instagram",
    type: "Hashtag & Konum Analiz Botu",
    url: "https://instagram.com/explore/tags/kapadokyaetkinlik",
    status: "Desteklenmiyor",
    color: "#fd1d1d",
    icon: "🔥",
    description: "Yerel işletmelerin ve sanatçıların paylaştığı afişler ve anlık hikaye duyuruları. (Instagram kullanım şartları gereği otomatik veri çekimi yapılmıyor.)"
  },

  // 6. Yerel Haber & Basın
  {
    id: "src-13",
    name: "FİB Haber Kültür & Sanat",
    category: "basin",
    type: "Bölgesel Haber Portalı",
    url: "https://fibhaber.com/kultur-sanat",
    status: "Yakında",
    color: "#00cec9",
    icon: "📰",
    description: "Nevşehir ve Kapadokya genelindeki resmi açılışlar, sergi bültenleri ve yerel şenlikler."
  },
  {
    id: "src-14",
    name: "Nevşehir Kent Haber & Muşkara Haber",
    category: "basin",
    type: "Yerel Gazete & Basın",
    url: "https://nevsehirkenthaber.com",
    status: "Yakında",
    color: "#0984e3",
    icon: "🗞️",
    description: "Halk eğitim merkezi kurs sergileri, belediye tiyatroları ve geleneksel kutlamalar."
  }
];

// Merges the static source descriptions above with the real counts/timestamp
// the scraper wrote to public/scraped-meta.json (see src/services/eventsApi.js).
// Sources without a matching entry in scrapedMeta keep their static status
// ("Yakında" / "Desteklenmiyor") and show no fabricated item count.
export const withRuntimeStatus = (sources, scrapedMeta) => {
  const bySourceId = new Map((scrapedMeta?.sources || []).map(s => [s.id, s]));
  return sources.map(src => {
    const runtime = bySourceId.get(src.id);
    if (!runtime) return { ...src, itemsCount: null, lastScraped: null };
    return {
      ...src,
      status: runtime.status === 'ok' ? 'Aktif' : 'Hata',
      itemsCount: runtime.itemsCount,
      lastScraped: scrapedMeta.lastRunAt,
    };
  });
};

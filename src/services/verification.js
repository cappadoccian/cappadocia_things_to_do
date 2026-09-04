/**
 * Kapadokya Etkinlikleri - Doğrulama ve Güvenlik Motoru (Verification Service)
 * Gerçekte var olmayan veya teyitsiz etkinliklerin listelenmesini önler.
 */

// 100% Güvenilir Resmi ve Akredite Alan Adları Listesi
export const TRUSTED_OFFICIAL_DOMAINS = [
  'gov.tr',
  'bel.tr',
  'edu.tr',
  'ktb.gov.tr',
  'nevsehir.gov.tr',
  'kapadokyaalan.ktb.gov.tr',
  'nevsehir.ktb.gov.tr',
  'urgup.bel.tr',
  'goreme.bel.tr',
  'avanos.bel.tr',
  'uchisar.bel.tr',
  'kapadokya.edu.tr',
  'nevsehir.edu.tr',
  'muze.gov.tr',
  'kulturyolufestivali.com',
  'cappadociaultratrail.com',
  'garo.org.tr',
  'saruhan1249.com'
];

// Akredite Biletleme & Organizasyon Platformları
export const TRUSTED_TICKETING_DOMAINS = [
  'biletix.com',
  'passo.com.tr',
  'biletinial.com',
  'bubilet.com.tr'
];

/**
 * URL'den alan adını (domain) ayıklar
 */
export const extractDomain = (url) => {
  if (!url) return '';
  try {
    const formatted = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const parsed = new URL(formatted);
    return parsed.hostname.toLowerCase().replace('www.', '');
  } catch {
    return '';
  }
};

/**
 * Alan adının resmi veya akredite olup olmadığını denetler
 */
export const checkDomainTrust = (url) => {
  const domain = extractDomain(url);
  if (!domain) {
    return {
      isTrusted: false,
      isOfficial: false,
      isTicketing: false,
      domain: 'Belirtilmedi',
      label: 'Kaynak Belirtilmemiş'
    };
  }

  const isOfficial = TRUSTED_OFFICIAL_DOMAINS.some(d => domain.endsWith(d) || domain === d);
  const isTicketing = TRUSTED_TICKETING_DOMAINS.some(d => domain.endsWith(d) || domain === d);

  if (isOfficial) {
    return {
      isTrusted: true,
      isOfficial: true,
      isTicketing: false,
      domain,
      label: 'Resmi Kurum (.gov.tr / .bel.tr / Bakanlık)'
    };
  }

  if (isTicketing) {
    return {
      isTrusted: true,
      isOfficial: false,
      isTicketing: true,
      domain,
      label: 'Akredite Biletleme Portalı (Biletix / Passo / Bubilet / Biletinial)'
    };
  }

  return {
    isTrusted: false,
    isOfficial: false,
    isTicketing: false,
    domain,
    label: 'Harici / Topluluk Bildirimi'
  };
};

/**
 * Bir etkinliğin güven skorunu ve doğrulama seviyesini hesaplar
 */
export const evaluateEventTrust = (event) => {
  let score = 30; // Başlangıç taban puanı
  let reasons = [];

  const domainCheck = checkDomainTrust(event.sourceUrl);

  // 1. Alan Adı Puanlaması
  if (domainCheck.isOfficial) {
    score += 50;
    reasons.push('T.C. Resmi Kurum veya Belediye onaylı alan adı');
  } else if (domainCheck.isTicketing) {
    score += 45;
    reasons.push('Akredite bilet platformu bağlantısı (Biletix/Passo/Bubilet/Biletinial)');
  } else if (event.sourceUrl && event.sourceUrl.length > 5) {
    score += 10;
    reasons.push('Web kaynak bağlantısı mevcut (İncelemede)');
  } else {
    reasons.push('Resmi kaynak bağlantısı eksik');
  }

  // 2. Organizatör Teyidi
  if (event.organizerContact && event.organizerContact.length >= 10) {
    score += 10;
    reasons.push('Doğrulanabilir iletişim / bilet bilgisi mevcut');
  }

  // 3. Konum ve Koordinat Netliği
  if (event.coordinates && event.coordinates.length === 2 && event.locationName) {
    score += 10;
    reasons.push('Harita koordinatları ve açık adres tanımlı');
  }

  score = Math.min(100, Math.max(0, score));

  // Doğrulama Seviyesi
  let verificationLevel = 'COMMUNITY';
  let badgeText = '🟡 Topluluk Bildirimi (İnceleniyor)';
  let badgeColor = '#ffd166';
  let status = event.status || (score >= 75 ? 'approved' : 'pending');

  if (score >= 85 || domainCheck.isOfficial) {
    verificationLevel = 'OFFICIAL';
    badgeText = '🟢 %100 Resmi Kurum Onaylı';
    badgeColor = '#06d6a0';
    status = 'approved';
  } else if (score >= 70 || domainCheck.isTicketing) {
    verificationLevel = 'VERIFIED_ORG';
    badgeText = '🔵 Akredite Bilet / Organizasyon';
    badgeColor = '#4cc9f0';
    status = 'approved';
  }

  return {
    trustScore: score,
    domainInfo: domainCheck,
    verificationLevel,
    badgeText,
    badgeColor,
    status,
    reasons,
    isAutoApproved: score >= 75
  };
};

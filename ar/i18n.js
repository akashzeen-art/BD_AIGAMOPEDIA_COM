/**
 * i18n: query-based locale (same files for every tab).
 * Default is Arabic. English only when ?lang=en is set.
 * KSA only. Country code is +966 in English and Arabic.
 */
(function () {
  const pathname = window.location.pathname;

  // Leave the stale /ar/ copy and stay on the updated root files.
  if (/\/ar(\/|$)/.test(pathname)) {
    const cleanPath = pathname.replace(/\/ar(?=\/|$)/, '') || '/';
    window.location.replace(cleanPath + window.location.search + window.location.hash);
    return;
  }

  let appBasePath = '';
  const meta = document.querySelector('meta[name="app-base-path"]');
  if (meta && meta.getAttribute('content')) {
    appBasePath = meta.getAttribute('content').replace(/\/$/, '');
  }

  const _params = new URLSearchParams(window.location.search);
  const isAr = _params.get('lang') !== 'en';
  const locale = isAr ? 'ar' : 'en';
  const localePrefix = appBasePath;

  window.getLocale = function () { return locale; };
  window.isRTL = function () { return isAr; };
  window.getBasePath = function () { return appBasePath; };
  window.getLocalePrefix = function () { return localePrefix; };
  window.apiUrl = function (path) {
    return appBasePath + (path.startsWith('/') ? path : '/' + path);
  };
  const _sid = new URLSearchParams(window.location.search).get('serviceid') || new URLSearchParams(window.location.search).get('id') || '';
  window.SERVICE_ID = _sid;
  window.MSISDN_STORAGE_KEY = 'aigamopedia_msisdn_' + _sid;

  // KSA only. Both languages always use +966.
  window.COUNTRY_CODE = '966';
  window.COUNTRY_PREFIX = '+966';
  window.KSA_INVALID_EN = 'Please enter a valid KSA number (+966...)';
  window.KSA_INVALID_AR = 'يرجى إدخال رقم سعودي صحيح (+966...)';
  if (window.I18N_EN) window.I18N_EN.popupErrInvalid = window.KSA_INVALID_EN;
  if (window.I18N_AR) window.I18N_AR.popupErrInvalid = window.KSA_INVALID_AR;

  const strings = locale === 'ar' ? (window.I18N_AR || {}) : (window.I18N_EN || {});
  window.t = function (key) {
    const val = strings[key];
    return val !== undefined ? val : key;
  };

  function setDocumentDirection() {
    document.documentElement.lang = locale === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isAr);
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const val = window.t(key);
      if (el.getAttribute('data-i18n-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      if (!el.getAttribute('data-i18n')) {
        const key = el.getAttribute('data-i18n-html');
        el.innerHTML = window.t(key);
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.placeholder = window.t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = window.t(el.getAttribute('data-i18n-title'));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      el.alt = window.t(el.getAttribute('data-i18n-alt'));
    });
    var invalid = document.getElementById('msisdn_invalid');
    if (invalid) invalid.textContent = isAr ? window.KSA_INVALID_AR : window.KSA_INVALID_EN;
  }

  function lockCountryCode() {
    if (typeof window.lockCountryCode === 'function') window.lockCountryCode();
  }

  window.normalizeMsisdn = function (value) {
    var digits = String(value || '').replace(/\D/g, '');
    digits = digits.replace(/^00/, '');
    if (digits.indexOf(window.COUNTRY_CODE) === 0) digits = digits.slice(window.COUNTRY_CODE.length);
    digits = digits.replace(/^0+/, '');
    return digits;
  };

  function fixServiceIdLinks() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
      // Only internal .html page links
      if (href.indexOf('.html') === -1 && !href.endsWith('/') && href !== '/' && !href.startsWith('/ar')) return;
      if (href.indexOf('serviceid=') !== -1) return;
      var sep = href.indexOf('?') !== -1 ? '&' : '?';
      a.setAttribute('href', href + sep + 'serviceid=' + _sid);
    });
  }

  function currentQuery() {
    return window.location.search || '';
  }

  function withLang(href, lang) {
    var qIdx = href.indexOf('?');
    var path = qIdx === -1 ? href : href.slice(0, qIdx);
    var params = new URLSearchParams(qIdx === -1 ? '' : href.slice(qIdx + 1));
    currentQuery().replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair || pair.indexOf('lang=') === 0) return;
      var bits = pair.split('=');
      if (!params.has(bits[0])) params.set(bits[0], decodeURIComponent(bits[1] || ''));
    });
    if (lang === 'en') params.set('lang', 'en');
    else params.delete('lang');
    var qs = params.toString();
    return path + (qs ? '?' + qs : '');
  }

  window.toggleLang = function () {
    var params = new URLSearchParams(window.location.search);
    if (params.get('lang') === 'en') params.delete('lang');
    else params.set('lang', 'en');
    var qs = params.toString();
    window.location.href = window.location.pathname + (qs ? '?' + qs : '');
  };

  function fixInternalLinks() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;
      if (href.indexOf('/ar') !== -1) {
        a.setAttribute('href', href.replace(/\/ar(?=\/|$)/, ''));
      }
    });
  }

  function fixFormLinks() {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setDocumentDirection();
      applyI18n();
      lockCountryCode();
      fixServiceIdLinks();
      fixInternalLinks();
      fixFormLinks();
      if (typeof window.onI18nReady === 'function') window.onI18nReady();
    });
  } else {
    setDocumentDirection();
    applyI18n();
    lockCountryCode();
    fixServiceIdLinks();
    fixInternalLinks();
    fixFormLinks();
    if (typeof window.onI18nReady === 'function') window.onI18nReady();
  }
})();

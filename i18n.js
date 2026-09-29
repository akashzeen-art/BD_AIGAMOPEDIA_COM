/**
 * i18n: query-based locale (same files for every tab).
 * Default is Bangla. English only when ?lang=en is set.
 * Bangladesh only. Country code is +880.
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
  const isEn = _params.get('lang') === 'en';
  const locale = isEn ? 'en' : 'bn';
  const localePrefix = appBasePath;

  window.getLocale = function () { return locale; };
  window.isRTL = function () { return false; };
  window.getBasePath = function () { return appBasePath; };
  window.getLocalePrefix = function () { return localePrefix; };
  window.apiUrl = function (path) {
    return appBasePath + (path.startsWith('/') ? path : '/' + path);
  };
  // Bangladesh only. Country code is +880.
  window.COUNTRY_CODE = '880';
  window.COUNTRY_PREFIX = '+880';

  const strings = locale === 'en' ? (window.I18N_EN || {}) : (window.I18N_BN || {});
  window.t = function (key) {
    const val = strings[key];
    return val !== undefined ? val : key;
  };

  function setDocumentDirection() {
    document.documentElement.lang = locale;
    document.documentElement.dir = 'ltr';
    document.body.classList.remove('rtl');
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
    if (invalid) invalid.textContent = window.t('popupErrInvalid');
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
  window.toggleLang = function () {
    var params = new URLSearchParams(window.location.search);
    if (params.get('lang') === 'en') params.delete('lang');
    else params.set('lang', 'en');
    var qs = params.toString();
    window.location.href = window.location.pathname + (qs ? '?' + qs : '');
  };

  window._isBn = !isEn;

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
      fixInternalLinks();
      fixFormLinks();
      if (typeof window.onI18nReady === 'function') window.onI18nReady();
    });
  } else {
    setDocumentDirection();
    applyI18n();
    lockCountryCode();
    fixInternalLinks();
    fixFormLinks();
    if (typeof window.onI18nReady === 'function') window.onI18nReady();
  }
})();

(function () {
  window.COUNTRY_CODE = '880';
  window.COUNTRY_PREFIX = '+880';

  window.lockCountryCode = function () {
    document.querySelectorAll('.country-code, #account_country_code, #msisdn_country_code').forEach(function (el) {
      if (el.textContent !== window.COUNTRY_PREFIX) el.textContent = window.COUNTRY_PREFIX;
    });
  };

  window.normalizeMsisdn = function (value) {
    var digits = String(value || '').replace(/\D/g, '').replace(/^00/, '');
    if (digits.indexOf(window.COUNTRY_CODE) === 0) digits = digits.slice(window.COUNTRY_CODE.length);
    return digits.replace(/^0+/, '');
  };

  window.toMsisdn = function (value) {
    return window.COUNTRY_CODE + window.normalizeMsisdn(value);
  };

  window.isValidMsisdn = function (value) {
    var full = window.toMsisdn(value);
    return /^880\d{10}$/.test(full);
  };

  window.formatMsisdn = function (value) {
    return window.COUNTRY_PREFIX + window.normalizeMsisdn(value);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.lockCountryCode);
  } else {
    window.lockCountryCode();
  }
})();

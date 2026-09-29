/**
 * KSA portal only. Every phone field must show +966.
 */
(function () {
  window.COUNTRY_CODE = '966';
  window.COUNTRY_PREFIX = '+966';

  window.KSA_INVALID_EN = 'Please enter a valid KSA number (+966...)';
  window.KSA_INVALID_AR = 'يرجى إدخال رقم سعودي صحيح (+966...)';

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

  window.isValidKsaMsisdn = function (value) {
    return /^9665\d{8}$/.test(window.toMsisdn(value));
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

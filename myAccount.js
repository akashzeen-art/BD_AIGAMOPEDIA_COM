const MSISDN_KEY = () => 'aigamopedia_msisdn_';

function tr(key) { return typeof window.t === 'function' ? window.t(key) : key; }

function showError(msg) {
  const el = document.getElementById('account_error');
  el.textContent = msg;
  el.style.color = '#dc2626';
  el.style.display = 'block';
}

function hideError() {
  const el = document.getElementById('account_error');
  el.style.display = 'none';
  el.textContent = '';
}

function renderProfile(msisdn) {
  document.getElementById('profile_msisdn').textContent = window.formatMsisdn(msisdn);
  const statusEl = document.getElementById('profile_status');
  statusEl.textContent = tr('accountActive');
  statusEl.style.color = '#22c55e';
  document.getElementById('profile_price').textContent = '-';
  document.getElementById('profile_validity').textContent = '-';
  document.getElementById('profile_actdate').textContent = '-';
  document.getElementById('profile_renewdate').textContent = '-';
  document.getElementById('account-login').style.display = 'none';
  document.getElementById('account-profile').style.display = 'flex';
}

function doLogin() {
  if (typeof window.lockCountryCode === 'function') window.lockCountryCode();
  const input = window.normalizeMsisdn(document.getElementById('account_msisdn').value);
  if (!window.isValidMsisdn(input)) { showError(tr('popupErrInvalid')); return; }
  hideError();
  localStorage.setItem(MSISDN_KEY(), input);
  renderProfile(input);
}

function doLogout() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('aigamopedia_msisdn_') || k.startsWith('aigamopedia_sid_'))
    .forEach(k => localStorage.removeItem(k));

  ['profile_msisdn','profile_status','profile_price','profile_validity','profile_actdate','profile_renewdate']
    .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });

  document.getElementById('account-profile').style.display = 'none';
  document.getElementById('account-login').style.display = 'flex';
  document.getElementById('account_msisdn').value = '';
  hideError();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function init() {
  if (typeof window.lockCountryCode === 'function') window.lockCountryCode();
  document.getElementById('account_login_btn')?.addEventListener('click', doLogin);
  document.getElementById('account_logout_btn')?.addEventListener('click', doLogout);
  document.getElementById('account_msisdn')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

  const saved = localStorage.getItem(MSISDN_KEY());
  if (saved) renderProfile(saved);
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();

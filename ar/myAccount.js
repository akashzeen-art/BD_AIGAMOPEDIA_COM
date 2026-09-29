const SERVICE_ID = window.SERVICE_ID || new URLSearchParams(window.location.search).get('serviceid') || new URLSearchParams(window.location.search).get('id') || '';
const CHECK_STATUS_URL = () => window.apiUrl('/api/subscriptioninfo');
const SUBSCRIPTION_INFO_URL = () => window.apiUrl('/api/subscriptioninfo');
const MSISDN_KEY = () => window.MSISDN_STORAGE_KEY || ('aigamopedia_msisdn_' + SERVICE_ID);

function tr(key) { return typeof window.t === 'function' ? window.t(key) : key; }

function formatDate(str) {
  if (!str) return '-';
  return new Date(str).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function showError(msg) {
  const el = document.getElementById('account_error');
  el.textContent = msg;
  el.style.color = '#dc2626';
  el.style.display = 'block';
}

function showSuccess(msg) {
  const el = document.getElementById('account_error');
  el.textContent = msg;
  el.style.color = '#22c55e';
  el.style.display = 'block';
}

function hideError() {
  const el = document.getElementById('account_error');
  el.style.display = 'none';
  el.textContent = '';
}

function renderProfile(msisdn, info) {
  document.getElementById('profile_msisdn').textContent = window.formatMsisdn(msisdn);

  const isActive = info?.response === 'ACTIVE';
  const statusEl = document.getElementById('profile_status');
  statusEl.textContent = isActive ? tr('accountActive') : tr('accountInactive');
  statusEl.style.color = isActive ? '#22c55e' : '#f97316';

  document.getElementById('profile_price').textContent = info?.pricePoint ? info.pricePoint + ' SAR' : '-';
  document.getElementById('profile_validity').textContent = info?.validity ? info.validity + ' ' + tr('accountDay') : '-';
  document.getElementById('profile_actdate').textContent = formatDate(info?.actDate);
  document.getElementById('profile_renewdate').textContent = formatDate(info?.renewDate);

  document.getElementById('account-login').style.display = 'none';
  document.getElementById('account-profile').style.display = 'flex';
}

async function loadProfile(msisdn) {
  try {
    const res = await fetch(`${SUBSCRIPTION_INFO_URL()}?serviceid=${SERVICE_ID}&msisdn=${window.toMsisdn(msisdn)}`);
    const info = await res.json();
    if (info.serviceId) localStorage.setItem('aigamopedia_sid_' + SERVICE_ID, info.serviceId);
    renderProfile(msisdn, info);
  } catch {
    renderProfile(msisdn, null);
  }
}

async function doLogin() {
  if (typeof window.lockCountryCode === 'function') window.lockCountryCode();
  const input = window.normalizeMsisdn(document.getElementById('account_msisdn').value);
  if (!window.isValidKsaMsisdn(input)) { showError(tr('popupErrInvalid')); return; }
  hideError();

  const btn = document.getElementById('account_login_btn');
  btn.disabled = true;
  btn.textContent = '...';

  try {
    const res = await fetch(`${CHECK_STATUS_URL()}?serviceid=${SERVICE_ID}&msisdn=${window.toMsisdn(input)}`);
    const data = await res.json();
    btn.disabled = false;
    btn.textContent = tr('accountCheckBtn');

    if (!data || (!data.response && data.status && data.status !== 'success')) { showError(tr('popupErrGeneric')); return; }
    if (data.response !== 'ACTIVE') { showError(tr('popupErrNotSubscribed')); return; }

    localStorage.setItem(MSISDN_KEY(), input);
    if (data.serviceId) localStorage.setItem('aigamopedia_sid_' + SERVICE_ID, data.serviceId);
    await loadProfile(input);
  } catch {
    btn.disabled = false;
    btn.textContent = tr('accountCheckBtn');
    showError(tr('popupErrGeneric'));
  }
}

async function doUnsubscribe() {
  const msisdn = localStorage.getItem(MSISDN_KEY());
  if (!msisdn) return;

  const btn = document.getElementById('account_unsubscribe_btn');
  if (!confirm(tr('accountUnsubscribeConfirm'))) return;

  btn.disabled = true;
  btn.textContent = '...';

  try {
    const res = await fetch(window.apiUrl('/api/unsubscribe'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msisdn: window.toMsisdn(msisdn),
        serviceId: SERVICE_ID || localStorage.getItem('aigamopedia_sid_' + SERVICE_ID) || ''
      })
    });
    const data = await res.json();
    btn.disabled = false;
    btn.textContent = tr('accountUnsubscribe');

    const status = String(data && data.status).toLowerCase();
    const failed = !res.ok || !data || data.status === false || data.success === false ||
      ['false', 'fail', 'failed', 'error'].includes(status);
    if (failed) {
      showError(tr('popupErrGeneric'));
      return;
    }
    doLogout();
    showSuccess(tr('accountUnsubscribeSuccess'));
  } catch {
    btn.disabled = false;
    btn.textContent = tr('accountUnsubscribe');
    showError(tr('popupErrGeneric'));
  }
}

function doLogout() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('aigamopedia_msisdn_') || key.startsWith('aigamopedia_sid_'))
    .forEach((key) => localStorage.removeItem(key));

  ['profile_msisdn', 'profile_status', 'profile_price', 'profile_validity', 'profile_actdate', 'profile_renewdate']
    .forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = ''; });

  const loginBtn = document.getElementById('account_login_btn');
  if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = tr('accountCheckBtn'); }
  const unsubBtn = document.getElementById('account_unsubscribe_btn');
  if (unsubBtn) { unsubBtn.disabled = false; unsubBtn.textContent = tr('accountUnsubscribe'); }

  document.getElementById('account-profile').style.display = 'none';
  document.getElementById('account-login').style.display = 'flex';
  document.getElementById('account_msisdn').value = '';
  hideError();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function init() {
  if (typeof window.lockCountryCode === 'function') window.lockCountryCode();
  // Attach logout listener once, always
  document.getElementById('account_logout_btn')?.addEventListener('click', doLogout);
  document.getElementById('account_unsubscribe_btn')?.addEventListener('click', doUnsubscribe);

  // Login button
  document.getElementById('account_login_btn')?.addEventListener('click', doLogin);

  // Enter key on input
  document.getElementById('account_msisdn')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });

  // Auto-load if already logged in
  const saved = localStorage.getItem(MSISDN_KEY());
  if (saved) loadProfile(saved);
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();

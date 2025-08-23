// type="module" olarak yüklenir

import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, signOut,
  setPersistence, browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js';

/* Firebase hazır olana kadar bekle */
function waitForFirebaseAuth() {
  return new Promise((resolve) => {
    (function check() {
      if (window.fb?.auth) return resolve(window.fb.auth);
      setTimeout(check, 50);
    })();
  });
}

function paint(btn, user) {
  if (!btn) return;
  btn.textContent = user ? 'Çıkış' : 'Giriş';
  btn.setAttribute('aria-label', user ? 'Çıkış Yap' : 'Giriş Yap');
}

function showError(e) {
  console.warn('Auth error:', e);
  alert('Giriş sırasında hata: ' + (e?.message || e));
}

document.addEventListener('DOMContentLoaded', async () => {
  const btn = document.getElementById('authBtn');
  if (!btn) return;

  const auth = await waitForFirebaseAuth();

  // Oturum kalıcı
  try { await setPersistence(auth, browserLocalPersistence); } catch {}

  // UI bind
  onAuthStateChanged(auth, (user) => paint(btn, user));
  paint(btn, auth.currentUser);

  // Giriş / Çıkış
  btn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (user) { await signOut(auth); return; }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      // popup engellendiyse redirect dene
      if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/cancelled-popup-request') {
        try { await signInWithRedirect(auth, provider); }
        catch (e2) { showError(e2); }
      } else {
        showError(e);
      }
    }
  });
});

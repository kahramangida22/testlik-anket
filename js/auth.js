// Bu dosya type="module" olarak yüklenecek.
btn.textContent = user ? 'Çıkış' : 'Giriş';
btn.setAttribute('aria-label', user ? 'Çıkış Yap' : 'Giriş Yap');
});


btn.addEventListener('click', async () => {
const user = auth.currentUser;
if (user) {
await signOut(auth);
return;
}
const provider = new GoogleAuthProvider();
try { await signInWithPopup(auth, provider); } catch (e) { console.warn(e); }
});
}
```javascript
(function(){
const btn = document.getElementById('authBtn');
if (!btn) return;


function isLogged() {
// Freestone mevcutsa onu kullan
if (window.freestone?.auth?.currentUser) return true;
// Fallback demo: localStorage
return localStorage.getItem('fsLogged') === '1';
}


async function login() {
if (window.freestone?.signIn) {
try { await window.freestone.signIn(); } catch(e) { console.warn(e); }
} else {
localStorage.setItem('fsLogged', '1');
}
paint();
}


async function logout() {
if (window.freestone?.signOut) {
try { await window.freestone.signOut(); } catch(e) { console.warn(e); }
}
localStorage.removeItem('fsLogged');
paint();
}


function paint() {
const logged = isLogged();
btn.textContent = logged ? 'Çıkış' : 'Giriş';
btn.setAttribute('aria-label', logged ? 'Çıkış Yap' : 'Giriş Yap');
}


btn.addEventListener('click', () => {
if (isLogged()) logout(); else login();
});


paint();
})();

// type="module" olarak yüklenir

import {
  doc, runTransaction, serverTimestamp, increment,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';

export const PUAN_MIKTARI = 10;

/**
 * Kullanıcıya belirli bir anket için puan verir.
 * Aynı ankete ikinci kez puan yazmaz (AdSense uyumlu).
 * @param {string} pollId - benzersiz kimlik (örn: location.pathname)
 * @param {number} amount - varsayılan 10
 * @returns {Promise<boolean>} true = puan verildi, false = verilmedi
 */
export async function awardPointsForPoll(pollId, amount = PUAN_MIKTARI) {
  const db   = window.fb?.db;
  const auth = window.fb?.auth;
  const user = auth?.currentUser;

  if (!db || !auth) { alert('Sistem hazırlanıyor. Lütfen tekrar dene.'); return false; }
  if (!user) { alert('Puan kazanmak için giriş yapmalısın.'); return false; }
  if (!pollId) { alert('Anket kimliği bulunamadı.'); return false; }

  const userRef = doc(db, 'users', user.uid);
  const voteRef = doc(db, 'users', user.uid, 'votes', encodeURIComponent(pollId));

  try {
    await runTransaction(db, async (tx) => {
      const voteSnap = await tx.get(voteRef);
      if (voteSnap.exists()) {
        // Daha önce bu anketten puan alınmış
        throw new Error('ALREADY');
      }

      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) {
        tx.set(userRef, {
          totalPoints: 0,
          createdAt: serverTimestamp(),
          displayName: user.displayName || null,
          photoURL: user.photoURL || null
        });
      }

      tx.set(voteRef, {
        pollId,
        points: amount,
        createdAt: serverTimestamp()
      });

      tx.update(userRef, {
        totalPoints: increment(amount),
        updatedAt: serverTimestamp()
      });
    });

    alert(`+${amount} puan kazandın!`);
    return true;
  } catch (e) {
    if (e && e.message === 'ALREADY') {
      alert('Bu anketten daha önce puan kazandın. Başka ankete geç!');
      return false;
    }
    console.error('awardPointsForPoll error:', e);
    alert('Bir hata oluştu. Lütfen tekrar dene.');
    return false;
  }
}

/**
 * Toplam puanı gerçek zamanlı dinlemek için yardımcı.
 * puan.html gibi sayfalarda kullanışlıdır.
 * @param {(points:number)=>void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeUserPoints(callback) {
  const db   = window.fb?.db;
  const auth = window.fb?.auth;

  if (!db || !auth) return () => {};

  const user = auth.currentUser;
  if (!user) {
    // henüz giriş yoksa callback'e 0 gönder, auth.js girişten sonra sayfa yenilenince bağlanır
    try { callback?.(0); } catch {}
    return () => {};
  }

  const userRef = doc(db, 'users', user.uid);
  const unsub = onSnapshot(userRef, (snap) => {
    const data = snap.data();
    const pts = (data?.totalPoints ?? 0);
    try { callback?.(pts); } catch {}
  }, (err) => {
    console.error('subscribeUserPoints error:', err);
  });

  return unsub;
}

// type="module" olarak yüklenir

import {
  doc, runTransaction, serverTimestamp, increment
} from 'https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js';

/**
 * Aynı anketten sadece 1 kez puan kazandırır (AdSense uyumlu).
 * pollId: benzersiz kimlik (örn. location.pathname)
 */
export async function awardPointsForPoll(pollId, amount = 10) {
  const db   = window.fb?.db;
  const auth = window.fb?.auth;
  const user = auth?.currentUser;

  if (!db || !auth) { alert('Sistem hazırlanıyor. Lütfen tekrar dene.'); return false; }
  if (!user) { alert('Puan kazanmak için giriş yapmalısın.'); return false; }

  const userRef = doc(db, 'users', user.uid);
  const voteRef = doc(db, 'users', user.uid, 'votes', encodeURIComponent(pollId));

  try {
    await runTransaction(db, async (tx) => {
      const voteSnap = await tx.get(voteRef);
      if (voteSnap.exists()) throw new Error('ALREADY');

      const userSnap = await tx.get(userRef);
      if (!userSnap.exists()) {
        tx.set(userRef, {
          totalPoints: 0,
          createdAt: serverTimestamp(),
          displayName: user.displayName || null,
          photoURL: user.photoURL || null
        });
      }
      tx.set(voteRef, { pollId, points: amount, createdAt: serverTimestamp() });
      tx.update(userRef, { totalPoints: increment(amount) });
    });

    alert(`+${amount} puan kazandın!`);
    return true;
  } catch (e) {
    if (e?.message === 'ALREADY') {
      alert('Bu anketten daha önce puan kazandın. Başka ankete geç!');
      return false;
    }
    console.error(e);
    alert('Bir hata oluştu. Lütfen tekrar dene.');
    return false;
  }
}

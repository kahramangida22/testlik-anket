const PUAN_MIKTARI = 10; // her anket için +10
}


function gunlukPuanGetir() {
const key = 'gunlukPuan';
const g = JSON.parse(localStorage.getItem(key) || '{}');
const today = bugunStr();
return g[today] || 0;
}


function gunlukPuanArttir(miktar) {
const key = 'gunlukPuan';
const g = JSON.parse(localStorage.getItem(key) || '{}');
const today = bugunStr();
g[today] = (g[today] || 0) + miktar;
localStorage.setItem(key, JSON.stringify(g));
}


function puanEkle(miktar = PUAN_MIKTARI) {
const url = window.location.pathname; // her anket sayfası farklı URL
const setKey = 'puanlanmisAnketler';
const arr = JSON.parse(localStorage.getItem(setKey) || '[]');


if (arr.includes(url)) {
alert('Bu anketten daha önce puan kazandın. Başka anket çözerek devam edebilirsin.');
return false;
}


if (GUNLUK_LIMIT > 0) {
const todayTotal = gunlukPuanGetir();
if (todayTotal + miktar > GUNLUK_LIMIT) {
alert('Günlük puan limitine ulaştın. Yarın tekrar dene!');
return false;
}
}


let toplam = puanGetir() + miktar;
localStorage.setItem('toplamPuan', toplam);


arr.push(url);
localStorage.setItem(setKey, JSON.stringify(arr));


gunlukPuanArttir(miktar);
alert(`+${miktar} puan kazandın! Toplam puanın: ${toplam}`);
return true;
}


function puanSifirla() {
localStorage.removeItem('toplamPuan');
localStorage.removeItem('puanlanmisAnketler');
localStorage.removeItem('gunlukPuan');
alert('Puanlar sıfırlandı.');
}

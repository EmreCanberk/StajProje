// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Router'ı içeri aktar

// Firebase servislerini içeri aktar
// eslint-disable-next-line no-unused-vars
import { auth, db } from './firebaseConfig'; // db'yi de ekledik

// onAuthStateChanged'ı içeri aktar
import { onAuthStateChanged } from 'firebase/auth';

const app = createApp(App);

app.use(router); // Vue Router'ı kullan

// Firebase Auth durumunu dinleyerek ilk rota yönlendirmesini yap
// Bu, sayfa yenilendiğinde kimlik doğrulama durumunun doğru şekilde ele alınmasını sağlar
let appInitialized = false;
onAuthStateChanged(auth, () => {
  if (!appInitialized) {
    app.mount('#app');
    appInitialized = true;
  }
});
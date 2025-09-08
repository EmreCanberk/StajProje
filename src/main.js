
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';


import { auth, db } from './firebaseConfig'; 

import { onAuthStateChanged } from 'firebase/auth';

const app = createApp(App);

app.use(router); 


let appInitialized = false;
onAuthStateChanged(auth, () => {
  if (!appInitialized) {
    app.mount('#app');
    appInitialized = true;
  }
});

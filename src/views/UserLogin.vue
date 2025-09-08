<template>
  <div class="auth-container">
    <h2>Giriş Yap</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">E-posta:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="password">Şifre:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Giriş Yap</button>
    </form>
    
    <p class="forgot-password">
        <router-link to="/forgot-password">Şifremi unuttum?</router-link>
    </p>

    <p>Hesabınız yok mu? <router-link to="/register">Kaydolun</router-link></p>
  </div>
</template>

<script>
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default {
  name: 'AuthLogin',
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async handleLogin() {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let userRole = null;
        if (userDocSnap.exists()) {
          userRole = userDocSnap.data().role;
        }

        if (userRole === 'admin') {
          this.$router.push('/admin-dashboard');
        } else {
          this.$router.push('/user-dashboard');
        }
      } catch (error) {
        console.error('Giriş yapılırken hata oluştu:', error.message);
        alert('Giriş yapılırken hata oluştu: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  text-align: center; /* Merkezi hizalama eklendi */
}
h2 {
    color: #333;
}
.form-group {
  margin-bottom: 15px;
  text-align: left;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  background-color: #42b983;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #369c6d;
}
/* Mevcut stillere ek olarak yeni stiller */
p {
  margin-top: 20px;
  color: #555;
}
p a {
  color: #42b983;
  text-decoration: none;
}
p a:hover {
  text-decoration: underline;
}
.forgot-password a {
  font-size: 0.9em;
  color: #888;
  float: right;
  margin-top: -10px; /* Üstteki elemana daha yakın olması için */
}
.forgot-password a:hover {
  color: #444;
}
</style>
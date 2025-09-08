  <template>
    <div class="auth-container">
      <h2>Kaydol</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">E-posta:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Şifre:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Kaydol</button>
      </form>
      <p>Zaten hesabınız var mı? <router-link to="/">Giriş Yapın</router-link></p>
    </div>
  </template>

  <script>
  import { auth, db } from '../firebaseConfig';
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  import { doc, setDoc } from 'firebase/firestore';

  export default {
    name: 'UserRegister', // Linter uyarıları için 'UserRegister' olarak değiştirildi
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      async handleRegister() {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
          const user = userCredential.user;

          // Kullanıcı Firestore'a varsayılan 'user' rolüyle kaydet
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role: 'user'
          });

          alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
          this.$router.push('/'); // Giriş sayfasına yönlendir
        } catch (error) {
          console.error('Kayıt olurken hata oluştu:', error.message);
          alert('Kayıt olurken hata oluştu: ' + error.message);
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
  }
  button:hover {
    background-color: #369c6d;
  }
  p {
    margin-top: 20px;
  }
  p a {
    color: #42b983;
    text-decoration: none;
  }
  </style>
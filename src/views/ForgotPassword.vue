<template>
  <div class="forgot-password-container">
    <div class="form-card">
      <h2>Şifremi Unuttum</h2>
      <p>Lütfen şifre sıfırlama linki göndermek için e-posta adresinizi girin.</p>
      <form @submit.prevent="handlePasswordReset">
        <div class="form-group">
          <label for="email">E-posta Adresi</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="ornek@email.com"
          />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? 'Gönderiliyor...' : 'Şifremi Sıfırla' }}
        </button>
      </form>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p class="back-to-login">
        <router-link to="/login">Giriş sayfasına dön</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

export default {
  name: 'ForgotPassword',
  data() {
    return {
      email: '',
      loading: false,
      successMessage: '',
      errorMessage: '',
    };
  },
  methods: {
    async handlePasswordReset() {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const auth = getAuth();

      try {
        await sendPasswordResetEmail(auth, this.email);
        this.successMessage = 'Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.';
        this.email = '';
      } catch (error) {
        console.error('Şifre sıfırlama hatası:', error.message);
        switch (error.code) {
          case 'auth/invalid-email':
            this.errorMessage = 'Geçersiz e-posta adresi.';
            break;
          case 'auth/user-not-found':
            this.errorMessage = 'Bu e-posta adresine ait bir kullanıcı bulunamadı.';
            break;
          default:
            this.errorMessage = 'Şifre sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.';
            break;
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #f0f2f5;
}

.form-card {
  background-color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

h2 {
  margin-bottom: 10px;
  color: #333;
}

p {
  color: #555;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

input[type="email"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.success-message {
  color: #2ecc71;
  margin-top: 15px;
}

.error-message {
  color: #e74c3c;
  margin-top: 15px;
}

.back-to-login {
  margin-top: 20px;
}

.back-to-login a {
  color: #3498db;
  text-decoration: none;
}

.back-to-login a:hover {
  text-decoration: underline;
}
</style>
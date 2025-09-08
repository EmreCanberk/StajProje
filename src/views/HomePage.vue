<template>
  <div class="home-container">
    <header class="hero-section">
      <div class="hero-content">
        <div v-if="!isLoggedIn">
          <h1>Çözüm Seninle Başlar</h1>
          <p class="tagline">Geri bildirimlerinle geleceği şekillendir.</p>
          <button @click="handleComplaintClick" class="cta-button">Şikayetini Şimdi Paylaş</button>
        </div>
        
        <div v-else>
          <h1>Hoş Geldiniz!</h1>
          <p class="tagline">Tüm şikayetlerinizi görüntülemek için hazırsınız.</p>
          <router-link :to="complaintLink" class="cta-button">{{ buttonText }}</router-link>
        </div>
      </div>
    </header>

    <section class="info-section">
      <h2>Neden Bizi Seçmelisin?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <i class="fas fa-check-circle"></i>
          <h3>Hızlı ve Etkili</h3>
          <p>Şikayetleriniz en kısa sürede ilgili birime iletilir ve çözüm süreci hızla başlatılır.</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-eye"></i>
          <h3>Şeffaf Takip</h3>
          <p>Gönderdiğiniz her şikayetin durumunu anlık olarak takip edebilir, gelişmelerden haberdar olursunuz.</p>
        </div>
        <div class="feature-card">
          <i class="fas fa-users-cog"></i>
          <h3>Profesyonel Destek</h3>
          <p>Konusunda uzman ekibimiz, her adımda yanınızda olarak sorunlarınızı çözüme kavuşturur.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '@/firebaseConfig'; // <-- Hatanın düzeltildiği yer
// Dosya adınız firebaseConfig.js olduğu için @/firebaseConfig olarak değiştirdik.
// Eğer dosyanızın yolu src/firebase/config.js ise @/firebase/config olarak kalmalı.

const db = getFirestore(app);

export default {
  name: 'HomePage',
  data() {
    return {
      isLoggedIn: false,
      userRole: '', // Kullanıcı rolünü saklayacağız
    };
  },
  computed: {
    // Butonun linkini dinamik olarak ayarla
    complaintLink() {
      return this.userRole === 'admin' ? '/admin' : '/complaints';
    },
    // Butonun metnini dinamik olarak ayarla
    buttonText() {
      return this.userRole === 'admin' ? 'Yönetim Sayfasına Git' : 'Şikayetleri Görüntüle';
    },
  },
  mounted() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      this.isLoggedIn = !!user;
      if (user) {
        // Kullanıcı giriş yaptıysa, rolünü sorgula
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          this.userRole = docSnap.data().role;
        } else {
          // Kullanıcı kaydı bulunamazsa varsayılan rolü 'user' olarak ayarla
          this.userRole = 'user';
        }
      } else {
        // Kullanıcı çıkış yaptıysa
        this.userRole = '';
      }
    });
  },
  methods: {
    handleComplaintClick() {
      if (this.isLoggedIn) {
        this.$router.push('/new-complaint');
      } else {
        this.$router.push('/login');
      }
    },
  },
};
</script>

<style scoped>
/* Stiller öncekiyle aynı, değişiklik yok */
.home-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #1f2833, #34495e);
  color: #fff;
  padding: 100px 20px;
  text-align: center;
  overflow: hidden;
}
.hero-section::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 10%, transparent 10%), radial-gradient(circle, rgba(255, 255, 255, 0.05) 10%, transparent 10%);
  background-size: 50px 50px, 80px 80px;
  animation: bg-move 20s linear infinite;
  z-index: 1;
}
@keyframes bg-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-50px, -50px); }
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}
.hero-content h1 {
  font-size: 3.5em;
  margin-bottom: 10px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
.tagline {
  font-size: 1.4em;
  margin-bottom: 30px;
  font-style: italic;
  opacity: 0.9;
}
.cta-button {
  display: inline-block;
  padding: 16px 32px;
  background-color: #2ecc71;
  color: #fff;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.3s ease;
  box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
  cursor: pointer;
}
.cta-button:hover {
  background-color: #27ae60;
  transform: translateY(-3px);
}
.info-section {
  padding: 60px 20px;
  text-align: center;
}
.info-section h2 {
  font-size: 2.2em;
  color: #34495e;
  margin-bottom: 40px;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}
.feature-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  transition: transform 0.3s ease;
}
.feature-card:hover {
  transform: translateY(-10px);
}
.feature-card i {
  font-size: 2.5em;
  color: #3498db;
  margin-bottom: 15px;
}
.feature-card h3 {
  font-size: 1.5em;
  color: #34495e;
  margin-top: 0;
}
.feature-card p {
  color: #666;
  line-height: 1.6;
}
</style>
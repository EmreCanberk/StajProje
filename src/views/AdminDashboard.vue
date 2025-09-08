<template>
  <div class="dashboard-container">
    <h2>Admin Paneli</h2>
    
    <p v-if="loading">Yönetici bilgileri yükleniyor...</p>
    <p v-else-if="currentUserEmail">Yönetici olarak hoş geldiniz, {{ currentUserEmail }}!</p>
    <p v-else>Yönetici olarak hoş geldiniz!</p>

    <div class="analytics-section">
      <h3>Analizler</h3>
      <div class="dashboard-links">
        <router-link to="/admin-analytics" class="dashboard-link">Şikayet Analizleri</router-link>
        <router-link to="/admin-user-analytics" class="dashboard-link">Kullanıcı Analizleri</router-link>
      </div>
    </div>
    
    <div class="complaint-section">
      <h3>Şikayetler Listesi</h3>
      <ComplaintList />
    </div>

  </div>
</template>

<script>
import ComplaintList from '../components/ComplaintList.vue';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth'; // Yeni import

export default {
  name: 'AdminDashboard',
  components: {
    ComplaintList
  },
  data() {
    return {
      currentUserEmail: null,
      loading: true, // Yükleme durumu eklendi
    };
  },
  created() {
    // onAuthStateChanged ile kullanıcı durumu dinleniyor
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUserEmail = user.email;
      }
      this.loading = false; // Yükleme tamamlandı
    });
  }
};
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}
h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}
p {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 30px;
}
.analytics-section, .complaint-section {
  margin-bottom: 30px;
}
.analytics-section h3, .complaint-section h3 {
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
  color: #34495e;
}
.dashboard-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}
.dashboard-link {
  display: inline-block;
  padding: 12px 24px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.dashboard-link:hover {
  background-color: #2980b9;
}
</style>
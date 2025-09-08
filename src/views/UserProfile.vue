<template>
  <div class="profile-container">
    <h2>Profilim</h2>
    
    <div v-if="loading" class="loading-message">
      <p>Yükleniyor...</p>
    </div>

    <div v-else-if="currentUser" class="profile-card">
      <div class="profile-info">
        <p><strong>E-posta:</strong> {{ currentUser.email }}</p>
        <p><strong>Adınız:</strong> {{ currentUser.displayName || 'Henüz ayarlanmadı' }}</p>
      </div>

      <div class="user-stats">
        <h4>Şikayet İstatistikleri</h4>
        <div class="stats-grid">
          <div class="stat-box">
            <p class="stat-number">{{ totalComplaints }}</p>
            <span class="stat-label">Toplam Şikayet</span>
          </div>
          <div class="stat-box resolved">
            <p class="stat-number">{{ resolvedComplaints }}</p>
            <span class="stat-label">Çözüldü</span>
          </div>
          <div class="stat-box pending">
            <p class="stat-number">{{ pendingComplaints }}</p>
            <span class="stat-label">Beklemede</span>
          </div>
        </div>
      </div>
      
      <div class="chart-container" v-if="totalComplaints > 0">
        <h4>Şikayet Durumları</h4>
        <canvas id="userStatusChart"></canvas>
      </div>

      <form @submit.prevent="updateProfile" class="profile-form">
        <h4>Adımı Güncelle</h4>
        <input
          v-model="newDisplayName"
          type="text"
          placeholder="Yeni adınızı girin"
          required
        />
        <button type="submit" :disabled="isUpdating">
          {{ isUpdating ? 'Güncelleniyor...' : 'Kaydet' }}
        </button>
      </form>
    </div>

    <div v-else class="not-logged-in">
        <p>Profil bilgilerinizi görmek için giriş yapmalısınız.</p>
        <router-link to="/login">Giriş Yap</router-link>
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Chart from 'chart.js/auto';

export default {
  name: 'UserProfile',
  data() {
    return {
      currentUser: null,
      loading: true,
      newDisplayName: '',
      isUpdating: false,
      successMessage: '',
      errorMessage: '',
      complaints: [],
      unsubscribe: null,
      userStatusChart: null
    };
  },
  computed: {
    totalComplaints() {
      return this.complaints.length;
    },
    resolvedComplaints() {
      return this.complaints.filter(c => c.status === 'çözüldü').length;
    },
    pendingComplaints() {
      return this.complaints.filter(c => c.status === 'beklemede' || c.status === 'inceleniyor').length;
    },
  },
  mounted() {
    this.checkAuthState();
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.userStatusChart) {
      this.userStatusChart.destroy();
    }
  },
  methods: {
    checkAuthState() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.currentUser = user;
          this.newDisplayName = user.displayName || '';
          this.loading = false;
          this.setupComplaintListener(user.uid);
        } else {
          this.currentUser = null;
          this.loading = false;
        }
      });
    },
    setupComplaintListener(userId) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }

      const q = query(
        collection(db, 'complaints'),
        where('userId', '==', userId)
      );

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.$nextTick(() => {
            this.updateUserChart();
        });
      }, (error) => {
        console.error('Kullanıcı şikayetleri çekilirken hata oluştu:', error);
      });
    },
    async updateProfile() {
      this.isUpdating = true;
      this.successMessage = '';
      this.errorMessage = '';

      try {
        await updateProfile(auth.currentUser, {
          displayName: this.newDisplayName
        });
        
        this.successMessage = 'Profiliniz başarıyla güncellendi!';
        this.currentUser = auth.currentUser; 
      } catch (error) {
        console.error("Profil güncellenirken hata oluştu:", error);
        this.errorMessage = 'Profil güncellenemedi: ' + error.message;
      } finally {
        this.isUpdating = false;
        setTimeout(() => {
          this.successMessage = '';
          this.errorMessage = '';
        }, 5000);
      }
    },
    updateUserChart() {
      const ctx = document.getElementById('userStatusChart');
      if (!ctx) {
        return; 
      }

      const statusCounts = {
        'beklemede': this.pendingComplaints,
        'inceleniyor': this.complaints.filter(c => c.status === 'inceleniyor').length,
        'çözüldü': this.resolvedComplaints,
      };

      const labels = Object.keys(statusCounts);
      const data = Object.values(statusCounts);
      
      const backgroundColors = ['#f39c12', '#3498db', '#2ecc71'];

      if (this.userStatusChart) {
        this.userStatusChart.destroy();
      }

      this.userStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors.slice(0, labels.length)
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: false,
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
/* Mevcut stil kodlarınız */
.profile-container {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}
.profile-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.profile-info {
  margin-bottom: 20px;
  line-height: 1.6;
}
.profile-info p {
  margin: 0;
  font-size: 1.1em;
  color: #333;
}
.user-stats {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.user-stats h4 {
  margin-top: 0;
  color: #555;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}
.stat-box {
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}
.stat-box.resolved {
  background-color: #d4edda;
  color: #155724;
}
.stat-box.pending {
  background-color: #fff3cd;
  color: #856404;
}
.stat-number {
  font-size: 2em;
  font-weight: bold;
  margin: 0;
}
.stat-label {
  font-size: 0.9em;
  color: #666;
}
.stat-box.resolved .stat-label {
  color: #155724;
}
.stat-box.pending .stat-label {
  color: #856404;
}
.profile-form {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
}
.profile-form h4 {
  margin-top: 0;
  color: #555;
}
.profile-form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
  box-sizing: border-box;
}
.profile-form button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.profile-form button:hover {
  background-color: #2980b9;
}
.profile-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}
.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}
.chart-container {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.not-logged-in {
  text-align: center;
}
</style>
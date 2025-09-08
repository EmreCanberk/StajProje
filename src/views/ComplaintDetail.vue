<template>
  <div class="complaint-detail-container">
    <div v-if="loading" class="loading-message">
      <p>Şikayet detayları yükleniyor...</p>
    </div>

    <div v-else-if="complaint" class="detail-card">
      <div class="detail-header">
        <h2>Şikayet Detayı</h2>
        <router-link to="/admin-dashboard" class="back-link">
          &larr; Geri Dön
        </router-link>
      </div>

      <div class="detail-section">
        <p><strong>Şikayet Sahibi:</strong> {{ complaint.userName }} ({{ complaint.userEmail }})</p>
        <p><strong>Gönderilme Tarihi:</strong> {{ formatTimestamp(complaint.timestamp) }}</p>
        <p><strong>Durum:</strong> 
            <span class="status-badge" :class="complaint.status">{{ complaint.status }}</span>
        </p>
        <p><strong>Kategori:</strong> {{ complaint.category }}</p>
        <p><strong>Öncelik:</strong> 
            <span class="priority-badge" :class="getPriorityClass(complaint.priority)">{{ complaint.priority }}</span>
        </p>
      </div>

      <div class="detail-section" v-if="complaint.techDetails">
        <h4>Teknik Detaylar</h4>
        <p>{{ complaint.techDetails }}</p>
      </div>

      <div class="detail-section">
        <h4>Şikayet Mesajı</h4>
        <p>{{ complaint.message }}</p>
      </div>

      <div class="detail-section image-section" v-if="complaint.imageUrl">
        <h4>Eklenen Görsel</h4>
        <img :src="complaint.imageUrl" alt="Şikayet görseli" class="complaint-image">
      </div>

      <div class="detail-section">
        <h4>İşlemler</h4>
        <div class="admin-actions">
          <select v-model="selectedStatus" class="status-select">
            <option value="beklemede">Beklemede</option>
            <option value="inceleniyor">İnceleniyor</option>
            <option value="çözüldü">Çözüldü</option>
            <option value="reddedildi">Reddedildi</option>
          </select>
          <button @click="updateComplaintStatus" class="update-button">
            Durumu Güncelle
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found-message">
        <p>Şikayet bulunamadı.</p>
    </div>
  </div>
</template>

<script>
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default {
  name: 'ComplaintDetail',
  data() {
    return {
      complaint: null,
      loading: true,
      selectedStatus: '',
    };
  },
  async created() {
    await this.fetchComplaintDetails();
  },
  methods: {
    async fetchComplaintDetails() {
      const complaintId = this.$route.params.id;
      if (!complaintId) {
        this.loading = false;
        return;
      }

      this.loading = true;
      const complaintRef = doc(db, 'complaints', complaintId);
      try {
        const docSnap = await getDoc(complaintRef);
        if (docSnap.exists()) {
          this.complaint = { id: docSnap.id, ...docSnap.data() };
          this.selectedStatus = this.complaint.status;
        } else {
          console.log("Belge bulunamadı!");
          this.complaint = null;
        }
      } catch (error) {
        console.error("Şikayet verisi çekilirken hata oluştu:", error);
      } finally {
        this.loading = false;
      }
    },
    async updateComplaintStatus() {
      if (!this.selectedStatus) {
        alert("Lütfen bir durum seçin.");
        return;
      }
      try {
        const complaintRef = doc(db, 'complaints', this.complaint.id);
        await updateDoc(complaintRef, {
          status: this.selectedStatus
        });
        alert("Şikayet durumu başarıyla güncellendi.");
        this.complaint.status = this.selectedStatus; 
      } catch (error) {
        console.error("Güncelleme sırasında hata oluştu:", error);
        alert("Güncelleme sırasında bir hata oluştu: " + error.message);
      }
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return 'Yok';
      const date = timestamp.toDate();
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString('tr-TR', options);
    },
    getPriorityClass(priority) {
      if (!priority) return 'düşük';
      return priority.toLowerCase();
    }
  }
};
</script>

<style scoped>
.complaint-detail-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
}
.detail-card {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}
.back-link {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
}
.detail-section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}
.detail-section h4 {
  margin-top: 0;
  color: #555;
  border-left: 4px solid #3498db;
  padding-left: 10px;
}
.status-badge, .priority-badge {
  padding: 5px 10px;
  border-radius: 50px;
  color: white;
  font-weight: bold;
  font-size: 0.9em;
  text-transform: capitalize;
}
.status-badge.beklemede { background-color: #f39c12; }
.status-badge.inceleniyor { background-color: #3498db; }
.status-badge.çözüldü { background-color: #2ecc71; }
.status-badge.reddedildi { background-color: #e74c3c; }
.priority-badge.düşük { background-color: #2c3e50; }
.priority-badge.orta { background-color: #f1c40f; }
.priority-badge.yüksek { background-color: #e74c3c; }

.image-section {
  text-align: center;
}
.complaint-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.admin-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.status-select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.update-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}
.update-button:hover {
  background-color: #2980b9;
}
.loading-message, .not-found-message {
  text-align: center;
  margin-top: 50px;
}
</style>

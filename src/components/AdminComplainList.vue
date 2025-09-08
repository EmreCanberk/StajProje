<template>
  <div class="list-container">
    <h3>Yönetici Paneli</h3>
    <p>Şikayet Durumları Analizi</p>

    <div class="admin-links">
      <router-link to="/admin/users" class="admin-link">Kullanıcı Yönetimi</router-link>
    </div>
    <div class="analiz-kutulari">
      <div class="kutu toplam">
        <p>{{ totalComplaints }}</p>
        <span>Toplam</span>
      </div>
      <div class="kutu beklemede">
        <p>{{ pendingComplaints }}</p>
        <span>Beklemede</span>
      </div>
      <div class="kutu inceleniyor">
        <p>{{ inProgressComplaints }}</p>
        <span>İnceleniyor</span>
      </div>
      <div class="kutu cozuldu">
        <p>{{ resolvedComplaints }}</p>
        <span>Çözüldü</span>
      </div>
    </div>

    <hr class="divider">

    <div class="chart-container">
      <h4>Son 7 Günlük Şikayet Sayısı</h4>
      <canvas id="complaintChart"></canvas>
    </div>

    <hr class="divider">

    <div class="filter-container">
      <input type="text" v-model="searchText" placeholder="Şikayetlerde ara..." class="search-input">
      <select v-model="statusFilter" class="status-select">
        <option value="">Tüm Durumlar</option>
        <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
      </select>
      <label class="show-deleted-label">
        <input type="checkbox" v-model="showDeleted">
        Silinenleri Göster
      </label>
    </div>

    <p v-if="filteredComplaints.length === 0" class="empty-list-message">
      {{ complaints.length === 0 ? 'Henüz şikayet bulunmamaktadır.' : 'Arama kriterlerinize uygun şikayet bulunamadı.' }}
    </p>

    <ul v-else class="complaint-list">
      <li v-for="complaint in filteredComplaints" :key="complaint.id" :class="['complaint-item', { 'deleted': complaint.isDeleted }]">
        <div class="item-header">
          <strong>Gönderen:</strong> {{ complaint.name }} ({{ complaint.email }})
          <div class="header-actions">
            <span class="timestamp">{{ formatTimestamp(complaint.timestamp) }}</span>
            <select v-model="complaint.status" @change="updateStatus(complaint)" class="status-select-item">
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
            <button @click="toggleEdit(complaint)" class="action-button edit-button">
              {{ editingId === complaint.id ? 'Kaydet' : 'Düzenle' }}
            </button>
            <button @click="deleteComplaint(complaint.id)" class="action-button delete-button">
              Sil
            </button>
            <button @click="toggleResponses(complaint.id)" class="action-button responses-button">
              {{ showResponsesId === complaint.id ? 'Yanıtları Gizle' : 'Yanıtlar' }}
            </button>
          </div>
        </div>
        <div class="item-body">
          <p v-if="editingId !== complaint.id" class="complaint-message">
            **Kategori:** {{ complaint.category || 'Belirtilmemiş' }} |
            **Öncelik:** <span :class="['priority-badge', complaint.priority]">{{ complaint.priority || 'Belirtilmemiş' }}</span>
          </p>
          <p v-if="editingId !== complaint.id" class="complaint-message-text">
            {{ complaint.message }}
          </p>
          <textarea v-else v-model="complaint.message" rows="5" class="edit-textarea"></textarea>
        </div>
        <ComplaintResponse 
          v-if="showResponsesId === complaint.id" 
          :complaintId="complaint.id"
          :is-resolved="complaint.status === 'çözüldü'"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import ComplaintResponse from '../components/ComplaintResponse.vue'; 
import Chart from 'chart.js/auto';

export default {
  name: 'AdminComplaintList',
  components: {
    ComplaintResponse
  },
  data() {
    return {
      complaints: [],
      editingId: null,
      searchText: '',
      showDeleted: false,
      statusFilter: '',
      statuses: ['beklemede', 'inceleniyor', 'çözüldü', 'reddedildi'],
      showResponsesId: null,
      complaintChart: null
    };
  },
  mounted() {
    this.setupComplaintListener();
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  computed: {
    filteredComplaints() {
      let filtered = this.complaints;
      
      if (this.searchText) {
        const lowerSearchText = this.searchText.toLowerCase();
        filtered = filtered.filter(c => 
          (c.name && c.name.toLowerCase().includes(lowerSearchText)) ||
          (c.email && c.email.toLowerCase().includes(lowerSearchText)) ||
          (c.message && c.message.toLowerCase().includes(lowerSearchText))
        );
      }
      
      if (this.statusFilter) {
        filtered = filtered.filter(c => c.status === this.statusFilter);
      }
      
      if (!this.showDeleted) {
        filtered = filtered.filter(c => c.isDeleted !== true);
      }

      return filtered;
    },
    totalComplaints() {
      return this.complaints.length;
    },
    pendingComplaints() {
      return this.complaints.filter(c => c.status === 'beklemede').length;
    },
    inProgressComplaints() {
      return this.complaints.filter(c => c.status === 'inceleniyor').length;
    },
    resolvedComplaints() {
      return this.complaints.filter(c => c.status === 'çözüldü').length;
    }
  },
  watch: {
    showDeleted() {
      this.setupComplaintListener();
    }
  },
  methods: {
    setupComplaintListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }

      const complaintsCollection = collection(db, 'complaints');
      
      const q = query(complaintsCollection, orderBy('timestamp', 'desc'));

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.$nextTick(() => {
          this.updateChart();
        });
      }, (error) => {
        console.error('Şikayetler çekilirken hata oluştu:', error);
        alert('Şikayetler yüklenirken hata oluştu: ' + error.message);
      });
    },
    updateChart() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const complaintsLast7Days = this.complaints.filter(c => 
        c.timestamp && c.timestamp.toDate() >= sevenDaysAgo
      );

      const complaintCounts = {};
      const dateLabels = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        complaintCounts[dateStr] = 0;
        dateLabels.push(d.toLocaleDateString()); // Tarih formatını daha okunur hale getirme
      }

      complaintsLast7Days.forEach(c => {
        const dateStr = c.timestamp.toDate().toISOString().split('T')[0];
        const dateKey = new Date(dateStr).toLocaleDateString();
        const index = dateLabels.indexOf(dateKey);
        if (index > -1) {
          const originalDateStr = dateLabels[index];
          if (complaintCounts[originalDateStr] !== undefined) {
             complaintCounts[originalDateStr]++;
          }
        }
      });
      
      // complaintCounts objesini dateLabels'a göre sıralama
      const sortedChartData = dateLabels.map(date => complaintCounts[date] || 0);

      const ctx = document.getElementById('complaintChart');
      if (this.complaintChart) {
        this.complaintChart.destroy();
      }

      this.complaintChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dateLabels,
          datasets: [{
            label: 'Günlük Şikayet Sayısı',
            data: sortedChartData,
            borderColor: '#3498db',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    },
    formatTimestamp(timestamp) {
      if (timestamp && timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      return 'Bilinmiyor';
    },
    toggleEdit(complaint) {
      if (this.editingId === complaint.id) {
        this.saveEdit(complaint);
      } else {
        this.editingId = complaint.id;
      }
    },
    async saveEdit(complaint) {
      try {
        const complaintRef = doc(db, 'complaints', complaint.id);
        await updateDoc(complaintRef, {
          message: complaint.message
        });
        this.editingId = null;
        alert('Şikayet başarıyla güncellendi.');
      } catch (error) {
      }
    },
    async deleteComplaint(id) {
      if (confirm('Bu şikayeti silmek istediğinize emin misiniz?')) {
        try {
          const complaintRef = doc(db, 'complaints', id);
          await updateDoc(complaintRef, {
            isDeleted: true
          });
          alert('Şikayet başarıyla silindi (arşivlendi).');
        } catch (error) {
        }
      }
    },
    async updateStatus(complaint) {
      try {
        const complaintRef = doc(db, 'complaints', complaint.id);
        await updateDoc(complaintRef, {
          status: complaint.status
        });
      } catch (error) {
      }
    },
    toggleResponses(complaintId) {
      if (this.showResponsesId === complaintId) {
        this.showResponsesId = null;
      } else {
        this.showResponsesId = complaintId;
      }
    }
  }
};
</script>

<style scoped>
/* Mevcut stiller */
.list-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}
.divider {
  border: 0;
  height: 1px;
  background: #eee;
  margin: 20px 0;
}
.filter-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}
.search-input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.status-select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.show-deleted-label {
  font-size: 0.9em;
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
}
.complaint-list {
  list-style: none;
  padding: 0;
}
.complaint-item {
  border: 1px solid #eee;
  border-radius: 6px;
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  text-align: left;
  position: relative;
}
.complaint-item.deleted {
  background-color: #fcebeb;
  opacity: 0.7;
  border-color: #e74c3c;
}
.empty-list-message {
  color: #888;
  font-style: italic;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 0.9em;
  color: #666;
}
.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.action-button {
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.8em;
  color: white;
}
.edit-button {
  background-color: #3498db;
}
.edit-button:hover {
  background-color: #2980b9;
}
.delete-button {
  background-color: #e74c3c;
}
.delete-button:hover {
  background-color: #c0392b;
}
.item-body {
  margin-top: 10px;
}
.complaint-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  color: #333;
}
.complaint-message-text {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 10px 0 0;
  color: #333;
}
.timestamp {
  font-style: italic;
  font-size: 0.8em;
  color: #888;
}
.status-select-item {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8em;
}
.responses-button {
  background-color: #f39c12;
  color: white;
}
.responses-button:hover {
  background-color: #e67e22;
}

.analiz-kutulari {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  text-align: center;
}
.kutu {
  flex: 1;
  min-width: 120px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: white;
}
.kutu p {
  font-size: 2em;
  font-weight: bold;
  margin: 0;
}
.kutu span {
  font-size: 0.9em;
}
.kutu.toplam { background-color: #555; }
.kutu.beklemede { background-color: #f39c12; }
.kutu.inceleniyor { background-color: #3498db; }
.kutu.cozuldu { background-color: #2ecc71; }

/* Yeni Stil: Grafik */
.chart-container {
  max-width: 760px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fdfdfd;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
.priority-badge {
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
  font-size: 0.8em;
  font-weight: bold;
}
.priority-badge.Düşük {
  background-color: #2ecc71;
}
.priority-badge.Orta {
  background-color: #f39c12;
}
.priority-badge.Yüksek {
  background-color: #e74c3c;
}
</style>
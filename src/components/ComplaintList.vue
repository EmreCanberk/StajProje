<template>
  <div class="complaint-list-container">
    <div class="header-controls">
      <input 
        v-model="searchTerm" 
        placeholder="Şikayetlerde ara..." 
        type="text" 
        class="search-input"
      />
      <select v-model="selectedStatus" class="status-select">
        <option value="all">Tüm Durumlar</option>
        <option value="beklemede">Beklemede</option>
        <option value="inceleniyor">İnceleniyor</option>
        <option value="çözüldü">Çözüldü</option>
        <option value="reddedildi">Reddedildi</option>
      </select>
      
      <select v-model="selectedCategory" class="category-select">
        <option value="all">Tüm Kategoriler</option>
        <option value="Teknik Sorun">Teknik Sorun</option>
        <option value="Fatura Sorunu">Fatura Sorunu</option>
        <option value="Hizmet Kalitesi">Hizmet Kalitesi</option>
        <option value="Genel Öneri">Genel Öneri</option>
        <option value="Diğer">Diğer</option>
      </select>
      
      <label class="toggle-deleted">
        <input type="checkbox" v-model="showDeleted" />
        Silinenleri Göster
      </label>

      <label class="toggle-resolved">
        <input type="checkbox" v-model="showResolved" />
        Çözülenleri Göster
      </label>
    </div>

    <div v-if="loading" class="loading-message">
      <p>Şikayetler yükleniyor...</p>
    </div>
    
    <p v-else-if="filteredComplaints.length === 0" class="empty-list-message">
      {{ emptyMessage }}
    </p>

    <ul v-else class="complaint-list">
      <li v-for="complaint in filteredComplaints" :key="complaint.id" class="complaint-item">
        <router-link :to="`/admin/complaint/${complaint.id}`" class="complaint-link">
          <div class="item-header">
            <div class="item-info">
              <span class="user-info">
                <strong>Gönderen:</strong> {{ complaint.userName }} ({{ complaint.userEmail }})
              </span>
              <span class="timestamp">{{ formatTimestamp(complaint.timestamp) }}</span>
            </div>
            <span class="priority-badge" :class="getPriorityClass(complaint.priority)">{{ complaint.priority }}</span>
            <span class="category-badge">{{ complaint.category || 'Belirtilmemiş' }}</span>
          </div>
          <div class="item-body">
            <p class="complaint-message">{{ complaint.message }}</p>
          </div>
        </router-link>

        <div class="item-footer">
          <select v-model="complaint.status" @change="updateComplaintStatus(complaint)">
            <option value="beklemede">beklemede</option>
            <option value="inceleniyor">inceleniyor</option>
            <option value="çözüldü">çözüldü</option>
            <option value="reddedildi">reddedildi</option>
          </select>
          <button @click="editComplaint(complaint)" class="action-button edit">Düzenle</button>
          <button @click="deleteComplaint(complaint.id)" class="action-button delete">Sil</button>
          <button @click="toggleResponses(complaint.id)" class="action-button respond">Yanıtlar</button>
        </div>
        <ComplaintResponse 
          v-if="showResponsesId === complaint.id" 
          :complaintId="complaint.id"
          :is-resolved="complaint.status === 'çözüldü'"
        />
      </li>
    </ul>

    <ComplaintEditModal 
      :visible="isModalVisible" 
      :complaint="selectedComplaint" 
      @close="isModalVisible = false" 
    />
  </div>
</template>

<script>
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import ComplaintEditModal from './ComplaintEditModal.vue';
import ComplaintResponse from './ComplaintResponse.vue';

export default {
  name: 'ComplaintList',
  components: {
    ComplaintEditModal,
    ComplaintResponse
  },
  data() {
    return {
      complaints: [],
      loading: true,
      searchTerm: '',
      selectedStatus: 'all',
      selectedCategory: 'all',
      showDeleted: false,
      isModalVisible: false,
      selectedComplaint: null,
      unsubscribe: null,
      showResponsesId: null,
      showResolved: false // YENİ EKLENEN data
    };
  },
  computed: {
    filteredComplaints() {
      let filtered = this.complaints;

      // YENİ FİLTRELEME MANTIĞI EKLENDİ
      if (!this.showResolved) {
        filtered = filtered.filter(c => c.status !== 'çözüldü');
      }

      if (this.selectedStatus !== 'all') {
        filtered = filtered.filter(c => c.status === this.selectedStatus);
      }
      
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(c => c.category === this.selectedCategory);
      }

      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        filtered = filtered.filter(c => 
          (c.message && c.message.toLowerCase().includes(term)) ||
          (c.userEmail && c.userEmail.toLowerCase().includes(term)) ||
          (c.userName && c.userName.toLowerCase().includes(term))
        );
      }
      
      if (!this.showDeleted) {
        filtered = filtered.filter(c => !c.deleted);
      }
      
      return filtered;
    },
    emptyMessage() {
      if (this.searchTerm || this.selectedStatus !== 'all' || this.selectedCategory !== 'all' || !this.showResolved) {
        return "Filtrenizle eşleşen şikayet bulunamadı.";
      }
      return "Henüz hiç şikayet bulunmamaktadır.";
    }
  },
  mounted() {
    this.setupComplaintListener();
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    setupComplaintListener() {
      const q = collection(db, 'complaints');
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.loading = false;
      }, (error) => {
        console.error('Şikayetler çekilirken hata oluştu:', error);
        this.loading = false;
      });
    },
    async updateComplaintStatus(complaint) {
      try {
        const complaintRef = doc(db, 'complaints', complaint.id);
        await updateDoc(complaintRef, {
          status: complaint.status
        });
        alert('Şikayet durumu güncellendi.');
      } catch (error) {
        console.error("Şikayet durumu güncellenirken hata oluştu:", error);
        alert('Durum güncelleme başarısız: ' + error.message);
      }
    },
    editComplaint(complaint) {
      this.selectedComplaint = { ...complaint };
      this.isModalVisible = true;
    },
    async deleteComplaint(id) {
      if (confirm('Bu şikayeti silmek istediğinizden emin misunuz?')) {
        try {
          const complaintRef = doc(db, 'complaints', id);
          await updateDoc(complaintRef, {
            deleted: true
          });
          alert('Şikayet silindi.');
        } catch (error) {
          console.error("Şikayet silinirken hata oluştu:", error);
          alert('Silme başarısız: ' + error.message);
        }
      }
    },
    formatTimestamp(timestamp) {
      if (timestamp && timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      return 'Bilinmiyor';
    },
    toggleResponses(complaintId) {
      if (this.showResponsesId === complaintId) {
        this.showResponsesId = null;
      } else {
        this.showResponsesId = complaintId;
      }
    },
    getPriorityClass(priority) {
      if (!priority) return 'düşük';
      return priority.toLowerCase();
    }
  }
};
</script>

<style scoped>
.complaint-list-container {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.search-input, .status-select, .category-select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9em;
}
.search-input {
  flex: 2;
  min-width: 180px;
}
.status-select, .category-select {
  flex: 1;
  min-width: 120px;
}
.toggle-deleted, .toggle-resolved {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9em;
  color: #555;
  cursor: pointer;
}
.complaint-list {
  list-style-type: none;
  padding: 0;
}
.complaint-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
}
.complaint-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
.complaint-link {
  text-decoration: none;
  color: inherit;
  display: block;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.item-info {
  display: flex;
  flex-direction: column;
}
.user-info {
  font-size: 1em;
  color: #333;
}
.timestamp {
  font-size: 0.8em;
  color: #888;
  font-style: italic;
}
.category-badge {
  background-color: #34495e;
  color: white;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: bold;
}
.priority-badge {
  padding: 5px 10px;
  border-radius: 50px;
  color: white;
  font-weight: bold;
  font-size: 0.8em;
  text-transform: capitalize;
}
.priority-badge.düşük { background-color: #2c3e50; }
.priority-badge.orta { background-color: #f1c40f; }
.priority-badge.yüksek { background-color: #e74c3c; }

.complaint-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-size: 1em;
  color: #444;
}
.item-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 15px;
}
.item-footer select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.action-button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}
.action-button.edit { background-color: #3498db; }
.action-button.edit:hover { background-color: #2980b9; }
.action-button.delete { background-color: #e74c3c; }
.action-button.delete:hover { background-color: #c0392b; }
.action-button.respond { background-color: #f39c12; }
.action-button.respond:hover { background-color: #e67e22; }
.loading-message, .empty-list-message {
  text-align: center;
  color: #888;
  font-style: italic;
  margin-top: 20px;
}
</style>
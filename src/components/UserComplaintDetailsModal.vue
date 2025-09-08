<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <span class="close-button" @click="closeModal">&times;</span>
      <h3>{{ userEmail }} Şikayet Detayları</h3>
      
      <div v-if="loading" class="loading-message">
        <p>Veriler yükleniyor...</p>
      </div>

      <div v-else class="details-grid">
        <div class="detail-box">
          <p class="detail-number">{{ totalComplaints }}</p>
          <span class="detail-label">Toplam Şikayet</span>
        </div>
        <div class="detail-box beklemede">
          <p class="detail-number">{{ pendingComplaints }}</p>
          <span class="detail-label">Beklemede</span>
        </div>
        <div class="detail-box inceleniyor">
          <p class="detail-number">{{ inProgressComplaints }}</p>
          <span class="detail-label">İnceleniyor</span>
        </div>
        <div class="detail-box cozuldu">
          <p class="detail-number">{{ resolvedComplaints }}</p>
          <span class="detail-label">Çözüldü</span>
        </div>
      </div>
      
      <p v-if="totalComplaints === 0 && !loading" class="empty-message">Bu kullanıcının hiç şikayeti bulunmamaktadır.</p>
    </div>
  </div>
</template>

<script>
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default {
  name: 'UserComplaintDetailsModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    userId: {
      type: String,
      default: null
    },
    userEmail: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      complaints: [],
      loading: true,
      unsubscribe: null
    };
  },
  computed: {
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
    userId(newId) {
      if (newId) {
        this.fetchUserComplaints(newId);
      } else {
        this.closeModal();
      }
    }
  },
  methods: {
    fetchUserComplaints(userId) {
      this.loading = true;
      if (this.unsubscribe) {
        this.unsubscribe();
      }

      const q = query(
        collection(db, 'complaints'),
        where('userId', '==', userId)
      );

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.loading = false;
      }, (error) => {
        console.error('Kullanıcı şikayetleri çekilirken hata oluştu:', error);
        this.loading = false;
      });
    },
    closeModal() {
      this.$emit('close');
    }
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  position: relative;
  text-align: center;
}
.close-button {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 2em;
  font-weight: bold;
  color: #888;
  cursor: pointer;
}
.close-button:hover {
  color: #333;
}
h3 {
  margin-top: 0;
  color: #34495e;
}
.details-grid {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
}
.detail-box {
  flex: 1;
  min-width: 100px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f0f0f0;
}
.detail-box.beklemede { background-color: #fff3cd; color: #856404; }
.detail-box.inceleniyor { background-color: #d4edda; color: #155724; }
.detail-box.cozuldu { background-color: #cce5ff; color: #004085; }
.detail-number {
  font-size: 2em;
  font-weight: bold;
  margin: 0;
}
.detail-label {
  font-size: 0.9em;
  color: #555;
}
.empty-message {
  font-style: italic;
  color: #888;
  margin-top: 20px;
}
</style>
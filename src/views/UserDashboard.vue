<template>
  <div class="user-dashboard-container">
    <h2>Kullanıcı Paneli</h2>
    <p>Hoş geldiniz, {{ currentUserEmail }}!</p>

    <div class="dashboard-links">
      <router-link to="/user-profile" class="dashboard-link">Profilim</router-link>
    </div>
    
    <ComplaintForm />
    
    <hr class="divider">

    <h3>Gönderdiğiniz Şikayetler</h3>
    <p v-if="complaints.length === 0" class="empty-list-message">
      Henüz bir şikayet göndermediniz.
    </p>
    <ul v-else class="complaint-list">
      <li v-for="complaint in complaints" :key="complaint.id" class="complaint-item">
        <div class="item-header">
          <span class="status-badge" :class="complaint.status">{{ complaint.status }}</span>
          <span class="timestamp">{{ formatTimestamp(complaint.timestamp) }}</span>
        </div>
        <div class="item-body">
          <p class="complaint-message">{{ complaint.message }}</p>
        </div>
        <div class="item-footer">
          <span class="response-count">{{ getResponseCount(complaint.id) }} Yanıt</span>
          <button @click="toggleResponses(complaint.id)" class="responses-button">
            {{ showResponsesId === complaint.id ? 'Yanıtları Gizle' : 'Yanıtları Görüntüle' }}
          </button>
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
import ComplaintForm from '../components/ComplaintForm.vue';
import ComplaintResponse from '../components/ComplaintResponse.vue';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'UserDashboard',
  components: {
    ComplaintForm,
    ComplaintResponse
  },
  data() {
    return {
      currentUserEmail: '',
      complaints: [],
      responseCounts: {},
      unsubscribe: null,
      showResponsesId: null
    };
  },
  mounted() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUserEmail = user.email;
        this.setupComplaintListener(user.uid);
      }
    });
  },
  beforeUnmount() {
    if (this.unsubscribe) {
        this.unsubscribe();
    }
  },
  methods: {
    setupComplaintListener(userId) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }

      const q = query(
        collection(db, 'complaints'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.complaints.forEach(complaint => {
          this.fetchResponseCount(complaint.id);
        });
      }, (error) => {
        console.error('Şikayetler çekilirken hata oluştu:', error);
      });
    },
    async fetchResponseCount(complaintId) {
      const q = query(collection(db, 'complaint_responses'), where('complaintId', '==', complaintId));
      onSnapshot(q, (snapshot) => {
        this.responseCounts = {
          ...this.responseCounts,
          [complaintId]: snapshot.size
        };
      }, (error) => {
        console.error("Yanıt sayısı çekilirken hata oluştu:", error);
      });
    },
    getResponseCount(complaintId) {
      return this.responseCounts[complaintId] || 0;
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
    }
  }
};
</script>

<style scoped>
.user-dashboard-container {
  padding: 20px;
  max-width: 800px;
  margin: 30px auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}
p {
  font-size: 1.1em;
  color: #555;
  margin-bottom: 20px;
}
.divider {
  border: 0;
  height: 1px;
  background: #eee;
  margin: 30px 0;
}
.complaint-list {
  list-style: none;
  padding: 0;
}
.complaint-item {
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
  text-align: left;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.item-body {
  margin-bottom: 15px;
}
.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.response-count {
  font-size: 0.9em;
  color: #555;
  font-style: italic;
}
.status-badge {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.9em;
  color: white;
  font-weight: bold;
}
.status-badge.beklemede { background-color: #f39c12; }
.status-badge.inceleniyor { background-color: #3498db; }
.status-badge.çözüldü { background-color: #2ecc71; }
.status-badge.reddedildi { background-color: #e74c3c; }
.timestamp {
  font-style: italic;
  font-size: 0.8em;
  color: #888;
}
.complaint-message {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  color: #333;
}
.responses-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}
.responses-button:hover {
  background-color: #2980b9;
}
.empty-list-message {
  color: #888;
  font-style: italic;
}
.dashboard-links {
  margin-bottom: 20px;
}
.dashboard-link {
  display: inline-block;
  padding: 10px 15px;
  background-color: #2c3e50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.dashboard-link:hover {
  background-color: #34495e;
}
</style>
<template>
  <div class="user-analytics-container">
    <h3>Kullanıcı Şikayet Analizi</h3>
    <p>Kullanıcıların gönderdiği şikayet sayısına göre sıralı liste.</p>
    
    <div v-if="loading" class="loading-message">
      <p>Kullanıcı verileri yükleniyor...</p>
    </div>

    <div v-else class="user-analytics-list-wrapper">
      <ul class="user-analytics-list">
        <li 
          v-for="user in sortedUsers" 
          :key="user.id" 
          class="user-analytics-item" 
          @click="showDetails(user.id, user.email)"
        >
          <div class="user-info">
            <strong>{{ user.displayName || 'İsimsiz Kullanıcı' }}</strong>
            <span class="user-email">{{ user.email }}</span>
          </div>
          <div class="complaint-count">
            <strong>{{ user.complaintCount }}</strong> Şikayet
          </div>
        </li>
      </ul>
      <p v-if="sortedUsers.length === 0" class="empty-list-message">
        Sistemde şikayet gönderen kullanıcı bulunmamaktadır.
      </p>
    </div>

    <UserComplaintDetailsModal 
      :visible="isModalVisible" 
      :user-id="selectedUserId"
      :user-email="selectedUserEmail"
      @close="isModalVisible = false"
    />
  </div>
</template>

<script>
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import UserComplaintDetailsModal from '../components/UserComplaintDetailsModal.vue'; // <-- YENİ EKLENDİ

export default {
  name: 'AdminUserAnalytics',
  components: {
    UserComplaintDetailsModal // <-- YENİ EKLENDİ
  },
  data() {
    return {
      users: [],
      loading: true,
      isModalVisible: false, // <-- YENİ EKLENDİ
      selectedUserId: null,  // <-- YENİ EKLENDİ
      selectedUserEmail: '', // <-- YENİ EKLENDİ
    };
  },
  computed: {
    sortedUsers() {
      return [...this.users].sort((a, b) => b.complaintCount - a.complaintCount);
    },
  },
  mounted() {
    this.fetchUserAnalytics();
  },
  methods: {
    async fetchUserAnalytics() {
      this.loading = true;
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const complaintsCollection = collection(db, 'complaints');
        const complaintsSnapshot = await getDocs(complaintsCollection);
        const complaintsData = complaintsSnapshot.docs.map(doc => doc.data());

        const userComplaintCounts = complaintsData.reduce((acc, complaint) => {
          if (complaint.userId) {
            acc[complaint.userId] = (acc[complaint.userId] || 0) + 1;
          }
          return acc;
        }, {});

        this.users = usersData.map(user => ({
          ...user,
          complaintCount: userComplaintCounts[user.id] || 0
        }));
      } catch (error) {
        console.error("Kullanıcı analizi verileri çekilirken hata oluştu:", error);
      } finally {
        this.loading = false;
      }
    },
    // Yeni eklenen metot
    showDetails(userId, userEmail) {
      this.selectedUserId = userId;
      this.selectedUserEmail = userEmail;
      this.isModalVisible = true;
    }
  },
};
</script>

<style scoped>
.user-analytics-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: left;
}
.user-analytics-list-wrapper {
  margin-top: 20px;
}
.user-analytics-list {
  list-style-type: none;
  padding: 0;
}
.user-analytics-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.user-analytics-item:hover {
  background-color: #e0e0e0;
}
.user-analytics-item:last-child {
  border-bottom: none;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.user-email {
  font-size: 0.9em;
  color: #888;
}
.complaint-count {
  font-size: 1.2em;
  font-weight: bold;
  color: #3498db;
}
.empty-list-message {
  font-style: italic;
  color: #888;
  text-align: center;
}
</style>
<template>
  <div class="user-list-container">
    <h3>Kullanıcı Yönetimi</h3>
    <p>Sistemdeki tüm kullanıcıları ve rollerini yönetin.</p>
    
    <div v-if="loading" class="loading-message">
      <p>Kullanıcılar yükleniyor...</p>
    </div>

    <p v-else-if="users.length === 0" class="empty-list-message">
      Henüz sistemde kullanıcı bulunmamaktadır.
    </p>

    <ul v-else class="user-list">
      <li v-for="user in users" :key="user.id" class="user-item">
        <div class="user-info">
          <strong>Email:</strong> {{ user.email }}
          <span class="role-badge" :class="user.role">{{ user.role }}</span>
        </div>
        <div class="user-actions">
          <select v-model="user.role" @change="updateUserRole(user.id, user.role)">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from '../firebaseConfig';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';

export default {
  name: 'AdminUserList',
  data() {
    return {
      users: [],
      loading: true
    };
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);
        
        this.users = querySnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
      } catch (error) {
        console.error("Kullanıcılar çekilirken hata oluştu:", error);
        alert('Kullanıcı listesi yüklenemedi.');
      } finally {
        this.loading = false;
      }
    },
    async updateUserRole(userId, newRole) {
      if (confirm(`${userId} ID'li kullanıcının rolünü '${newRole}' olarak değiştirmek istediğinizden emin misiniz?`)) {
        try {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            role: newRole
          });
          alert('Kullanıcı rolü başarıyla güncellendi.');
        } catch (error) {
          console.error("Rol güncellenirken hata oluştu:", error);
          alert('Rol güncelleme başarısız: ' + error.message);
        }
      }
    }
  }
};
</script>

<style scoped>
.user-list-container {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  color: #2c3e50;
  margin-bottom: 5px;
}

.user-list {
  list-style: none;
  padding: 0;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.user-item:last-child {
  border-bottom: none;
}

.user-info {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 15px;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 12px;
  color: white;
  font-size: 0.8em;
  font-weight: bold;
}

.role-badge.admin {
  background-color: #e74c3c;
}

.role-badge.user {
  background-color: #3498db;
}

.user-actions select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f9f9f9;
}
</style>
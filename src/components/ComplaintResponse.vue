<template>
  <div class="response-container">
    <h4>Yanıtlar</h4>
    <div v-if="responses.length > 0" class="responses-list">
      <div v-for="response in responses" :key="response.id" class="response-item" :class="{ 'admin-response': response.isAdmin }">
        <strong>{{ response.userEmail }}:</strong>
        <p>{{ response.responseMessage }}</p>
        <small>{{ formatTimestamp(response.timestamp) }}</small>
      </div>
    </div>
    <div v-else class="no-responses">
      Henüz bir yanıt bulunmamaktadır.
    </div>

    <div v-if="responseSuccess && !isAdmin" class="success-message">
      <p>Yanıtınız başarıyla gönderildi!</p>
      <p>En geç 2 iş günü içinde size geri dönüş sağlanacaktır.</p>
    </div>

    <div v-if="isResolved" class="resolved-message">
      <p>Bu şikayet çözüldü ve yeni yanıtlar gönderilemiyor.</p>
    </div>

    <form @submit.prevent="submitResponse" class="response-form" v-else>
      <textarea v-model="newResponse" placeholder="Yanıtınızı buraya yazın..." required :disabled="isResolved"></textarea>
      <button type="submit" :disabled="isResolved">Yanıt Gönder</button>
    </form>
  </div>
</template>

<script>
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'ComplaintResponse',
  props: {
    complaintId: {
      type: String,
      required: true
    },
    isResolved: { // Yeni prop: Şikayetin çözülüp çözülmediği
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      newResponse: '',
      responses: [],
      unsubscribe: null,
      responseSuccess: false,
      isAdmin: false
    };
  },
  mounted() {
    this.checkAdminStatus();
    this.setupResponseListener();
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    async checkAdminStatus() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            this.isAdmin = true;
          } else {
            this.isAdmin = false;
          }
        }
      });
    },
    setupResponseListener() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      const q = query(
        collection(db, 'complaint_responses'),
        where('complaintId', '==', this.complaintId),
        orderBy('timestamp', 'asc')
      );

      this.unsubscribe = onSnapshot(q, async (snapshot) => {
        const responsesWithAdminStatus = await Promise.all(snapshot.docs.map(async (d) => {
          const data = d.data();
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';
          return { id: d.id, ...data, isAdmin };
        }));
        this.responses = responsesWithAdminStatus;
      }, (error) => {
        console.error("Yanıtlar çekilirken hata oluştu:", error);
      });
    },
    async submitResponse() {
      if (this.isResolved) { // Kilitleme kontrolü
        return;
      }
      if (!this.newResponse.trim()) return;

      try {
        const user = auth.currentUser;
        if (!user) {
          alert('Yanıt göndermek için giriş yapmalısınız.');
          return;
        }

        await addDoc(collection(db, 'complaint_responses'), {
          complaintId: this.complaintId,
          userId: user.uid,
          userEmail: user.email,
          responseMessage: this.newResponse,
          timestamp: serverTimestamp()
        });

        this.newResponse = '';
        this.responseSuccess = true;
        
        setTimeout(() => {
          this.responseSuccess = false;
        }, 5000);

      } catch (error) {
        console.error('Yanıt gönderilirken hata oluştu:', error);
        alert('Yanıt gönderilirken hata oluştu: ' + error.message);
      }
    },
    formatTimestamp(timestamp) {
      if (timestamp && timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      return 'Bilinmiyor';
    }
  }
};
</script>

<style scoped>
.response-container {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f4f7;
  border-radius: 8px;
}
.responses-list {
  margin-bottom: 20px;
}
.response-item {
  background-color: #ffffff;
  padding: 15px;
  border-left: 5px solid #3498db;
  border-radius: 6px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.response-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.response-item.admin-response {
  background-color: #e8f5e9;
  border-left-color: #2ecc71;
}

.response-item strong {
  color: #2c3e50;
}

.response-item.admin-response strong {
  color: #1a632e;
}

.response-item p {
  margin: 10px 0;
  white-space: pre-wrap;
  color: #333;
}
.response-item small {
  display: block;
  text-align: right;
  color: #7f8c8d;
  font-style: italic;
  font-size: 0.8em;
}
.no-responses {
  color: #888;
  font-style: italic;
  margin-bottom: 20px;
}
.response-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  resize: vertical;
  margin-bottom: 10px;
  font-family: inherit;
}
.response-form textarea:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}
.response-form button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}
.response-form button:hover {
  background-color: #2980b9;
}
.response-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.success-message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  text-align: center;
}
.resolved-message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  text-align: center;
}
</style>
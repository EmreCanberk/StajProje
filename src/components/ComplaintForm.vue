<template>
  <div class="form-container">
    <h3>Şikayet / Öneri Gönder</h3>
    <form @submit.prevent="submitComplaint" class="complaint-form">
      
      <label for="category">Kategori Seçin:</label>
      <select id="category" v-model="category" required>
        <option value="" disabled>Lütfen bir kategori seçin</option>
        <option value="Teknik Sorun">Teknik Sorun</option>
        <option value="Fatura Sorunu">Fatura Sorunu</option>
        <option value="Hizmet Kalitesi">Hizmet Kalitesi</option>
        <option value="Genel Öneri">Genel Öneri</option>
        <option value="Diğer">Diğer</option>
      </select>
      
      <label for="priority">Öncelik Seviyesi:</label>
      <select id="priority" v-model="priority" required>
        <option value="düşük">Düşük</option>
        <option value="orta">Orta</option>
        <option value="yüksek">Yüksek</option>
      </select>
      
      <div v-if="category === 'Teknik Sorun'">
        <label for="techDetails">Teknik Detaylar (Cihaz modeli, işletim sistemi vb.):</label>
        <input
          type="text"
          id="techDetails"
          v-model="techDetails"
          placeholder="Örn: iPhone 14, iOS 17"
        />
      </div>

      <label for="message">Mesajınız:</label>
      <textarea
        id="message"
        v-model="message"
        placeholder="Şikayet veya önerinizi buraya yazın..."
        rows="5"
        required
      ></textarea>
      
      <label for="file">Görsel Ekle (isteğe bağlı):</label>
      <input type="file" id="file" @change="handleFileChange" accept="image/*">
      <p v-if="fileName" class="file-name-display">{{ fileName }} seçildi.</p>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Gönderiliyor...' : 'Gönder' }}
      </button>
    </form>

    <NotificationMessage :message="successMessage" type="success" />
    <NotificationMessage :message="errorMessage" type="error" />
  </div>
</template>

<script>
import { auth, db, storage } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import NotificationMessage from './NotificationMessage.vue';

export default {
  name: 'ComplaintForm',
  components: {
    NotificationMessage
  },
  data() {
    return {
      message: '',
      category: '',
      priority: 'düşük', // Varsayılan öncelik belirlendi
      techDetails: '',
      selectedFile: null,
      fileName: '',
      isSubmitting: false,
      successMessage: '',
      errorMessage: ''
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.fileName = file.name;
      } else {
        this.selectedFile = null;
        this.fileName = '';
      }
    },
    async submitComplaint() {
      this.isSubmitting = true;
      this.successMessage = '';
      this.errorMessage = '';

      const user = auth.currentUser;
      if (!user) {
        this.errorMessage = 'Şikayet göndermek için giriş yapmalısınız.';
        this.isSubmitting = false;
        return;
      }

      if (!this.category) {
        this.errorMessage = 'Lütfen bir şikayet kategorisi seçin.';
        this.isSubmitting = false;
        setTimeout(() => this.errorMessage = '', 5000);
        return;
      }

      let imageUrl = null;
      if (this.selectedFile) {
        try {
          const storageRef = ref(storage, `complaint_images/${user.uid}/${this.selectedFile.name}_${Date.now()}`);
          const uploadTask = await uploadBytes(storageRef, this.selectedFile);
          imageUrl = await getDownloadURL(uploadTask.ref);
        } catch (error) {
          console.error("Görsel yüklenirken hata oluştu:", error);
          this.errorMessage = "Görsel yüklenirken bir hata oluştu. Lütfen tekrar deneyin.";
          this.isSubmitting = false;
          return;
        }
      }

      try {
        await addDoc(collection(db, 'complaints'), {
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || 'Anonim',
          message: this.message,
          category: this.category,
          priority: this.priority, // YENİ: Öncelik seviyesi eklendi
          techDetails: this.techDetails || null,
          imageUrl: imageUrl,
          status: 'beklemede',
          timestamp: serverTimestamp()
        });

        this.successMessage = 'Şikayetiniz başarıyla gönderildi!';
        // Formu temizle
        this.message = '';
        this.category = '';
        this.priority = 'düşük';
        this.techDetails = '';
        this.selectedFile = null;
        this.fileName = '';

        const fileInput = document.getElementById('file');
        if (fileInput) {
          fileInput.value = '';
        }

      } catch (error) {
        console.error("Şikayet gönderilirken hata oluştu: ", error);
        this.errorMessage = 'Şikayetiniz gönderilemedi: ' + error.message;
      } finally {
        this.isSubmitting = false;
        setTimeout(() => {
          this.successMessage = '';
          this.errorMessage = '';
        }, 5000);
      }
    }
  }
};
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
.complaint-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.complaint-form label {
  font-weight: bold;
  color: #555;
}
.complaint-form input[type="text"],
.complaint-form textarea,
.complaint-form select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.file-name-display {
  font-size: 0.9em;
  color: #777;
  margin: -10px 0 10px 0;
}
.complaint-form button {
  padding: 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.complaint-form button:hover:not(:disabled) {
  background-color: #2980b9;
}
.complaint-form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
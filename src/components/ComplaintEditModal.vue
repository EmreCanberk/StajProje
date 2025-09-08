<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <span class="close-button" @click="closeModal">&times;</span>
      <h3>Şikayeti Düzenle</h3>
      <form @submit.prevent="saveChanges">
        <div class="form-group">
          <label for="modal-message">Mesaj:</label>
          <textarea id="modal-message" v-model="localComplaint.message" rows="5"></textarea>
        </div>
        <div class="form-group">
          <label for="modal-category">Kategori:</label>
          <select id="modal-category" v-model="localComplaint.category">
            <option value="Teknik Sorun">Teknik Sorun</option>
            <option value="Fatura Sorunu">Fatura Sorunu</option>
            <option value="Hizmet Kalitesi">Hizmet Kalitesi</option>
            <option value="Genel Öneri">Genel Öneri</option>
            <option value="Diğer">Diğer</option>
          </select>
        </div>
        <button type="submit" class="save-button">Kaydet</button>
      </form>
    </div>
  </div>
</template>

<script>
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default {
  name: 'ComplaintEditModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    complaint: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localComplaint: { ...this.complaint }
    };
  },
  watch: {
    complaint: {
      handler(newVal) {
        this.localComplaint = { ...newVal };
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    async saveChanges() {
      try {
        const complaintRef = doc(db, 'complaints', this.localComplaint.id);
        await updateDoc(complaintRef, {
          message: this.localComplaint.message,
          category: this.localComplaint.category 
        });
        this.$emit('close');
        alert('Şikayet başarıyla güncellendi!');
      } catch (error) {
        console.error('Şikayet güncellenirken hata oluştu:', error);
        alert('Güncelleme başarısız: ' + error.message);
      }
    },
    closeModal() {
      this.$emit('close');
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  position: relative;
}
.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 2em;
  font-weight: bold;
  color: #aaa;
  cursor: pointer;
}
.close-button:hover {
  color: #333;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.save-button {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
}
.save-button:hover {
  background-color: #27ae60;
}
</style>
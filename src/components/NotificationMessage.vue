<template>
  <div v-if="message" class="notification-box" :class="type">
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    message: String,
    type: {
      type: String,
      default: 'success', 
    }
  }
};
</script>

<style scoped>
.notification-box {
  padding: 10px;
  border-radius: 4px;
  margin-top: 15px;
  text-align: center;
}
.success {
  background-color: #d4edda;
  color: #155724;
}
.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>

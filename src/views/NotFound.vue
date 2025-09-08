<template>
  <div class="not-found-container">
    <h2>404 - Sayfa Bulunamadı</h2>
    <p>Aradığınız sayfa mevcut değil.</p>
    <router-link to="/">Anasayfa'ya dön</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
};
</script>

<style scoped>
.not-found-container {
  margin-top: 100px;
}
h2 {
  color: #e74c3c;
  margin-bottom: 20px;
}
p {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 30px;
}
</style>
<template>
  <div class="contact-container">
    <header class="page-header">
      <h1>İletişime Geçin</h1>
      <p>Sorularınız, önerileriniz veya işbirliği için bize ulaşın.</p>
    </header>

    <div class="contact-sections">
      <div class="contact-details-card">
        <h2>Bize Ulaşın</h2>
        <div class="info-group">
          <i class="fas fa-map-marker-alt"></i>
          <p><strong>Adres:</strong> X Mahallesi, Y Caddesi No: 123, Kayseri</p>
        </div>
        <div class="info-group">
          <i class="fas fa-phone"></i>
          <p><strong>Telefon:</strong> +90 123 456 78 90</p>
        </div>
        <div class="info-group">
          <i class="fas fa-envelope"></i>
          <p><strong>E-posta:</strong> info@sirket.com.tr</p>
        </div>

        <div class="social-links-grid">
          <a href="https://twitter.com" target="_blank" class="social-link">
            <i class="fab fa-twitter"></i>
            <span>Twitter</span>
          </a>
          <a href="https://instagram.com" target="_blank" class="social-link">
            <i class="fab fa-instagram"></i>
            <span>Instagram</span>
          </a>
          <a href="https://facebook.com" target="_blank" class="social-link">
            <i class="fab fa-facebook-f"></i>
            <span>Facebook</span>
          </a>
          <a href="https://wa.me/901234567890" target="_blank" class="social-link">
            <i class="fab fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
      
      <div class="contact-map-card">
        <h2>Konumumuz</h2>
        <div class="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3059.278964893976!2d32.84655511539209!3d39.91254347942514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d34f0c4767b07b%3A0x86e68f0c5c5e8b3e!2sKocatepe%20Park%C4%B1!5e0!3m2!1str!2str!4v1625078500206!5m2!1str!2str" 
            allowfullscreen="" 
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactPage',
};
</script>

<style scoped>

.contact-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}
.page-header {
  text-align: center;
  padding: 50px 20px;
  background-color: #f4f7f9;
  border-bottom: 3px solid #eee;
  margin-bottom: 40px;
}
.page-header h1 {
  font-size: 3em;
  color: #34495e;
  margin: 0;
}
.page-header p {
  font-size: 1.2em;
  color: #666;
  font-style: italic;
}
.contact-sections {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}
.contact-details-card, .contact-map-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
  flex: 1;
  min-width: 300px;
}
.contact-details-card h2, .contact-map-card h2 {
  color: #34495e;
  font-size: 1.8em;
  margin-top: 0;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
.info-group {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  color: #555;
}
.info-group i {
  font-size: 1.5em;
  color: #3498db;
}
.info-group p {
  margin: 0;
}
.social-links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 30px;
}
.social-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 50px;
  text-decoration: none;
  color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.social-link:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}
.social-link i {
  font-size: 1.5em;
}
.social-link span {
  font-weight: bold;
}
.social-link:nth-child(1) { background-color: #1DA1F2; } 
.social-link:nth-child(2) { background-color: #E1306C; } 
.social-link:nth-child(3) { background-color: #1877F2; } 
.social-link:nth-child(4) { background-color: #25D366; } 

.map-container {
  overflow: hidden;
  padding-top: 75%; 
  position: relative;
  height: 0;
  border-radius: 10px;
}
.map-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>

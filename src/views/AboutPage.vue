<template>
  <div class="about-container">
    <header class="page-header">
      <h1>Hikayemiz</h1>
      <p>Şikayet ve geri bildirimin gücüne inanıyoruz.</p>
    </header>
    
    <section class="story-section">
      <div class="story-content">
        <h2>Kim Olduğumuz</h2>
        <p>Platformumuz, kullanıcılar ve hizmet sağlayıcılar arasında güvenilir bir köprü kurmak amacıyla, 2023 yılında kurulmuştur. Amacımız, her bir şikayetin dikkate alındığı, şeffaf ve hızlı bir çözüm ortamı yaratmaktır. Her geri bildirimi bir gelişme fırsatı olarak görüyoruz.</p>
        <p>Ekibimiz, teknoloji, iletişim ve müşteri ilişkileri alanlarında yıllarca deneyim kazanmış profesyonellerden oluşmaktadır. Birlikte, sizlere en iyi şikayet yönetim deneyimini sunmak için tutkuyla çalışıyoruz.</p>
      </div>
    </section>

    <section class="team-section">
      <h2>Yönetici Kadromuz</h2>
      <div class="team-grid">
        <div class="team-member">
          <img src="@/assets/team-member1.jpg" alt="Ekip Üyesi 1" class="member-photo" />
          <h4>Ali A.</h4>
          <p>Kurucu Ortak & CEO</p>
        </div>
        <div class="team-member">
          <img src="@/assets/team-member2.jpg" alt="Ekip Üyesi 2" class="member-photo" />
          <h4>Abuzer A.</h4>
          <p>Operasyon Direktörü</p>
        </div>
        <div class="team-member">
          <img src="@/assets/team-member3.jpg" alt="Ekip Üyesi 3" class="member-photo" />
          <h4>Veli V.</h4>
          <p>Teknoloji Müdürü</p>
        </div>
      </div>
    </section>

    <section class="testimonials-section">
      <h2>Kullanıcı Yorumları</h2>
      <div class="testimonials-slider">
        <div 
          v-for="(testimonial, index) in testimonials" 
          :key="index" 
          class="testimonial-card"
          :class="{ 'active': activeTestimonial === index }"
        >
          <div class="rating">
            <i 
              v-for="star in 5" 
              :key="star" 
              class="fas fa-star"
              :class="{ 'fas': star <= testimonial.rating, 'far': star > testimonial.rating }"
            ></i>
          </div>
          <p class="testimonial-text">"{{ testimonial.text }}"</p>
          <p class="testimonial-author">- {{ testimonial.author }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      testimonials: [
        { rating: 5, text: "Şikayetim bir saat içinde çözüldü, inanılmaz hızlı ve etkili bir platform. Kesinlikle tavsiye ederim.", author: "Ayşe A." },
        { rating: 4.5, text: "Çok kolay bir arayüzü var. Şikayetimi gönderdim ve durumu anlık olarak takip edebiliyorum, harika!", author: "Mehmet M." },
        { rating: 4, text: "Müşteri hizmetleri çok ilgiliydi. Sorunumu çözmek için ellerinden geleni yaptılar.", author: "Zeynep Z." },
        { rating: 5, text: "Bugüne kadar kullandığım en iyi şikayet platformu. Hem pratik hem de güvenilir.", author: "Ahmet D." }
      ],
      activeTestimonial: 0,
      intervalId: null
    };
  },
  mounted() {
    this.startSlider();
  },
  beforeUnmount() {
    this.stopSlider();
  },
  methods: {
    startSlider() {
      this.intervalId = setInterval(() => {
        this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
      }, 5000); 
    },
    stopSlider() {
      clearInterval(this.intervalId);
    }
  }
}
</script>

<style scoped>

.about-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}
.page-header {
  text-align: center;
  padding: 50px 20px;
  background-color: #f4f7f9;
  border-bottom: 3px solid #eee;
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
.story-section, .team-section, .testimonials-section {
  padding: 60px 20px;
  max-width: 1000px;
  margin: 0 auto;
}
h2 {
  font-size: 2.2em;
  color: #34495e;
  text-align: center;
  margin-bottom: 40px;
}
.story-content p {
  line-height: 1.8;
  text-align: justify;
  color: #555;
  margin-bottom: 20px;
}
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 30px;
  text-align: center;
}
.team-member {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
}
.member-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #3498db;
  margin-bottom: 15px;
}
.team-member h4 {
  font-size: 1.4em;
  color: #34495e;
  margin: 10px 0;
}
.team-member p {
  color: #777;
  font-style: italic;
}
.testimonials-section {
  background-color: #f8f9fa;
  border-radius: 10px;
}
.testimonials-slider {
  position: relative;
  height: 200px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.testimonial-card {
  position: absolute;
  top: 0;
  width: 90%;
  max-width: 600px;
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: left;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.testimonial-card.active {
  opacity: 1;
  transform: translateX(0);
}
.rating {
  color: gold;
  margin-bottom: 10px;
}
.testimonial-text {
  font-style: italic;
  color: #444;
  line-height: 1.6;
}
.testimonial-author {
  font-weight: bold;
  color: #333;
  margin-top: 20px;
  text-align: right;
}
</style>

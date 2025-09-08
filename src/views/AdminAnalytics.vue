<template>
  <div class="analytics-container">
    <h3>Yönetici Analiz Paneli</h3>
    
    <div class="tabs">
      <button :class="{ active: currentTab === 'stats' }" @click="currentTab = 'stats'">Genel Bakış</button>
      <button :class="{ active: currentTab === 'charts' }" @click="currentTab = 'charts'">Grafikler</button>
    </div>

    <div class="tab-content">
      <div v-if="currentTab === 'stats'">
        <p>Şikayet Durumları ve Kategorileri Analizi</p>
        <div class="analiz-kutulari">
          <div class="kutu toplam">
            <p>{{ totalComplaints }}</p>
            <span>Toplam</span>
          </div>
          <div class="kutu beklemede">
            <p>{{ pendingComplaints }}</p>
            <span>Beklemede</span>
          </div>
          <div class="kutu inceleniyor">
            <p>{{ inProgressComplaints }}</p>
            <span>İnceleniyor</span>
          </div>
          <div class="kutu cozuldu">
            <p>{{ resolvedComplaints }}</p>
            <span>Çözüldü</span>
          </div>
        </div>
      </div>

      <div v-if="currentTab === 'charts'">
        <div class="chart-container">
          <h4>Son 7 Günlük Şikayet Sayısı</h4>
          <canvas id="complaintChart"></canvas>
        </div>
        <div class="chart-container">
          <h4>Kategori Dağılımı</h4>
          <canvas id="categoryChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import Chart from 'chart.js/auto';

export default {
  name: 'AdminAnalytics',
  data() {
    return {
      complaints: [],
      unsubscribe: null,
      complaintChart: null,
      categoryChart: null,
      currentTab: 'stats'
    };
  },
  computed: {
    totalComplaints() {
      return this.complaints.length;
    },
    pendingComplaints() {
      return this.complaints.filter(c => c.status === 'beklemede').length;
    },
    inProgressComplaints() {
      return this.complaints.filter(c => c.status === 'inceleniyor').length;
    },
    resolvedComplaints() {
      return this.complaints.filter(c => c.status === 'çözüldü').length;
    }
  },
  watch: {
    currentTab(newTab) {
      if (newTab === 'charts') {
        this.$nextTick(() => {
          this.updateComplaintChart();
          this.updateCategoryChart();
        });
      }
    }
  },
  mounted() {
    this.setupComplaintListener();
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.complaintChart) {
      this.complaintChart.destroy();
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
    }
  },
  methods: {
    setupComplaintListener() {
      const q = query(collection(db, 'complaints'), orderBy('timestamp', 'desc'));
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (this.currentTab === 'charts') {
          this.$nextTick(() => {
            this.updateComplaintChart();
            this.updateCategoryChart();
          });
        }
      }, (error) => {
        console.error('Şikayetler çekilirken hata oluştu:', error);
      });
    },
    updateComplaintChart() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const complaintsLast7Days = this.complaints.filter(c => 
        c.timestamp && c.timestamp.toDate() >= sevenDaysAgo
      );

      const complaintCounts = {};
      const dateLabels = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('tr-TR');
        complaintCounts[dateStr] = 0;
        dateLabels.push(dateStr);
      }

      complaintsLast7Days.forEach(c => {
        const dateStr = c.timestamp.toDate().toLocaleDateString('tr-TR');
        if (complaintCounts[dateStr] !== undefined) {
          complaintCounts[dateStr]++;
        }
      });
      
      const sortedChartData = dateLabels.map(date => complaintCounts[date] || 0);

      const ctx = document.getElementById('complaintChart');
      if (this.complaintChart) {
        this.complaintChart.destroy();
      }

      this.complaintChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dateLabels,
          datasets: [{
            label: 'Günlük Şikayet Sayısı',
            data: sortedChartData,
            borderColor: '#3498db',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    },
    updateCategoryChart() {
      const categoryCounts = {};
      this.complaints.forEach(c => {
        const category = c.category || 'Belirtilmemiş';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      const labels = Object.keys(categoryCounts);
      const data = Object.values(categoryCounts);
      
      const backgroundColors = [
        '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#f1c40f',
        '#e67e22', '#e74c3c', '#bdc3c7', '#7f8c8d'
      ];

      const ctx = document.getElementById('categoryChart');
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }

      this.categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColors.slice(0, labels.length)
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: false,
              text: 'Kategori Dağılımı'
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.analytics-container {
  max-width: 800px;
  margin: 30px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}
.analiz-kutulari {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  text-align: center;
}
.kutu {
  flex: 1;
  min-width: 120px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: white;
}
.kutu p {
  font-size: 2em;
  font-weight: bold;
  margin: 0;
}
.kutu span {
  font-size: 0.9em;
}
.kutu.toplam { background-color: #555; }
.kutu.beklemede { background-color: #f39c12; }
.kutu.inceleniyor { background-color: #3498db; }
.kutu.cozuldu { background-color: #2ecc71; }

.divider {
  border: 0;
  height: 1px;
  background: #eee;
  margin: 20px 0;
}
.chart-container {
  max-width: 760px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fdfdfd;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.tabs button {
  padding: 10px 20px;
  border: none;
  background-color: #f0f0f0;
  cursor: pointer;
  font-size: 1em;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.tabs button.active {
  background-color: #e0e0e0;
  border-bottom: 2px solid #3498db;
  font-weight: bold;
}
</style>
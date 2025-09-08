<template>
  <div id="app">
    <nav v-if="!['Login', 'Register'].includes($route.name)">
      <div class="nav-links">
        <router-link to="/" class="nav-link">Anasayfa</router-link>
        <router-link to="/about" class="nav-link">Hakkımızda</router-link>
        <router-link to="/contact" class="nav-link">İletişim</router-link>
        <router-link v-if="!isLoggedIn" to="/login" class="nav-link login">Giriş Yap</router-link>
      </div>
      <div class="user-links" v-if="isLoggedIn">
        <router-link :to="dashboardLink" class="nav-link dashboard">{{ userRole === 'admin' ? 'Admin Paneli' : 'Kullanıcı Paneli' }}</router-link>
        <router-link to="/user-profile" class="nav-link profile" v-if="userRole !== 'admin'">Profil</router-link>
        <button @click="handleSignOut" class="nav-link logout">Çıkış Yap</button>
      </div>
    </nav>
    <router-view/>
  </div>
</template>

<script>
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,
      userRole: null,
    };
  },
  computed: {
    dashboardLink() {
      return this.userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard';
    }
  },
  async created() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.isLoggedIn = true;
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          this.userRole = userDocSnap.data().role;
        } else {
          this.userRole = 'user';
        }
      } else {
        this.isLoggedIn = false;
        this.userRole = null;
      }
    });
  },
  methods: {
    handleSignOut() {
      signOut(auth).then(() => {
        this.$router.push('/login');
      }).catch(error => {
        console.error("Çıkış yaparken hata oluştu:", error);
      });
    }
  }
};
</script>

<style>
body {
  margin: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background-color: #ecf0f1;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #34495e;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-links, .user-links {
  display: flex;
  gap: 15px;
}

.nav-link {
  font-weight: bold;
  color: white;
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.nav-link.router-link-exact-active {
  background-color: #2c3e50;
}

.nav-link:hover {
  background-color: #576c81;
  transform: translateY(-2px);
}

.nav-link.login {
  background-color: #2ecc71;
}

.nav-link.login:hover {
  background-color: #27ae60;
}

.nav-link.logout {
  background-color: #e74c3c;
}

.nav-link.logout:hover {
  background-color: #c0392b;
}

.nav-link.dashboard, .nav-link.profile {
  background-color: #3498db;
}

.nav-link.dashboard:hover, .nav-link.profile:hover {
  background-color: #2980b9;
}
</style>
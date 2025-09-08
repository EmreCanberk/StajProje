import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import AboutPage from '../views/AboutPage.vue';
import ContactPage from '../views/ContactPage.vue';
import UserLogin from '../views/UserLogin.vue';
import UserRegister from '../views/UserRegister.vue';
import UserDashboard from '../views/UserDashboard.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import AdminAnalytics from '../views/AdminAnalytics.vue';
import NotFound from '../views/NotFound.vue';
import AdminUserList from '../views/AdminUserList.vue';
import UserProfile from '../views/UserProfile.vue';
import AdminUserAnalytics from '../views/AdminUserAnalytics.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import ComplaintDetail from '../views/ComplaintDetail.vue'; // Yeni sayfa eklendi
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const routes = [
  { path: '/', name: 'HomePage', component: HomePage, meta: { requiresAuth: false } },
  { path: '/about', name: 'AboutPage', component: AboutPage, meta: { requiresAuth: false } },
  { path: '/contact', name: 'ContactPage', component: ContactPage, meta: { requiresAuth: false } },
  { path: '/login', name: 'UserLogin', component: UserLogin, meta: { requiresAuth: false } },
  { path: '/register', name: 'UserRegister', component: UserRegister, meta: { requiresAuth: false } },
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword, meta: { requiresAuth: false } },
  { path: '/user-dashboard', name: 'UserDashboard', component: UserDashboard, meta: { requiresAuth: true, requiresRole: 'user' } },
  {
    path: '/user-profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  { path: '/admin-dashboard', name: 'AdminDashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresRole: 'admin' } },
  { path: '/admin-analytics', name: 'AdminAnalytics', component: AdminAnalytics, meta: { requiresAuth: true, requiresRole: 'admin' } },
  {
    path: '/admin-user-analytics',
    name: 'AdminUserAnalytics',
    component: AdminUserAnalytics,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  },
  {
    path: '/admin/users',
    name: 'AdminUserList',
    component: AdminUserList,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  },
  { // YENİ EKLENEN ROTA
    path: '/admin/complaint/:id',
    name: 'ComplaintDetail',
    component: ComplaintDetail,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  },
  { path: '/:catchAll(.*)', name: 'NotFound', component: NotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const currentUser = auth.currentUser;
  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.requiresRole;

  if (requiresAuth && !currentUser) {
    next('/login');
  } else if (currentUser) {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    let userRole = null;
    if (userDocSnap.exists()) {
      userRole = userDocSnap.data().role;
    }

    if (to.path === '/login' || to.path === '/register' || to.path === '/forgot-password') {
      if (userRole === 'admin') {
        next('/admin-dashboard');
      } else {
        next('/user-dashboard');
      }
    } else if (requiredRole && userRole !== requiredRole) {
      alert('Bu sayfaya erişim yetkiniz yok.');
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
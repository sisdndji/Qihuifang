import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '../store/auth';



const routes = [

  {

    path: '/login',

    name: 'Login',

    component: () => import('../views/Login.vue'),

    meta: { isFrontend: true }

  },

  {

    path: '/register',

    name: 'Register',

    component: () => import('../views/Register.vue'),

    meta: { isFrontend: true }

  },

  {

    path: '/',

    name: 'Home',

    component: () => import('../views/Home.vue'),

    meta: { isFrontend: true }

  },

  {

    path: '/heritage',

    name: 'HeritageList',

    component: () => import('../views/HeritageList.vue'),

    meta: { isFrontend: true }

  },

  {

    path: '/heritage/:id',

    name: 'HeritageDetail',

    component: () => import('../views/HeritageDetail.vue'),

    meta: { isFrontend: true }

  },

  {

    path: '/masters',

    name: 'Masters',

    component: () => import('../views/Masters.vue'),

    meta: { isFrontend: true }

  },

  {

    path: '/admin/login',

    name: 'AdminLogin',

    component: () => import('../views/admin/AdminLogin.vue')

  },

  {

    path: '/admin',

    component: () => import('../layouts/AdminLayout.vue'),

    meta: { requiresAuth: true, requiresAdmin: true },

    children: [

      {

        path: '',

        name: 'AdminPanel',

        component: () => import('../views/AdminPanel.vue')

      },

      {

        path: 'platform-stats',

        name: 'AdminPlatformStats',

        component: () => import('../views/admin/PlatformStats.vue')

      }

    ]

  },

  {

    path: '/dashboard',

    name: 'Dashboard',

    component: () => import('../views/Dashboard.vue'),

    meta: { isFrontend: true }

  },

  {

    path: '/master/linan',

    name: 'MasterLinan',

    component: () => import('../views/MasterLinan.vue'),

    meta: { isFrontend: true }

  },

  {

    path: '/master/linan/works',

    name: 'LinanWorks',

    component: () => import('../views/LinanWorks.vue'),

    meta: { isFrontend: true }

  },

  {

    path: '/team/linan',

    name: 'TeamLinan',

    component: () => import('../views/TeamLinan.vue'),

    meta: { isFrontend: true, requiresAuth: true }

  },

  {

    path: '/masters/distribution',

    name: 'MasterDistribution',

    component: () => import('../views/MasterDistribution.vue'),

    meta: { isFrontend: true }

  }

];



const router = createRouter({

  history: createWebHistory(),

  routes

});



router.beforeEach((to, from, next) => {

  const authStore = useAuthStore();

  const isAdminArea = to.path.startsWith('/admin');

  const isAdminLogin = to.name === 'AdminLogin';

  const isFrontendLogin = to.name === 'Login';

  const isFrontendRegister = to.name === 'Register';

  const isAuthPage = isFrontendLogin || isFrontendRegister;



  // 后台区域（不含登录页）

  if (isAdminArea && !isAdminLogin) {

    if (!authStore.isAuthenticated) {

      next('/admin/login');

      return;

    }

    if (!authStore.isAdmin) {

      next('/');

      return;

    }

    next();

    return;

  }



  // 后台登录页

  if (isAdminLogin) {

    if (authStore.isAuthenticated && authStore.isAdmin) {

      next('/admin');

      return;

    }

    if (authStore.isAuthenticated && !authStore.isAdmin) {

      next('/');

      return;

    }

    next();

    return;

  }



  // 前台页面：未登录跳转前台登录

  if (!authStore.isAuthenticated && !isAuthPage) {

    next('/login');

    return;

  }



  // 已登录访问登录/注册页，回首页

  if (authStore.isAuthenticated && isAuthPage) {

    next('/');

    return;

  }



  next();

});



export default router;



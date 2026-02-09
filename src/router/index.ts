import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../components/Layout.vue'),
      children: [
        {
          path: '',
          name: 'StudentHome',
          component: () => import('../views/StudentView.vue'),
        },
      ],
    },
  ],
})

export default router

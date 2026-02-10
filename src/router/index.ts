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
      path: '/StudentHome',
      name: 'Student',
      component: () => import('../components/Layout.vue'),
      children: [
        {
          path: '',
          name: 'StudentHome',
          component: () => import('../views/StudentView.vue'),
        },
        {
          path: 'message',
          name: 'Message',
          children: [
            {
              path: 'activities',
              name: '帖子动态',
              component: () => import('../views/Message/MessageActivities.vue'),
            },
            {
              path: 'progress',
              name: '招领进度',
              component: () => import('../views/Message/MessageProgress.vue'),
            },
            {
              path: 'announce',
              name: '系统公告',
              component: () => import('../views/Message/MessageAnnounce.vue'),
            }
          ]
        }
      ],
    },
  ],
})

export default router

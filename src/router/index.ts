import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

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
          path: 'profile',
          name: '个人中心',
          component: () => import('../views/Profile.vue'),
        },
        {
          path: 'publish-lost',
          name: 'PublishLost',
          component: () => import('../views/Publish/Publish_lost.vue'),
        },
        {
          path: 'publish-found',
          name: 'PublishFound',
          component: () => import('../views/Publish/Publish_found.vue'),
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
        },
        {
          path:'/:pathMatch(.*)*',
          name:'NotFound',
          component: () => import('@/views/NotFound.vue')
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const whiteList = ['/', '/NotFound']
  const userStore = useUserStore()
  const token = userStore.token

  if (token) {
    // 有 token，访问登录页则重定向到主页
    if (whiteList.includes(to.path)) {
      if (to.path === '/') {
        next('/StudentHome')
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    // 没有 token，白名单页面放行，否则跳转登录页
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/')
    }
  }
})
export default router

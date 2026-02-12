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
      path: '/change-password',
      name: 'ChangePassword',
      component: () => import('../views/Password_change.vue'),
    },
    // --- 学生端 ---
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
          component: () => import('../views/Password_change.vue'),
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

    // --- 管理员端 (已补全所有页面) ---
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      redirect: '/admin/dashboard', // 默认进入数据总览
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'items', // 物品管理 (对应 ItemManagement.vue)
          name: 'AdminItems',
          component: () => import('../views/admin/ItemManagement.vue')
        },
        {
          path: 'audit-posts', // 发布审核 (对应 AuditList.vue)
          name: 'AdminAuditPosts',
          component: () => import('../views/admin/AuditList.vue')
        },
        {
          path: 'audit-claims', // 认领审核 (对应 ClaimAudit.vue)
          name: 'AdminAuditClaims',
          component: () => import('../views/admin/ClaimAudit.vue')
        },
        {
          path: 'audit-history', // 审核记录 (对应 AuditHistory.vue)
          name: 'AdminAuditHistory',
          component: () => import('../views/admin/AuditHistory.vue')
        },
        {
          path: 'notices', // 公告管理 (对应 NoticeList.vue)
          name: 'AdminNotices',
          component: () => import('../views/admin/NoticeList.vue')
        }
      ]
    }
  ],
})

router.beforeEach((to, from, next) => {
  const whiteList = ['/', '/NotFound']
  const userStore = useUserStore()
  const token = userStore.token
  const getHomePathByRole = (role: number) => (role === 2 || role === 3 ? '/admin' : '/StudentHome')

  if (token) {
    if (userStore.firstLogin && to.path !== '/change-password') {
      next('/change-password')
      return
    }

    if (!userStore.firstLogin && to.path === '/change-password') {
      next(getHomePathByRole(userStore.role))
      return
    }

    // 有 token，访问登录页则重定向到主页
    if (whiteList.includes(to.path)) {
      if (to.path === '/') {
        next(getHomePathByRole(userStore.role))
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

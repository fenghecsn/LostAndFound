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
      path: '/password_change',
      name: 'PasswordChange',
      component: () => import('../views/Password_change.vue'),
    },
    {
      path: '/forget_password',
      name: 'ForgetPassword',
      component: () => import('../views/ForgetPassword.vue'),
    },
    {
      path: '/notice_board',
      name: 'NoticeBoard',
      component: () => import('../views/Student&Teacher/Message/NoticeBoard.vue'),
    },
    // --- 学生端 ---
    {
      path: '/StudentHome',
      name: 'Student',
      component: () => import('../components/Layout/Layout.vue'),
      children: [
        {
          path: '',
          name: 'StudentHome',
          component: () => import('../views/Student&Teacher/StudentView.vue'),
        },
        {
          path: 'profile',
          name: '个人中心',
          component: () => import('../views/Student&Teacher/Profile.vue'),
        },
        {
          path: 'publish',
          name: 'Publish',
          component: () => import('../views/Student&Teacher/Publish/Publish.vue'),
        },
        {
          path: 'publish-found',
          redirect: '/StudentHome/publish?type=found',
        },
        {
          path: 'publish-lost',
          redirect: '/StudentHome/publish?type=lost',
        },
        {
          path: 'message',
          name: 'Message',
          children: [
            {
              path: 'activities',
              name: '帖子动态',
              component: () => import('../views/Student&Teacher/Message/MessageActivities.vue'),
            },
            {
              path: 'progress',
              name: '招领进度',
              component: () => import('../views/Student&Teacher/Message/MessageProgress.vue'),
            },
            {
              path: 'chat/:targetId',
              name: '消息对话',
              component: () => import('../views/Student&Teacher/Message/MessageChat.vue'),
            },
            {
              path: 'announce',
              name: '所有公告',
              component: () => import('../views/Student&Teacher/Message/MessageAnnounce.vue'),
            },
            {
              path: 'notice_board',
              name: '公告栏',
              component: () => import('../views/Student&Teacher/Message/NoticeBoard.vue'),
            },
            {
              path: 'system_board',
              name: '系统通知',
              component: () => import('../views/Student&Teacher/Message/SystemBoard.vue'),
            },
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
      redirect: '/admin/audit',
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'items',
          name: 'AdminItems',
          component: () => import('../views/admin/ItemManagement.vue')
        },
        {
          path: 'audit',
          name: 'AdminAuditPosts',
          component: () => import('../views/admin/AuditList.vue')
        },
        {
          path: 'claim-audit',
          name: 'AdminAuditClaims',
          component: () => import('../views/admin/ClaimAudit.vue')
        },
        {
          path: 'audit-history',
          name: 'AdminAuditHistory',
          component: () => import('../views/admin/AuditHistory.vue')
        },
        {
          path: 'notices',
          name: 'AdminNotices',
          component: () => import('../views/admin/NoticeList.vue')
        }
      ]
    },

    // --- 超级管理员端 ---
    {
      path: '/super',
      component: () => import('../views/super/SuperLayout.vue'),
      redirect: '/super/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'SuperDashboard',
          component: () => import('../views/super/SystemSettings.vue')
        },
        {
          path: 'global',
          name: 'SuperGlobal',
          component: () => import('../views/super/GlobalManagement.vue')
        },
        {
          path: 'users',
          name: 'SuperUsers',
          component: () => import('../views/super/UserManagement.vue')
        },
        {
          path: 'notices',
          name: 'SuperNotices',
          component: () => import('../views/super/SuperNotice.vue')
        },
        {
          path: 'data',
          name: 'SuperData',
          component: () => import('../views/super/DataManagement.vue')
        },
        {
          path: 'feedback',
          name: 'SuperFeedback',
          component: () => import('../views/super/FeedbackCenter.vue')
        }
      ]
    }
  ],
})

router.beforeEach((to, from, next) => {
  const whiteList = ['/', '/NotFound', '/forget_password']
  const userStore = useUserStore()
  const token = userStore.token
  const normalizeRole = (role: unknown) => {
    const parsed = Number(role)
    if (parsed === 3) return 3
    if (parsed === 2) return 2
    return 1
  }
  const getHomePathByRole = (role: unknown) => {
    const normalized = normalizeRole(role)
    if (normalized === 3) return '/super'
    if (normalized === 2) return '/admin'
    return '/StudentHome'
  }
  const role = normalizeRole(userStore.role)
  const isRolePathAllowed = (path: string, userRole: number) => {
    if (path.startsWith('/super')) return userRole === 3
    if (path.startsWith('/admin')) return userRole === 2
    if (path.startsWith('/StudentHome')) return userRole === 1
    return true
  }

  if (token) {
    if (userStore.firstLogin && to.path !== '/password_change') {
      next('/password_change')
      return
    }

    // 非首次登录且未确认公告栏，强制跳转公告栏
    if (!userStore.firstLogin && !userStore.noticeConfirmed && to.path !== '/notice_board') {
      next('/notice_board?mandatory=true')
      return
    }

    // 已确认公告栏后，不允许再以 mandatory 模式访问
    if (userStore.noticeConfirmed && to.path === '/notice_board' && to.query.mandatory === 'true') {
      next(getHomePathByRole(role))
      return
    }

    if (!userStore.firstLogin && to.path === '/password_change') {
      next(getHomePathByRole(role))
      return
    }

    if (!isRolePathAllowed(to.path, role)) {
      next(getHomePathByRole(role))
      return
    }

    if (whiteList.includes(to.path)) {
      if (to.path === '/') {
        next(getHomePathByRole(role))
      } else {
        next()
      }
    } else {
      next()
    }
  } else if (whiteList.includes(to.path)) {
    next()
  } else {
    next('/')
  }
})
export default router

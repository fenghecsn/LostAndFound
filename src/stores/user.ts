import { defineStore } from 'pinia'
import { ref } from 'vue'
import { normalizeResourceUrl } from '@/utils/url'


export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>(localStorage.getItem('username') || '')
  const role = ref<number>(Number(localStorage.getItem('role')) || 1) //1: 学生/老師，2: 管理员 3.超级管理员
  const firstLogin = ref<boolean>(localStorage.getItem('firstLogin') === 'true')
  const nickname = ref<string>(localStorage.getItem('nickname') || '')
  const avatar = ref<string>(localStorage.getItem('avatar') || '')
  const noticeConfirmed = ref<boolean>(sessionStorage.getItem('noticeConfirmed') === 'true')

  const setRole = (newRole: number) => {
    role.value = newRole
    localStorage.setItem('role', JSON.stringify(newRole))
  }
  const setToken = (loginData: any) => {
    const userToken = loginData.data.token
    token.value = userToken
    localStorage.setItem('token', userToken)
  }
  const setFirstLogin = (isFirstLogin: boolean) => {
    firstLogin.value = isFirstLogin
    localStorage.setItem('firstLogin', String(isFirstLogin))
  }
  const setUsername = (Username: any) => {
    username.value = Username
    localStorage.setItem('username', Username)
  }
  const clearUserData = () => {
    token.value = ''
    username.value = ''
    role.value = 1
    noticeConfirmed.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('firstLogin')
    localStorage.removeItem('nickname')
    localStorage.removeItem('avatar')
    sessionStorage.removeItem('noticeConfirmed')
  }
  const setNickname = (newNickname: string) => {
    nickname.value = newNickname
    localStorage.setItem('nickname', newNickname)
  }
  const setAvatar = (newAvatar: string) => {
    const normalizedAvatar = normalizeResourceUrl(newAvatar)
    avatar.value = normalizedAvatar
    localStorage.setItem('avatar', normalizedAvatar)
  }
  const setNoticeConfirmed = (confirmed: boolean) => {
    noticeConfirmed.value = confirmed
    sessionStorage.setItem('noticeConfirmed', String(confirmed))
  }
  function clearUser() {
    token.value = ''
    username.value = ''
    role.value = 0
    firstLogin.value = false
    noticeConfirmed.value = false
    nickname.value = ''
    localStorage.removeItem('nickname')
    localStorage.removeItem('avatar')
    localStorage.removeItem('token')
    sessionStorage.removeItem('noticeConfirmed')
  }

  return {
    token,
    username,
    role,
    firstLogin,
    setRole,
    setToken,
    setFirstLogin,
    setUsername,
    setAvatar,
    clearUserData,
    setNickname,
    nickname,
    avatar,
    noticeConfirmed,
    setNoticeConfirmed,
    clearUser
  }
})

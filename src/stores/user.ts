import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>(localStorage.getItem('username') || '')
  const role = ref<number>(Number(localStorage.getItem('role')) || 1) //1: 学生/老師，2: 管理员 3.超级管理员
  const firstLogin = ref<boolean>(localStorage.getItem('firstLogin') === 'true')
  const nickname = ref<string>(localStorage.getItem('nickname') || '')

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
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('firstLogin')
    localStorage.removeItem('nickname')
  }
  const setNickname = (newNickname: string) => {
    nickname.value = newNickname
    localStorage.setItem('nickname', newNickname)
  }
  // 如果你没有 clearUser / logout 方法，加上这个：
  function clearUser() {
    token.value = ''
    username.value = ''
    role.value = 0
    firstLogin.value = false
    nickname.value = ''
    localStorage.removeItem('token')
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
    clearUserData,
    setNickname,
    nickname,
    clearUser
  }
})

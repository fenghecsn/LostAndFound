import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>(localStorage.getItem('username') || '')
  const role = ref<number>(Number(localStorage.getItem('role')) || 1) //1: 学生/老師，2: 管理员 3.超级管理员


  const setRole = (newRole: number) => {
    role.value = newRole
    localStorage.setItem('role', JSON.stringify(newRole))
  }
  const setToken = (loginData: any) => {
    const userToken = loginData.data.token
    token.value = userToken
    localStorage.setItem('token', userToken)
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
  }

  return {
    token,
    username,
    role,
    setRole,
    setToken,
    setUsername,
    clearUserData,
  }
})

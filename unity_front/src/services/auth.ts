import api from '@/plugins/axios/api'

export const login = async (email: string, password: string, rememberMe: boolean) =>
  api.post('/auth/login', { email, password, rememberMe })

export const logout = async () => api.post('/auth/logout')

export const getUser = async () => api.get('/user')

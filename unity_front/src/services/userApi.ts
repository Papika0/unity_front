import api from '@/plugins/axios/api'

export interface User {
  id: number
  name: string
  email: string
  role: string
  role_id: number
  created_at: string
}

export interface Role {
  id: number
  name: string
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role_id: number
}

export interface UpdateUserData {
  name?: string
  email?: string
  password?: string
  role_id?: number
}

export const userApi = {
  // Get all users
  getUsers: async () => {
    const response = await api.get('/admin/users')
    return response.data
  },

  // Get all roles
  getRoles: async () => {
    const response = await api.get('/admin/users/roles')
    return response.data
  },

  // Get single user
  getUser: async (id: number) => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },

  // Create user
  createUser: async (data: CreateUserData) => {
    const response = await api.post('/admin/users', data)
    return response.data
  },

  // Update user
  updateUser: async (id: number, data: UpdateUserData) => {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  },

  // Delete user
  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },
}

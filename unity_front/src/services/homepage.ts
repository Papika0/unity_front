import api from '@/plugins/axios/api'

// Locale is now sent via Accept-Language header automatically
export const getHomepageBootstrap = async () => {
  return api.get('/homepage/bootstrap')
}

import api from '@/plugins/axios/api'

export type HomepageBootstrapParams = {
  locale: string
}

export const getHomepageBootstrap = async (params: HomepageBootstrapParams) => {
  return api.get('/homepage/bootstrap', { params })
}

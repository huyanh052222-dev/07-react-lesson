import { API_URL, PAGE_SIZE } from './config'

async function request(path = '', options) {
  const response = await fetch(`${API_URL}${path}`, options)
  if (!response.ok) {
    throw new Error(`${options?.method || 'GET'} ${path || '/'} failed (${response.status})`)
  }
  return response.json()
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function getUsers({ page = 1, limit = PAGE_SIZE, search = '', sortBy, order } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  if (sortBy) {
    params.set('sortBy', sortBy)
    params.set('order', order ?? 'asc')
  }
  const response = await fetch(`${API_URL}?${params}`)
  // mockapi returns 404 "Not found" when a search matches nothing
  if (response.status === 404) return []
  if (!response.ok) throw new Error(`GET /?${params} failed (${response.status})`)
  return response.json()
}

export const createUser = (data) =>
  request('', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(data) })

export const updateUser = (id, data) =>
  request(`/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(data) })

export const deleteUser = (id) => request(`/${id}`, { method: 'DELETE' })

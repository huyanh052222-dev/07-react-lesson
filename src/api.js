import { API_URL } from './config'

async function request(path = '', options) {
  const response = await fetch(`${API_URL}${path}`, options)
  if (!response.ok) {
    throw new Error(`${options?.method || 'GET'} ${path || '/'} failed (${response.status})`)
  }
  return response.json()
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const getUsers = () => request()

export const createUser = (data) =>
  request('', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(data) })

export const updateUser = (id, data) =>
  request(`/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(data) })

export const deleteUser = (id) => request(`/${id}`, { method: 'DELETE' })

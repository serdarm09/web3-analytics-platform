export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token')
  
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : ''
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials
  })
}
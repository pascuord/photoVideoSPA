// Construye la URL del API:
//  - PROD: https://mi-backend.com/api/...
//  - DEV:  /backend/...   (Vite proxy → http://localhost:3000/api/...)
const API_BASE: string | undefined = (import.meta as any).env?.VITE_API_BASE_URL?.trim();

export function apiUrl(path: string) {
  if (!path.startsWith('/')) path = `/${path}`;
  return API_BASE ? `${API_BASE.replace(/\/$/, '')}/api${path}` : `/backend${path}`; // solo en dev
}

import { defineEventHandler, proxyRequest } from 'h3';

// Proxia cualquier /api/** del frontend al backend en :3000
export default defineEventHandler((event) => {
  return proxyRequest(event, 'http://localhost:3000'); // conserva el path (/api/...)
});

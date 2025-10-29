export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';

export function buildApiPath(path: string) {
  if (!path.startsWith('/')) path = `/${path}`;
  return API_BASE ? `${API_BASE}${path}` : path;
}

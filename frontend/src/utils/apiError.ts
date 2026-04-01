import axios from 'axios';

/**
 * Mensaje legible para fallos de Axios (incl. 502 del proxy de Vite cuando no hay backend).
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : fallback;
  }

  const status = err.response?.status;
  if (status === 502 || status === 503) {
    return 'El servidor API no responde (502). Arranca el backend: en la carpeta `backend` ejecuta `npm run start:dev` (por defecto puerto 3000). Vite reenvía `/api` a http://localhost:3000.';
  }

  if (!err.response) {
    return 'No se pudo conectar con la API. Comprueba que el backend esté en ejecución en http://localhost:3000.';
  }

  const data = err.response.data as { message?: string | string[] };
  if (data?.message !== undefined) {
    return Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
  }

  return fallback;
}

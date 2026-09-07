export const AUTH_STORAGE_KEY = 'studioflow.auth';

// AuthContext registers a callback so a 401 anywhere logs the user out.
let unauthorizedHandler = () => {};
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === 'function' ? fn : () => {};
}

function currentToken() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))?.token ?? null;
  } catch {
    return null;
  }
}

/** Error thrown for any non-2xx response. Carries the API's { code, message, correlationId }. */
export class ApiError extends Error {
  constructor({ status, code, message, correlationId }) {
    super(message || 'The request failed.');
    this.name = 'ApiError';
    this.status = status;
    this.code = code || 'ERROR';
    this.correlationId = correlationId || null;
  }
}

/**
 * Single fetch wrapper (spec §42): attaches the bearer token, parses the uniform
 * error shape, and routes 401s to the logout handler.
 */
export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = auth ? currentToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (res.status === 204) return null;

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    if (res.status === 401) unauthorizedHandler();
    throw new ApiError({
      status: res.status,
      code: data?.code,
      message: data?.message,
      correlationId: data?.correlationId
    });
  }

  return data;
}

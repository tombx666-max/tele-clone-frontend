// Base API configuration – empty = same origin (production-ready)
const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getErrorMessage(err: unknown): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Network error. Please check your connection and try again.';
  }
  if (err instanceof Error) return err.message;
  return 'Request failed';
}

// API helper with token refresh and production-safe error handling
export const apiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }

  // If token expired, try to refresh once
  if (response.status === 403) {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResponse.ok) {
          const { accessToken: newToken } = await refreshResponse.json();
          if (typeof window !== 'undefined') localStorage.setItem('accessToken', newToken);
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(`${API_BASE}${url}`, { ...options, headers });
        }
      } catch {
        // Network error during refresh – return original response
      }
    }
  }

  return response;
};

function handleResponseError(response: Response, fallback = 'Request failed'): Promise<never> {
  return response
    .json()
    .then((body: { error?: string; message?: string }) => {
      const msg = body?.error ?? body?.message ?? fallback;
      throw new Error(typeof msg === 'string' ? msg : fallback);
    })
    .catch((err: unknown) => {
      // Rethrow API error messages we threw from .then; treat JSON parse/network errors as generic
      const isLikelyApiError =
        err instanceof Error &&
        !/JSON|Unexpected|SyntaxError|invalid json|Failed to fetch/i.test(err.message);
      if (isLikelyApiError) throw err;
      throw new Error(
        response.status === 502 || response.status === 503
          ? 'Service temporarily unavailable. Please try again.'
          : fallback
      );
    });
}

export const apiGet = async <T>(url: string): Promise<T> => {
  const response = await apiCall(url);
  if (!response.ok) throw await handleResponseError(response);
  return response.json();
};

export const apiPost = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiCall(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) throw await handleResponseError(response);
  return response.json();
};

export const apiPut = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiCall(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) throw await handleResponseError(response);
  return response.json();
};

export const apiDelete = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiCall(url, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) throw await handleResponseError(response);
  return response.json();
};

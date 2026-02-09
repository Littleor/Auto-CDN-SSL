const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type ApiError = {
  message: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as ApiError).message || "Request failed");
  }
  return data as T;
}

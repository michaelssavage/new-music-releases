import { withSpotifyRetries } from "@server/service/spotify-api/retry";
import axios from "axios";

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export async function getRequest<T>(
  url: string,
  token: string,
  params?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const response = await withSpotifyRetries(() =>
    axios.get<T>(url, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    })
  );

  return { data: response.data, status: response.status };
}

export async function postRequest<T>(
  url: string,
  token: string,
  data?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const response = await withSpotifyRetries(() =>
    axios.post<T>(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  );

  return { data: response.data, status: response.status };
}

export async function putRequest<T>(
  url: string,
  token: string,
  data?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const response = await withSpotifyRetries(() =>
    axios.put<T>(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
  );

  return { data: response.data, status: response.status };
}

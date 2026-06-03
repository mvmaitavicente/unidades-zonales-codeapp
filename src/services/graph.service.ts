import { getMsalRedirectUri, graphRequest } from "../authConfig";
import { msalInstance } from "../msalInstance";

export async function getGraphToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length === 0) {
    throw new Error("No existe una cuenta autenticada.");
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...graphRequest,
      account: accounts[0],
    });

    return response.accessToken;
  } catch {
    const response = await msalInstance.acquireTokenPopup({
      ...graphRequest,
      account: accounts[0],
      redirectUri: getMsalRedirectUri(),
    });

    return response.accessToken;
  }
}

export async function graphFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getGraphToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error Graph ${response.status}: ${errorText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
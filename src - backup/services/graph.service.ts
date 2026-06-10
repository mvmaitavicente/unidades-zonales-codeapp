import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { graphRequest } from "../authConfig";
import { msalInstance } from "../msalInstance";

let tokenPromise: Promise<string> | null = null;

export async function getGraphToken(): Promise<string> {
  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = obtenerNuevoToken();

  try {
    return await tokenPromise;
  } finally {
    tokenPromise = null;
  }
}

async function obtenerNuevoToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length === 0) {
    throw new Error("SESSION_EXPIRED");
  }

  try {
    const response = await msalInstance.acquireTokenSilent({
      ...graphRequest,
      account: accounts[0],
    });

    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      throw new Error("SESSION_EXPIRED");
    }

    throw error;
  }
}

export async function graphFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = await getGraphToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("SESSION_EXPIRED");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error Graph ${response.status}: ${errorText}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.message === "SESSION_EXPIRED") {
      console.warn("Sesión expirada o requiere interacción.");
      throw error;
    }

    console.error("Error en graphFetch:", error);
    throw error;
  }
}
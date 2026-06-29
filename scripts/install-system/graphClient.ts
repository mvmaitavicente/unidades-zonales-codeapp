import "dotenv/config";
import { DeviceCodeCredential } from "@azure/identity";

const tenantId = process.env.TenantId;
const clientId = process.env.ClientId;

if (!tenantId || !clientId) {
  throw new Error("Faltan TenantId o ClientId en el archivo .env");
}

const credential = new DeviceCodeCredential({
  tenantId,
  clientId,
  userPromptCallback: (info) => {
    console.log(info.message);
  },
});

const scopes = ["https://graph.microsoft.com/.default"];

export async function graphFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await credential.getToken(scopes);

  if (!token?.token) {
    throw new Error("No se pudo obtener token de Microsoft Graph.");
  }

  const response = await fetch(`https://graph.microsoft.com/v1.0${url}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token.token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    console.error(JSON.stringify(body, null, 2));
    throw new Error(`Graph error ${response.status} en ${url}`);
  }

  return body as T;
}

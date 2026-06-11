import type { AccountInfo } from "@azure/msal-browser";
import type { ClientInfo } from "../types/usuario.types";

function getBrowserName(): string {
  const ua = navigator.userAgent;

  if (ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Chrome")) return "Google Chrome";
  if (ua.includes("Firefox")) return "Mozilla Firefox";
  if (ua.includes("Safari")) return "Safari";

  return "Desconocido";
}

function getOperatingSystem(): string {
  const platform = navigator.platform.toLowerCase();
  const ua = navigator.userAgent.toLowerCase();

  if (platform.includes("win")) return "Windows";
  if (platform.includes("mac")) return "macOS";
  if (ua.includes("android")) return "Android";
  if (/iphone|ipad|ipod/.test(ua)) return "iOS";
  if (platform.includes("linux")) return "Linux";

  return "Desconocido";
}

async function getPublicIp(): Promise<string> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip ?? "No disponible";
  } catch {
    return "No disponible";
  }
}

export async function getClientInfo(user: AccountInfo): Promise<ClientInfo> {
  return {
    NombreUsuario: user.name ?? "No disponible",
    CorreoUsuario: user.username ?? "No disponible",
    IPPublica: await getPublicIp(),
    Navegador: getBrowserName(),
    SistemaOperativo: getOperatingSystem(),
  };
}
import type { MedioCoordinacion } from "../types/catalogo.types";

const FLOW_MEDIOS_URL =
  "https://5b61b3f50e90e928bcaee69127947f.06.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4629b2d545734c458b8e698ab7742f64/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=QlVR6SahW_71dbQBI_SBEUxebzH-d-hnScTaZOB64Bg";

const CACHE_KEY = "catalogo_UZ_MedioCoordinacion";
const CACHE_TIME_KEY = "catalogo_UZ_MedioCoordinacion_time";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

export async function listarMediosCoordinacion(): Promise<MedioCoordinacion[]> {
  const cache = localStorage.getItem(CACHE_KEY);
  const cacheTime = localStorage.getItem(CACHE_TIME_KEY);

  if (cache && cacheTime) {
    const edadCache = Date.now() - Number(cacheTime);

    if (edadCache < CACHE_DURATION) {
      return JSON.parse(cache) as MedioCoordinacion[];
    }
  }

  const response = await fetch(FLOW_MEDIOS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP al listar medios: ${response.status}`);
  }

  const result = await response.json();
  const data = (result.data ?? []) as MedioCoordinacion[];

  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

  return data;
}

export function limpiarCacheMediosCoordinacion(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIME_KEY);
}
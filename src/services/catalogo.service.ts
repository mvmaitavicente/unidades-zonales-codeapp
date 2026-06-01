import type { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";
import type { CatalogoVersion, MedioCoordinacion } from "../types/catalogo.types";

type MedioCoordinacionApi = {
  id: string;
  fields: {
    Title: string;
    field_1: string;
    Activo: boolean;
  };
};

type CatalogoVersionApi = {
  id: string;
  fields: CatalogoVersion;
};

const SITE_ID =
  "proniedoti.sharepoint.com,24c388e8-793d-47b7-8687-18028d6663f7,9939e5bc-b700-4b5d-a796-67bd4da3a462";

const LIST_ID_MEDIOS = "4a7ff98c-6f32-4eea-a1a1-d18797762d3c";
const LIST_ID_VERSIONES = "b29da8d8-031d-4c41-93c6-c259cb60e129";

const CACHE_MEDIOS_KEY = "catalogo_UZ_MedioCoordinacion";
const CACHE_MEDIOS_VERSION_KEY = "version_UZ_MedioCoordinacion";

async function getGraphToken(
  instance: IPublicClientApplication,
  user: AccountInfo
): Promise<string> {
  const token = await instance.acquireTokenSilent({
    account: user,
    scopes: ["Sites.ReadWrite.All"],
  });

  return token.accessToken;
}

function mapMedioCoordinacion(item: MedioCoordinacionApi): MedioCoordinacion {
  return {
    ID: Number(item.id),
    Codigo: item.fields.Title,
    Descripcion: item.fields.field_1,
    Activo: item.fields.Activo,
  };
}

async function obtenerVersionCatalogo(
  token: string,
  nombreTabla: string
): Promise<string | null> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${LIST_ID_VERSIONES}/items?expand=fields($select=ID,NombreTabla,TipoTabla,Modified)&$top=5000`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error Graph versiones:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorText,
    });
    throw new Error(`Error obteniendo versiones: ${response.status}`);
  }

  const result = await response.json();
  const dataApi = (result.value ?? []) as CatalogoVersionApi[];

  const item = dataApi.find((x) => x.fields.NombreTabla === nombreTabla);

  return item?.fields.Modified ?? null;
}

async function obtenerMediosDesdeSharePoint(
  token: string
): Promise<MedioCoordinacion[]> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${LIST_ID_MEDIOS}/items?expand=fields($select=ID,Title,field_1,Activo)&$top=5000`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error Graph medios:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorText,
    });
    throw new Error(`Error obteniendo medios: ${response.status}`);
  }

  const result = await response.json();
  const dataApi = (result.value ?? []) as MedioCoordinacionApi[];

  return dataApi.map(mapMedioCoordinacion);
}

export async function cargarMediosCoordinacion(
  instance: IPublicClientApplication,
  user: AccountInfo
): Promise<MedioCoordinacion[]> {
  const token = await getGraphToken(instance, user);
  const nombreTabla = "UZ_MedioCoordinacion";

  const versionServidor = await obtenerVersionCatalogo(token, nombreTabla);
  const versionLocal = localStorage.getItem(CACHE_MEDIOS_VERSION_KEY);
  const dataLocal = localStorage.getItem(CACHE_MEDIOS_KEY);

  if (versionServidor && versionLocal === versionServidor && dataLocal) {
    return JSON.parse(dataLocal) as MedioCoordinacion[];
  }

  const dataNueva = await obtenerMediosDesdeSharePoint(token);

  localStorage.setItem(CACHE_MEDIOS_KEY, JSON.stringify(dataNueva));

  if (versionServidor) {
    localStorage.setItem(CACHE_MEDIOS_VERSION_KEY, versionServidor);
  }

  return dataNueva;
}

export function limpiarCacheMediosCoordinacion(): void {
  localStorage.removeItem(CACHE_MEDIOS_KEY);
  localStorage.removeItem(CACHE_MEDIOS_VERSION_KEY);
}
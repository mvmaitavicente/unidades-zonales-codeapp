import type { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";

const SITE_ID =
  "proniedoti.sharepoint.com,24c388e8-793d-47b7-8687-18028d6663f7,9939e5bc-b700-4b5d-a796-67bd4da3a462";

const LIST_ID_MEDIOS = "4a7ff98c-6f32-4eea-a1a1-d18797762d3c";
const LIST_ID_VERSIONES = "b29da8d8-031d-4c41-93c6-c259cb60e129";

const VERSION_ITEM_ID_MEDIOS = 1; // ID del registro UZ_MedioCoordinacion en UZ_CatalogoVersion

export type CatalogoAccion = "crear" | "actualizar" | "eliminar";

export type GuardarCatalogoRequest = {
  accion: CatalogoAccion;
  id?: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
};

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

async function validarResponse(response: Response, contexto: string) {
  if (!response.ok) {
    const errorText = await response.text();

    console.error(`Error Graph ${contexto}:`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorText,
    });

    throw new Error(`Error Graph ${contexto}: ${response.status}`);
  }
}

export async function guardarCatalogo(
  instance: IPublicClientApplication,
  user: AccountInfo,
  payload: GuardarCatalogoRequest
): Promise<void> {
  const token = await getGraphToken(instance, user);

  if (payload.accion === "crear") {
    await crearMedio(token, payload);
  }

  if (payload.accion === "actualizar") {
    if (payload.id === undefined || payload.id === null) {
      throw new Error("Falta ID para actualizar.");
    }

    await actualizarMedio(token, payload.id, payload);
  }

  if (payload.accion === "eliminar") {
    if (payload.id === undefined || payload.id === null) {
      throw new Error("Falta ID para eliminar.");
    }

    await actualizarMedio(token, payload.id, {
      ...payload,
      activo: false,
    });
  }

  await actualizarVersionCatalogo(token);
}

async function crearMedio(
  token: string,
  payload: GuardarCatalogoRequest
): Promise<void> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${LIST_ID_MEDIOS}/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: payload.codigo,
          field_1: payload.descripcion,
          Activo: payload.activo,
        },
      }),
    }
  );

  await validarResponse(response, "crear medio");
}

async function actualizarMedio(
  token: string,
  id: number,
  payload: GuardarCatalogoRequest
): Promise<void> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${LIST_ID_MEDIOS}/items/${id}/fields`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Title: payload.codigo,
        field_1: payload.descripcion,
        Activo: payload.activo,
      }),
    }
  );

  await validarResponse(response, "actualizar medio");
}

async function actualizarVersionCatalogo(token: string): Promise<void> {
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/lists/${LIST_ID_VERSIONES}/items/${VERSION_ITEM_ID_MEDIOS}/fields`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        NombreTabla: "UZ_MedioCoordinacion",
        TipoTabla: "Parametrica",
      }),
    }
  );

  await validarResponse(response, "actualizar versión");
}
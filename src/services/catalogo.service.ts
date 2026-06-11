import type { CatalogoCampoExtra, CatalogoFormData, CatalogoItem } from "../types/catalogo.types";
import { graphFetch } from "./graph.service";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

type GraphListItem = {
  id: string;
  fields: Record<string, unknown>;
};

type GraphListItemsResponse = {
  value: GraphListItem[];
  "@odata.nextLink"?: string;
};


async function tocarVersionCatalogo(params: {
  siteId: string;
  nombreTabla?: string;
}): Promise<void> {
  if (!params.nombreTabla) return;

  const nombreSeguro = params.nombreTabla.replace(/'/g, "''");
  const listId = (await import("../config/sharepoint.config")).SHAREPOINT_CONFIG.lists.catalogoVersion;

  const url =
    `${GRAPH_BASE}/sites/${params.siteId}/lists/${listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=NombreTabla)` +
    `&$filter=fields/NombreTabla eq '${nombreSeguro}'` +
    `&$top=1`;

  const response = await graphFetch<GraphListItemsResponse>(url);
  const item = response.value[0];

  if (!item) return;

  await graphFetch(
    `${GRAPH_BASE}/sites/${params.siteId}/lists/${listId}/items/${item.id}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify({
        Version: new Date().toISOString(),
      }),
    }
  );
}

export async function listarCatalogo(params: {
  siteId: string;
  listId: string;
  campoDescripcion: string;
  camposExtra?: CatalogoCampoExtra[];
}): Promise<CatalogoItem[]> {
  const camposExtra = params.camposExtra ?? [];
  const selectFields = [
    "ID",
    params.campoDescripcion,
    "Activo",
    ...camposExtra.map((campo) => campo.key),
  ].join(",");

  let url =
    `${GRAPH_BASE}/sites/${params.siteId}/lists/${params.listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=${selectFields})` +
    `&$top=5000`;

  const registros: GraphListItem[] = [];

  while (url) {
    const response = await graphFetch<GraphListItemsResponse>(url);
    registros.push(...response.value);
    url = response["@odata.nextLink"] ?? "";
  }

  return registros.map((item) => {
    const extra: Record<string, unknown> = {};

    camposExtra.forEach((campo) => {
      extra[campo.key] = item.fields[campo.key] ?? "";
    });

    return {
      itemId: item.id,
      id: Number(item.fields.ID ?? item.id),
      descripcion: String(item.fields[params.campoDescripcion] ?? ""),
      activo: Boolean(item.fields.Activo),
      extra,
    };
  });
}

export async function crearCatalogo(params: {
  siteId: string;
  listId: string;
  campoDescripcion: string;
  data: CatalogoFormData;
  nombreTabla?: string;
}): Promise<void> {
  await graphFetch(`${GRAPH_BASE}/sites/${params.siteId}/lists/${params.listId}/items`, {
    method: "POST",
    body: JSON.stringify({
      fields: {
        Title: params.data.descripcion,
        [params.campoDescripcion]: params.data.descripcion,
        Activo: params.data.activo,
        ...(params.data.extra ?? {}),
      },
    }),
  });

  await tocarVersionCatalogo({
    siteId: params.siteId,
    nombreTabla: params.nombreTabla,
  });
}

export async function actualizarCatalogo(params: {
  siteId: string;
  listId: string;
  campoDescripcion: string;
  data: CatalogoFormData;
  nombreTabla?: string;
}): Promise<void> {
  if (!params.data.itemId) {
    throw new Error("El itemId es obligatorio para actualizar.");
  }

  await graphFetch(
    `${GRAPH_BASE}/sites/${params.siteId}/lists/${params.listId}/items/${params.data.itemId}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify({
        Title: params.data.descripcion,
        [params.campoDescripcion]: params.data.descripcion,
        Activo: params.data.activo,
        ...(params.data.extra ?? {}),
      }),
    }
  );

  await tocarVersionCatalogo({
    siteId: params.siteId,
    nombreTabla: params.nombreTabla,
  });
}

export async function cambiarEstadoCatalogo(params: {
  siteId: string;
  listId: string;
  itemId: string;
  activoActual: boolean;
  nombreTabla?: string;
}): Promise<void> {
  await graphFetch(
    `${GRAPH_BASE}/sites/${params.siteId}/lists/${params.listId}/items/${params.itemId}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify({
        Activo: !params.activoActual,
      }),
    }
  );

  await tocarVersionCatalogo({
    siteId: params.siteId,
    nombreTabla: params.nombreTabla,
  });
}
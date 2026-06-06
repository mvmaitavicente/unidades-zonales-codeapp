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
}

export async function actualizarCatalogo(params: {
  siteId: string;
  listId: string;
  campoDescripcion: string;
  data: CatalogoFormData;
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
}

export async function cambiarEstadoCatalogo(params: {
  siteId: string;
  listId: string;
  itemId: string;
  activoActual: boolean;
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
}
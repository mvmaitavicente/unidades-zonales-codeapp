import { SHAREPOINT_CONFIG } from "../config/sharepoint.config";
import type {
  MaestroConfig,
  MaestroFormData,
  MaestroItem,
} from "../types/maestro.types";
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

function getSelectFields(config: MaestroConfig): string {
  const fields = new Set<string>();

  fields.add("ID");

  config.fields.forEach((field) => {
    fields.add(field.key);

    if (field.type === "lookup") {
      fields.add(`${field.key}LookupId`);
    }
  });

  return Array.from(fields).join(",");
}

function normalizarItem(
  item: GraphListItem,
  config: MaestroConfig
): MaestroItem {
  const values: Record<string, unknown> = {};

  config.fields.forEach((field) => {
    if (field.type === "lookup") {
      values[`${field.key}Id`] = Number(
        item.fields[`${field.key}LookupId`] ?? 0
      );

      values[field.key] = String(item.fields[field.key] ?? "");
      return;
    }

    if (field.type === "boolean") {
      values[field.key] = Boolean(item.fields[field.key]);
      return;
    }

    values[field.key] = item.fields[field.key] ?? "";
  });

  return {
    itemId: item.id,
    id: Number(item.fields.ID ?? item.id),
    values,
  };
}

function getMaestroListId(config: MaestroConfig): string {
  if (!config.listaId) {
    throw new Error(
      `El maestro ${config.key} no tiene listaId configurado en maestros.config.ts.`
    );
  }

  return config.listaId;
}

export async function listarMaestro(
  config: MaestroConfig
): Promise<MaestroItem[]> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = getMaestroListId(config);
  const selectFields = getSelectFields(config);

  let url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=${selectFields})` +
    `&$top=5000`;

  const registros: GraphListItem[] = [];

  while (url) {
    const response = await graphFetch<GraphListItemsResponse>(url);
    registros.push(...response.value);
    url = response["@odata.nextLink"] ?? "";
  }

  return registros.map((item) => normalizarItem(item, config));
}

function construirPayloadFields(
  config: MaestroConfig,
  data: MaestroFormData
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  const titleField = config.titleField;

  fields.Title =
    titleField && data[titleField]
      ? String(data[titleField])
      : config.titulo;

  config.fields.forEach((field) => {
    const value = data[field.key];

    if (field.type === "lookup") {
      fields[`${field.key}LookupId`] = value ? Number(value) : null;
      return;
    }

    if (field.type === "boolean") {
      fields[field.key] = Boolean(value);
      return;
    }

    fields[field.key] = value ?? "";
  });

  return fields;
}

export async function crearMaestro(
  config: MaestroConfig,
  data: MaestroFormData
): Promise<void> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = getMaestroListId(config);

  await graphFetch(`${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items`, {
    method: "POST",
    body: JSON.stringify({
      fields: construirPayloadFields(config, data),
    }),
  });
}

export async function actualizarMaestro(params: {
  config: MaestroConfig;
  itemId: string;
  data: MaestroFormData;
}): Promise<void> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = getMaestroListId(params.config);

  await graphFetch(
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items/${params.itemId}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify(construirPayloadFields(params.config, params.data)),
    }
  );
}

export async function cambiarEstadoMaestro(params: {
  config: MaestroConfig;
  itemId: string;
  activoActual: boolean;
}): Promise<void> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = getMaestroListId(params.config);

  await graphFetch(
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items/${params.itemId}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify({
        Activo: !params.activoActual,
      }),
    }
  );
}
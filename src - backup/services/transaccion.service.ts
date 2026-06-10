import { SHAREPOINT_CONFIG } from "../config/sharepoint.config";
import type {
  TransaccionConfig,
  TransaccionFormData,
  TransaccionItem,
} from "../types/transaccion.types";
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

type GraphCreateItemResponse = {
  id: string;
};

function generarCodigoVisita(itemId: string | number) {
  const year = new Date().getFullYear();
  const correlativo = String(itemId).padStart(6, "0");
  return `VIS-${year}-${correlativo}`;
}

function getSelectFields(config: TransaccionConfig): string {
  const fields = new Set<string>();

  if (config.codigoField) {
    fields.add(config.codigoField);
  }

  config.fields.forEach((field) => {
    fields.add(field.key);

    if (field.type === "lookup") {
      fields.add(`${field.key}LookupId`);
    }
  });

  return Array.from(fields).join(",");
}

function construirPayloadFields(
  config: TransaccionConfig,
  data: TransaccionFormData
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  const titleValue =
    config.titleField && data[config.titleField]
      ? String(data[config.titleField])
      : config.titulo;

  fields.Title = titleValue;

  config.fields.forEach((field) => {
    const value = data[field.key];

    if (value === undefined || value === null || value === "") {
      return;
    }

    if (field.type === "lookup") {
      fields[`${field.key}LookupId`] = Number(value);
      return;
    }

    fields[field.key] = value;
  });

  return fields;
}

function normalizarItem(
  item: GraphListItem,
  config: TransaccionConfig
): TransaccionItem {
  const values: Record<string, unknown> = {};

  if (config.codigoField) {
    values[config.codigoField] = item.fields[config.codigoField] ?? "";
  }

  config.fields.forEach((field) => {
    if (field.type === "lookup") {
      values[field.key] = item.fields[field.key] ?? "";
      values[`${field.key}Id`] = Number(
        item.fields[`${field.key}LookupId`] ?? 0
      );
      return;
    }

    values[field.key] = item.fields[field.key] ?? "";
  });

  return {
    itemId: item.id,
    id: Number(item.id),
    values,
  };
}

export async function listarTransacciones(
  config: TransaccionConfig
): Promise<TransaccionItem[]> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = config.listaId;
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

export async function crearTransaccion(
  config: TransaccionConfig,
  data: TransaccionFormData
): Promise<string> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = config.listaId;

  const creado = await graphFetch<GraphCreateItemResponse>(
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items`,
    {
      method: "POST",
      body: JSON.stringify({
        fields: construirPayloadFields(config, data),
      }),
    }
  );

  if (!config.codigoField) {
    return "";
  }

  const codigo = generarCodigoVisita(creado.id);

  await graphFetch(
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items/${creado.id}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify({
        [config.codigoField]: codigo,
      }),
    }
  );

  return codigo;
}

export async function actualizarTransaccion(params: {
  config: TransaccionConfig;
  itemId: string;
  data: TransaccionFormData;
}): Promise<void> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = params.config.listaId;

  await graphFetch(
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items/${params.itemId}/fields`,
    {
      method: "PATCH",
      body: JSON.stringify(
        construirPayloadFields(params.config, params.data)
      ),
    }
  );
}

export async function eliminarTransaccion(params: {
  config: TransaccionConfig;
  itemId: string;
}): Promise<void> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = params.config.listaId;

  await graphFetch(
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items/${params.itemId}`,
    {
      method: "DELETE",
    }
  );
}
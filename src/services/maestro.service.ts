import { graphFetch } from "./graph.service";
import type {
  LookupOption,
  MaestroConfig,
  MaestroFieldConfig,
  MaestroFormData,
  MaestroItem,
} from "../types/maestro.types";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

const HOSTNAME = "proniedoti.sharepoint.com";
const SITE_PATH = "/sites/OTI_PUBLICACION";

type GraphSiteResponse = {
  id: string;
};

type GraphListResponse = {
  id: string;
};

type GraphListItem = {
  id: string;
  fields: Record<string, unknown>;
};

type GraphListItemsResponse = {
  value: GraphListItem[];
  "@odata.nextLink"?: string;
};

const siteCache: Record<string, string> = {};
const listCache: Record<string, string> = {};

async function getSiteId(): Promise<string> {
  const cacheKey = `${HOSTNAME}${SITE_PATH}`;

  if (siteCache[cacheKey]) {
    return siteCache[cacheKey];
  }

  const site = await graphFetch<GraphSiteResponse>(
    `${GRAPH_BASE}/sites/${HOSTNAME}:${SITE_PATH}`
  );

  siteCache[cacheKey] = site.id;
  return site.id;
}

async function getListId(listaSharePoint: string): Promise<string> {
  const siteId = await getSiteId();
  const cacheKey = `${siteId}_${listaSharePoint}`;

  if (listCache[cacheKey]) {
    return listCache[cacheKey];
  }

  const list = await graphFetch<GraphListResponse>(
    `${GRAPH_BASE}/sites/${siteId}/lists/${listaSharePoint}`
  );

  listCache[cacheKey] = list.id;
  return list.id;
}

async function getListContext(listaSharePoint: string) {
  const siteId = await getSiteId();
  const listId = await getListId(listaSharePoint);

  return { siteId, listId };
}

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
    } else {
      values[field.key] = item.fields[field.key] ?? "";
    }
  });

  return {
    itemId: item.id,
    id: Number(item.fields.ID ?? item.id),
    values,
  };
}

export async function listarMaestro(
  config: MaestroConfig
): Promise<MaestroItem[]> {
  const { siteId, listId } = await getListContext(config.listaSharePoint);

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

export async function listarLookupOptions(
  listaSharePoint: string,
  campoTexto = "Descripcion"
): Promise<LookupOption[]> {
  const { siteId, listId } = await getListContext(listaSharePoint);

  const url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=${campoTexto},Activo)` +
    `&$top=5000`;

  const response = await graphFetch<GraphListItemsResponse>(url);

  return response.value
    .filter((item) => {
      if (item.fields.Activo === undefined) return true;
      return Boolean(item.fields.Activo);
    })
    .map((item) => ({
      value: Number(item.id),
      label: String(item.fields[campoTexto] ?? ""),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function cargarLookupsMaestro(
  config: MaestroConfig
): Promise<Record<string, LookupOption[]>> {
  const lookupFields = config.fields.filter(
    (field): field is MaestroFieldConfig =>
      field.type === "lookup" && Boolean(field.lookupList)
  );

  const entries = await Promise.all(
    lookupFields.map(async (field) => {
      const options = await listarLookupOptions(
        field.lookupList!,
        field.lookupTextField ?? "Descripcion"
      );

      return [field.key, options] as const;
    })
  );

  return Object.fromEntries(entries);
}

function construirPayloadFields(
  config: MaestroConfig,
  data: MaestroFormData
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  const titleField = config.titleField;
  const titleValue =
    titleField && data[titleField]
      ? String(data[titleField])
      : config.titulo;

  fields.Title = titleValue;

  config.fields.forEach((field) => {
    const value = data[field.key];

    if (field.type === "lookup") {
      fields[`${field.key}LookupId`] = Number(value);
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
  const { siteId, listId } = await getListContext(config.listaSharePoint);

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
  const { siteId, listId } = await getListContext(
    params.config.listaSharePoint
  );

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
  const { siteId, listId } = await getListContext(
    params.config.listaSharePoint
  );

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
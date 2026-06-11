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

export type RawSharePointItem = {
  itemId: string;
  values: Record<string, unknown>;
};

function escapeODataValue(value: string): string {
  return value.replace(/'/g, "''");
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

function getMaestroListId(config: MaestroConfig): string {
  if (!config.listaId) {
    throw new Error(
      `El maestro ${config.key} no tiene listaId configurado en maestros.config.ts.`
    );
  }

  return config.listaId;
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

    if (value === undefined || value === null) {
      fields[field.key] = "";
      return;
    }

    fields[field.key] = value;
  });

  return fields;
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

export async function buscarMaestroPorCampo(params: {
  config: MaestroConfig;
  campo: string;
  valor: string;
}): Promise<MaestroItem | null> {
  const valor = params.valor.trim();

  if (!valor) return null;

  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = getMaestroListId(params.config);
  const selectFields = getSelectFields(params.config);
  const valorSeguro = escapeODataValue(valor);

  const url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=${selectFields})` +
    `&$filter=fields/${params.campo} eq '${valorSeguro}'` +
    `&$top=1`;

  const response = await graphFetch<GraphListItemsResponse>(url);

  const item = response.value[0];

  if (!item) return null;

  return normalizarItem(item, params.config);
}

export async function buscarMaestroPorDocumento(params: {
  config: MaestroConfig;
  nroDocumento: string;
}): Promise<MaestroItem | null> {
  return buscarMaestroPorCampo({
    config: params.config,
    campo: "NroDocumentoIdentidad",
    valor: params.nroDocumento,
  });
}

export async function existeDocumentoMaestro(params: {
  config: MaestroConfig;
  nroDocumento: string;
  itemIdActual?: string;
}): Promise<boolean> {
  const item = await buscarMaestroPorDocumento({
    config: params.config,
    nroDocumento: params.nroDocumento,
  });

  if (!item) return false;

  if (params.itemIdActual) {
    return item.itemId !== params.itemIdActual;
  }

  return true;
}

async function validarDocumentoDuplicado(params: {
  config: MaestroConfig;
  data: MaestroFormData;
  itemIdActual?: string;
}): Promise<void> {
  const tieneCampoDocumento = params.config.fields.some(
    (field) => field.key === "NroDocumentoIdentidad"
  );

  if (!tieneCampoDocumento) return;

  const nroDocumento = String(params.data.NroDocumentoIdentidad ?? "").trim();

  if (!nroDocumento) return;

  const existe = await existeDocumentoMaestro({
    config: params.config,
    nroDocumento,
    itemIdActual: params.itemIdActual,
  });

  if (existe) {
    throw new Error(
      `Ya existe un registro con el documento ${nroDocumento}.`
    );
  }
}

export async function crearMaestro(
  config: MaestroConfig,
  data: MaestroFormData
): Promise<void> {
  await validarDocumentoDuplicado({
    config,
    data,
  });

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
  await validarDocumentoDuplicado({
    config: params.config,
    data: params.data,
    itemIdActual: params.itemId,
  });

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

/**
 * Búsqueda genérica para listas maestras como UZ_LocalEscolar
 * sin necesidad de crear otro service.
 */
export async function buscarItemListaPorCampo(params: {
  listId: string;
  campo: string;
  valor: string;
  selectFields: string[];
}): Promise<RawSharePointItem | null> {
  const valor = params.valor.trim();

  if (!valor) return null;

  const siteId = SHAREPOINT_CONFIG.siteId;
  const valorSeguro = escapeODataValue(valor);

  const url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${params.listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=${params.selectFields.join(",")})` +
    `&$filter=fields/${params.campo} eq '${valorSeguro}'` +
    `&$top=1`;

  const response = await graphFetch<GraphListItemsResponse>(url);

  const item = response.value[0];

  if (!item) return null;

  return {
    itemId: item.id,
    values: item.fields,
  };
}

export async function buscarItemsListaConFiltros(params: {
  listId: string;
  selectFields: string[];
  filtros?: Array<{
    campo: string;
    valor: string | number | Array<string | number>;
    operador?: "eq" | "contains" | "in";
    tipo?: "text" | "number";
  }>;
  top?: number;
}): Promise<RawSharePointItem[]> {
  const siteId = SHAREPOINT_CONFIG.siteId;

  const filtros = (params.filtros ?? [])
    .filter((filtro) =>
      Array.isArray(filtro.valor)
        ? filtro.valor.length > 0
        : String(filtro.valor ?? "").trim() !== ""
    )
    .map((filtro) => {
      if (filtro.operador === "in" && Array.isArray(filtro.valor)) {
        const condiciones = filtro.valor
          .map((valor) => String(valor).trim())
          .filter(Boolean)
          .map((valor) => {
            if (filtro.tipo === "number") {
              return `fields/${filtro.campo} eq ${Number(valor)}`;
            }

            const valorSeguro = escapeODataValue(valor);
            return `fields/${filtro.campo} eq '${valorSeguro}'`;
          });

        return condiciones.length ? `(${condiciones.join(" or ")})` : "";
      }

      const valorNormalizado = String(filtro.valor).trim();

      if (filtro.operador === "contains") {
        const valorSeguro = escapeODataValue(valorNormalizado);
        return `contains(fields/${filtro.campo},'${valorSeguro}')`;
      }

      if (filtro.tipo === "number") {
        return `fields/${filtro.campo} eq ${Number(valorNormalizado)}`;
      }

      const valorSeguro = escapeODataValue(valorNormalizado);
      return `fields/${filtro.campo} eq '${valorSeguro}'`;
    });

  const filtrosValidos = filtros.filter(Boolean);

  const filterQuery = filtrosValidos.length
    ? `&$filter=${filtrosValidos.join(" and ")}`
    : "";

  let url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${params.listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=${params.selectFields.join(",")})` +
    filterQuery +
    `&$top=${params.top ?? 5000}`;

  const registros: GraphListItem[] = [];

  while (url) {
    const response = await graphFetch<GraphListItemsResponse>(url);
    registros.push(...response.value);
    url = response["@odata.nextLink"] ?? "";
  }

  return registros.map((item) => ({
    itemId: item.id,
    values: item.fields,
  }));
}
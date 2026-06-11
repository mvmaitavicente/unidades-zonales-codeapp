import { SHAREPOINT_CONFIG } from "../config/sharepoint.config";
import { graphFetch } from "./graph.service";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

type GraphListItem = {
  id: string;
  fields: Record<string, unknown>;
};

type GraphListItemsResponse = {
  value: GraphListItem[];
};

export type RegionOption = {
  id: string;
  Region: string;
  RegionSinAcento: string;
};

export type ProvinciaOption = {
  id: string;
  Provincia: string;
  ProvinciaSinAcento: string;
  RegionSinAcento: string;
};

export type DistritoOption = {
  id: string;
  Distrito: string;
  DistritoSinAcento: string;
  RegionSinAcento: string;
  ProvinciaSinAcento: string;
};

function escapeODataValue(value: string): string {
  return value.replace(/'/g, "''").trim();
}

export async function listarRegiones(): Promise<RegionOption[]> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = SHAREPOINT_CONFIG.lists.region;

  const url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=Region,RegionSinAcento)` +
    `&$orderby=fields/Region asc` +
    `&$top=200`;

  const response = await graphFetch<GraphListItemsResponse>(url);

  return response.value.map((item) => ({
    id: item.id,
    Region: String(item.fields.Region ?? ""),
    RegionSinAcento: String(item.fields.RegionSinAcento ?? ""),
  }));
}

export async function listarProvinciasPorRegion(
  regionSinAcento: string
): Promise<ProvinciaOption[]> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = SHAREPOINT_CONFIG.lists.provincia;
  const region = escapeODataValue(regionSinAcento);

  const url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=Provincia,ProvinciaSinAcento,RegionSinAcento)` +
    `&$filter=fields/RegionSinAcento eq '${region}'` +
    `&$orderby=fields/Provincia asc` +
    `&$top=500`;

  const response = await graphFetch<GraphListItemsResponse>(url);

  return response.value.map((item) => ({
    id: item.id,
    Provincia: String(item.fields.Provincia ?? ""),
    ProvinciaSinAcento: String(item.fields.ProvinciaSinAcento ?? ""),
    RegionSinAcento: String(item.fields.RegionSinAcento ?? ""),
  }));
}

export async function listarDistritosPorProvincia(params: {
  regionSinAcento: string;
  provinciaSinAcento: string;
}): Promise<DistritoOption[]> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = SHAREPOINT_CONFIG.lists.distrito;

  const region = escapeODataValue(params.regionSinAcento);
  const provincia = escapeODataValue(params.provinciaSinAcento);

  const url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=Distrito,DistritoSinAcento,RegionSinAcento,ProvinciaSinAcento)` +
    `&$filter=fields/RegionSinAcento eq '${region}' and fields/ProvinciaSinAcento eq '${provincia}'` +
    `&$orderby=fields/Distrito asc` +
    `&$top=1000`;

  const response = await graphFetch<GraphListItemsResponse>(url);

  return response.value.map((item) => ({
    id: item.id,
    Distrito: String(item.fields.Distrito ?? ""),
    DistritoSinAcento: String(item.fields.DistritoSinAcento ?? ""),
    RegionSinAcento: String(item.fields.RegionSinAcento ?? ""),
    ProvinciaSinAcento: String(item.fields.ProvinciaSinAcento ?? ""),
  }));
}
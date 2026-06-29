import { graphFetch } from "./graphClient";
import type { ColumnSchema, ListSchema } from "./schema";

type GraphList = { id: string; displayName: string; name?: string };
type GraphColumn = { id: string; name: string; displayName?: string };
type GraphItem = { id: string; fields: Record<string, unknown> };

export async function getSiteId(): Promise<string> {
  const siteId = process.env.SiteId;
  if (siteId) return siteId;

  const hostname = process.env.SiteHostname;
  const sitePath = process.env.SitePath;

  if (!hostname || !sitePath) {
    throw new Error("Configura SiteId o SiteHostname + SitePath en .env");
  }

  const site = await graphFetch<{ id: string }>(`/sites/${hostname}:/${sitePath}`);
  return site.id;
}

export async function getLists(siteId: string): Promise<GraphList[]> {
  const res = await graphFetch<{ value: GraphList[] }>(`/sites/${siteId}/lists?$select=id,displayName,name`);
  return res.value;
}

export async function ensureList(siteId: string, list: ListSchema): Promise<GraphList> {
  const existing = (await getLists(siteId)).find((x) => x.displayName === list.name || x.name === list.name);
  if (existing) {
    console.log(`= Lista existe: ${list.name}`);
    return existing;
  }

  const created = await graphFetch<GraphList>(`/sites/${siteId}/lists`, {
    method: "POST",
    body: JSON.stringify({
      displayName: list.name,
      description: list.description,
      list: { template: "genericList" },
    }),
  });

  console.log(`+ Lista creada: ${list.name}`);
  return created;
}

export async function getColumns(siteId: string, listId: string): Promise<GraphColumn[]> {
  const res = await graphFetch<{ value: GraphColumn[] }>(`/sites/${siteId}/lists/${listId}/columns?$select=id,name,displayName`);
  return res.value;
}

function columnPayload(column: ColumnSchema, listIdsByName: Record<string, string>) {
  const base: Record<string, unknown> = {
    name: column.name,
    displayName: column.name,
    required: Boolean(column.required),
    indexed: Boolean(column.indexed),
  };

  if (column.type === "text") return { ...base, text: {} };
  if (column.type === "multilineText") return { ...base, text: { allowMultipleLines: true } };
  if (column.type === "number") return { ...base, number: { decimalPlaces: "none" } };
  if (column.type === "boolean") return { ...base, boolean: {} };
  if (column.type === "dateTime") return { ...base, dateTime: { displayAs: "default" } };

  if (column.type === "lookup") {
    if (!column.lookupList) throw new Error(`Lookup sin lookupList: ${column.name}`);
    const lookupListId = listIdsByName[column.lookupList];
    if (!lookupListId) throw new Error(`No existe lista lookup ${column.lookupList} para ${column.name}`);

    return {
      ...base,
      lookup: {
        listId: lookupListId,
        columnName: column.lookupColumn ?? "Title",
        allowMultipleValues: false,
      },
    };
  }

  throw new Error(`Tipo no soportado: ${column.type}`);
}

export async function ensureColumn(siteId: string, listId: string, column: ColumnSchema, listIdsByName: Record<string, string>) {
  const columns = await getColumns(siteId, listId);
  const existing = columns.find((x) => x.name === column.name || x.displayName === column.name);
  if (existing) {
    console.log(`  = Columna existe: ${column.name}`);
    return existing;
  }

  const created = await graphFetch<GraphColumn>(`/sites/${siteId}/lists/${listId}/columns`, {
    method: "POST",
    body: JSON.stringify(columnPayload(column, listIdsByName)),
  });

  console.log(`  + Columna creada: ${column.name}`);
  return created;
}

export async function findItemByField(siteId: string, listId: string, field: string, value: string): Promise<GraphItem | null> {
  const safe = value.replace(/'/g, "''");
  const res = await graphFetch<{ value: GraphItem[] }>(
    `/sites/${siteId}/lists/${listId}/items?$expand=fields&$filter=fields/${field} eq '${safe}'`
  );
  return res.value[0] ?? null;
}

export async function ensureItem(siteId: string, listId: string, uniqueField: string, uniqueValue: string, fields: Record<string, unknown>) {
  const existing = await findItemByField(siteId, listId, uniqueField, uniqueValue);
  if (existing) {
    console.log(`  = Item existe: ${uniqueValue}`);
    return existing;
  }

  const created = await graphFetch<GraphItem>(`/sites/${siteId}/lists/${listId}/items`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });

  console.log(`  + Item creado: ${uniqueValue}`);
  return created;
}

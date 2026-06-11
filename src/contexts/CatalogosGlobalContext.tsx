import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { graphFetch } from "../services/graph.service";
import {
  catalogosGlobalConfig,
  type CatalogoGlobalKey,
} from "../config/catalogos-global.config";
import { SHAREPOINT_CONFIG } from "../config/sharepoint.config";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const CACHE_PREFIX = "catalogo_global";
const VERSION_CACHE_KEY = "catalogo_global_versions";

export type LookupOption = {
  value: number;
  label: string;
  extra?: Record<string, unknown>;
};

type CatalogosGlobalState = Record<CatalogoGlobalKey, LookupOption[]>;
type VersionMap = Record<string, string>;

type CatalogosGlobalContextValue = {
  catalogos: CatalogosGlobalState;
  loading: boolean;
  cargado: boolean;
  recargarCatalogos: () => Promise<void>;
};

type GraphListItemsResponse = {
  value: Array<{
    id: string;
    fields: Record<string, unknown>;
  }>;
  "@odata.nextLink"?: string;
};

const initialState: CatalogosGlobalState = {
  tiposDocumento: [],
  cargos: [],
  tiposEntidad: [],
  unidadesZonales: [],
  mediosCoordinacion: [],
  modalidadContratacion: [],
};

export const CatalogosGlobalContext =
  createContext<CatalogosGlobalContextValue | null>(null);

function cacheKey(key: CatalogoGlobalKey) {
  return `${CACHE_PREFIX}_${key}`;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizarVersion(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

async function listarVersionesCatalogos(): Promise<VersionMap> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = SHAREPOINT_CONFIG.lists.catalogoVersion;

  let url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=NombreTabla,Modified)` +
    `&$top=5000`;

  const versiones: VersionMap = {};

  while (url) {
    const response = await graphFetch<GraphListItemsResponse>(url);

    response.value.forEach((item) => {
      const nombreTabla = String(item.fields.NombreTabla ?? "").trim();
      if (!nombreTabla) return;
      versiones[nombreTabla] = normalizarVersion(item.fields.Modified);
    });

    url = response["@odata.nextLink"] ?? "";
  }

  return versiones;
}

async function listarOpcionesCatalogo(params: {
  listId: string;
  campoTexto: string;
  campoActivo?: string;
  camposExtra?: string[];
}): Promise<LookupOption[]> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const campos = [params.campoTexto, ...(params.camposExtra ?? [])];

  if (params.campoActivo) {
    campos.push(params.campoActivo);
  }

  let url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${params.listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=${campos.join(",")})` +
    `&$top=5000`;

  const registros: GraphListItemsResponse["value"] = [];

  while (url) {
    const response = await graphFetch<GraphListItemsResponse>(url);
    registros.push(...response.value);
    url = response["@odata.nextLink"] ?? "";
  }

  return registros
    .filter((item) => {
      if (!params.campoActivo) return true;
      if (item.fields[params.campoActivo] === undefined) return true;
      return Boolean(item.fields[params.campoActivo]);
    })
    .map((item) => ({
      value: Number(item.id),
      label: String(item.fields[params.campoTexto] ?? ""),
      extra: params.camposExtra?.reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = item.fields[key];
        return acc;
      }, {}),
    }))
    .filter((item) => item.label.trim() !== "")
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function CatalogosGlobalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [catalogos, setCatalogos] =
    useState<CatalogosGlobalState>(initialState);
  const [loading, setLoading] = useState(false);
  const [cargado, setCargado] = useState(false);

  const yaCargoRef = useRef(false);

  const recargarCatalogos = useCallback(async () => {
    setLoading(true);

    try {
      const versionesRemotas = await listarVersionesCatalogos();
      const versionesLocales = readJson<VersionMap>(VERSION_CACHE_KEY, {});
      const nextState: CatalogosGlobalState = { ...initialState };
      const versionesActualizadas: VersionMap = { ...versionesLocales };

      await Promise.all(
        catalogosGlobalConfig.map(async (config) => {
          const versionRemota = versionesRemotas[config.nombreTabla] ?? "";
          const versionLocal = versionesLocales[config.nombreTabla] ?? "";
          const cacheLocal = readJson<LookupOption[] | null>(
            cacheKey(config.key),
            null
          );

          const usarCache =
            cacheLocal &&
            cacheLocal.length >= 0 &&
            versionRemota !== "" &&
            versionRemota === versionLocal;

          if (usarCache) {
            nextState[config.key] = cacheLocal;
            return;
          }

          const options = await listarOpcionesCatalogo({
            listId: config.listId,
            campoTexto: config.campoTexto,
            campoActivo: config.campoActivo,
            camposExtra: config.camposExtra,
          });

          nextState[config.key] = options;
          writeJson(cacheKey(config.key), options);
          versionesActualizadas[config.nombreTabla] = versionRemota;
        })
      );

      writeJson(VERSION_CACHE_KEY, versionesActualizadas);
      setCatalogos(nextState);
      setCargado(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cargado || yaCargoRef.current) return;
    yaCargoRef.current = true;
    recargarCatalogos();
  }, [cargado, recargarCatalogos]);

  const value = useMemo(
    () => ({
      catalogos,
      loading,
      cargado,
      recargarCatalogos,
    }),
    [catalogos, loading, cargado, recargarCatalogos]
  );

  return (
    <CatalogosGlobalContext.Provider value={value}>
      {children}
    </CatalogosGlobalContext.Provider>
  );
}

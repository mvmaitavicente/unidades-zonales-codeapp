import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { graphFetch } from "../services/graph.service";
import {
  catalogosGlobalConfig,
  type CatalogoGlobalKey,
} from "../config/catalogos-global.config";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const HOSTNAME = "proniedoti.sharepoint.com";
const SITE_PATH = "/sites/OTI_PUBLICACION";

export type LookupOption = {
  value: number;
  label: string;
};

type CatalogosGlobalState = Record<CatalogoGlobalKey, LookupOption[]>;

type CatalogosGlobalContextValue = {
  catalogos: CatalogosGlobalState;
  loading: boolean;
  cargado: boolean;
  recargarCatalogos: () => Promise<void>;
};

type GraphSiteResponse = {
  id: string;
};

type GraphListResponse = {
  id: string;
};

type GraphListItemsResponse = {
  value: Array<{
    id: string;
    fields: Record<string, unknown>;
  }>;
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

async function listarOpcionesCatalogo(params: {
  listaSharePoint: string;
  campoTexto: string;
  campoActivo?: string;
}): Promise<LookupOption[]> {
  const siteId = await getSiteId();
  const listId = await getListId(params.listaSharePoint);

  const campos = [params.campoTexto];

  if (params.campoActivo) {
    campos.push(params.campoActivo);
  }

  const url =
    `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items` +
    `?$select=id` +
    `&$expand=fields($select=${campos.join(",")})` +
    `&$top=5000`;

  const response = await graphFetch<GraphListItemsResponse>(url);

  return response.value
    .filter((item) => {
      if (!params.campoActivo) return true;
      if (item.fields[params.campoActivo] === undefined) return true;
      return Boolean(item.fields[params.campoActivo]);
    })
    .map((item) => ({
      value: Number(item.id),
      label: String(item.fields[params.campoTexto] ?? ""),
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

  const recargarCatalogos = useCallback(async () => {
    setLoading(true);

    try {
      const entries = await Promise.all(
        catalogosGlobalConfig.map(async (config) => {
          const options = await listarOpcionesCatalogo({
            listaSharePoint: config.listaSharePoint,
            campoTexto: config.campoTexto,
            campoActivo: config.campoActivo,
          });

          return [config.key, options] as const;
        })
      );

      setCatalogos({
        ...initialState,
        ...Object.fromEntries(entries),
      });

      setCargado(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cargado) {
      recargarCatalogos();
    }
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
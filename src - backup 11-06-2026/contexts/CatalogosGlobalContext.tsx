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

async function listarOpcionesCatalogo(params: {
  listId: string;
  campoTexto: string;
  campoActivo?: string;
  camposExtra?: string[];
}): Promise<LookupOption[]> {
  const siteId = SHAREPOINT_CONFIG.siteId;
  const listId = params.listId;

  const campos = [
    params.campoTexto,
    ...(params.camposExtra ?? []),
  ];

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
      const entries = await Promise.all(
        catalogosGlobalConfig.map(async (config) => {
          const options = await listarOpcionesCatalogo({
            listId: config.listId,
            campoTexto: config.campoTexto,
            campoActivo: config.campoActivo,
            camposExtra: config.camposExtra,
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
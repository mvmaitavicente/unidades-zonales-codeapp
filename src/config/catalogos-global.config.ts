import { SHAREPOINT_CONFIG } from "./sharepoint.config";

export type CatalogoGlobalKey =
  | "tiposDocumento"
  | "cargos"
  | "tiposEntidad"
  | "unidadesZonales"
  | "mediosCoordinacion"
  | "modalidadContratacion";

export type CatalogoGlobalConfig = {
  key: CatalogoGlobalKey;
  listId: string;
  campoTexto: string;
  campoActivo?: string;
  camposExtra?: string[];
};

export const catalogosGlobalConfig: CatalogoGlobalConfig[] = [
  {
    key: "tiposDocumento",
    listId: SHAREPOINT_CONFIG.lists.tipoDocumento,
    campoTexto: "field_1",
    campoActivo: "Activo",
    camposExtra: ["LongitudMinima", "LongitudMaxima", "SoloNumeros"],
  },
  {
    key: "cargos",
    listId: SHAREPOINT_CONFIG.lists.cargo,
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "tiposEntidad",
    listId: SHAREPOINT_CONFIG.lists.tipoEntidad,
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "unidadesZonales",
    listId: SHAREPOINT_CONFIG.lists.unidadZonal,
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "mediosCoordinacion",
    listId: SHAREPOINT_CONFIG.lists.medioCoordinacion,
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "modalidadContratacion",
    listId: SHAREPOINT_CONFIG.lists.modalidadContratacion,
    campoTexto: "DescripcionModalidad",
    campoActivo: "Activo",
  },
];
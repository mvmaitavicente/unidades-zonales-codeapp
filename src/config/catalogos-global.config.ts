import { SHAREPOINT_CONFIG } from "./sharepoint.config";

export type CatalogoGlobalKey =
  | "tiposDocumento"
  | "cargos"
  | "tiposEntidad"
  | "unidadesZonales"
  | "mediosCoordinacion"
  | "modalidadContratacion"
  | "carrerasPersonal";

export type CatalogoGlobalConfig = {
  key: CatalogoGlobalKey;
  listId: string;
  campoTexto: string;
  campoActivo?: string;
  camposExtra?: string[];
  nombreTabla: string;
};

export const catalogosGlobalConfig: CatalogoGlobalConfig[] = [
  {
    key: "tiposDocumento",
    nombreTabla: "UZ_TipoDocumentoIdentidad",
    listId: SHAREPOINT_CONFIG.lists.tipoDocumento,
    campoTexto: "field_1",
    campoActivo: "Activo",
    camposExtra: ["LongitudMinima", "LongitudMaxima", "SoloNumeros"],
  },
  {
    key: "cargos",
    nombreTabla: "UZ_Cargo",
    listId: SHAREPOINT_CONFIG.lists.cargo,
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "tiposEntidad",
    nombreTabla: "UZ_TipoEntidad",
    listId: SHAREPOINT_CONFIG.lists.tipoEntidad,
    campoTexto: "TipoEntidad",
    campoActivo: "Activo",
  },
  {
    key: "unidadesZonales",
    nombreTabla: "UZ_UnidadZonal",
    listId: SHAREPOINT_CONFIG.lists.unidadZonal,
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "carrerasPersonal",
    nombreTabla: "UZ_CarreraPersonal",
    listId: SHAREPOINT_CONFIG.lists.carreraPersonal,
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "mediosCoordinacion",
    nombreTabla: "UZ_MedioCoordinacion",
    listId: SHAREPOINT_CONFIG.lists.medioCoordinacion,
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "modalidadContratacion",
    nombreTabla: "UZ_ModalidadContratacion",
    listId: SHAREPOINT_CONFIG.lists.modalidadContratacion,
    campoTexto: "DescripcionModalidad",
    campoActivo: "Activo",
  },
];
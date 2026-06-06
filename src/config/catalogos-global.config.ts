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
};

export const catalogosGlobalConfig: CatalogoGlobalConfig[] = [
  {
    key: "tiposDocumento",
    listId: "UZ_TipoDocumentoIdentidad",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "cargos",
    listId: "UZ_Cargo",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "tiposEntidad",
    listId: "UZ_TipoEntidad",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "unidadesZonales",
    listId: "UZ_UnidadZonal",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "mediosCoordinacion",
    listId: "UZ_MedioCoordinacion",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "modalidadContratacion",
    listId: "UZ_ModalidadContratacion",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
];
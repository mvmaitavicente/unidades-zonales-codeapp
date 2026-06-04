export type CatalogoGlobalKey =
  | "tiposDocumento"
  | "cargos"
  | "tiposEntidad"
  | "unidadesZonales"
  | "mediosCoordinacion"
  | "modalidadContratacion";

export type CatalogoGlobalConfig = {
  key: CatalogoGlobalKey;
  listaSharePoint: string;
  campoTexto: string;
  campoActivo?: string;
};

export const catalogosGlobalConfig: CatalogoGlobalConfig[] = [
  {
    key: "tiposDocumento",
    listaSharePoint: "UZ_TipoDocumentoIdentidad",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "cargos",
    listaSharePoint: "UZ_Cargo",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "tiposEntidad",
    listaSharePoint: "UZ_TipoEntidad",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "unidadesZonales",
    listaSharePoint: "UZ_UnidadZonal",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "mediosCoordinacion",
    listaSharePoint: "UZ_MedioCoordinacion",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
  {
    key: "modalidadContratacion",
    listaSharePoint: "UZ_ModalidadContratacion",
    campoTexto: "field_1",
    campoActivo: "Activo",
  },
];
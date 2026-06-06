import { SHAREPOINT_CONFIG } from "../config/sharepoint.config";

export const catalogosConfig = {
  "tipo-documento-identidad": {
    titulo: "Tipo Documento",
    listaSharePoint: "UZ_TipoDocumentoIdentidad",
    siteId: SHAREPOINT_CONFIG.siteId,
    listId: SHAREPOINT_CONFIG.lists.tipoDocumento,
    campoDescripcion: "field_1",
    labelDescripcion: "Tipo de documento",
    camposExtra: [],
  },

  cargo: {
    titulo: "Cargo",
    listaSharePoint: "UZ_Cargo",
    siteId: SHAREPOINT_CONFIG.siteId,
    listId: SHAREPOINT_CONFIG.lists.cargo,
    campoDescripcion: "field_1",
    labelDescripcion: "Cargo",
    camposExtra: [],
  },

  "medio-coordinacion": {
    titulo: "Medio Coordinación",
    listaSharePoint: "UZ_MedioCoordinacion",
    siteId: SHAREPOINT_CONFIG.siteId,
    listId: SHAREPOINT_CONFIG.lists.medioCoordinacion,
    campoDescripcion: "field_1",
    labelDescripcion: "Medio de Coordinación",
    camposExtra: [],
  },

  "carrera-personal": {
    titulo: "Carrera Personal",
    listaSharePoint: "UZ_CarreraPersonal",
    siteId: SHAREPOINT_CONFIG.siteId,
    listId: SHAREPOINT_CONFIG.lists.carreraPersonal,
    campoDescripcion: "field_1",
    labelDescripcion: "Carrera Personal",
    camposExtra: [],
  },

  "tipo-entidad": {
    titulo: "Tipo Entidad",
    listaSharePoint: "UZ_TipoEntidad",
    siteId: SHAREPOINT_CONFIG.siteId,
    listId: SHAREPOINT_CONFIG.lists.tipoEntidad,
    campoDescripcion: "field_1",
    labelDescripcion: "Tipo de Entidad",
    camposExtra: [
      {
        key: "field_2",
        label: "Entidad",
        type: "text" as const,
      },
    ],
  },

  "unidad-zonal": {
    titulo: "Unidades Zonales",
    listaSharePoint: "UZ_UnidadZonal",
    siteId: SHAREPOINT_CONFIG.siteId,
    listId: SHAREPOINT_CONFIG.lists.unidadZonal,
    campoDescripcion: "field_1",
    labelDescripcion: "Unidad Zonal",
    camposExtra: [],
  },

  "modalidad-contratacion": {
    titulo: "Modalidad Contratación",
    listaSharePoint: "UZ_ModalidadContratacion",
    siteId: SHAREPOINT_CONFIG.siteId,
    listId: SHAREPOINT_CONFIG.lists.modalidadContratacion,
    campoDescripcion: "DescripcionModalidad",
    labelDescripcion: "Modalidad de Contratación",
    camposExtra: [],
  },
};

export type CatalogoKey = keyof typeof catalogosConfig;
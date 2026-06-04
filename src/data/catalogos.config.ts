export const catalogosConfig = {
  "tipo-documento-identidad": {
    titulo: "Tipo de Documento de Identidad",
    listaSharePoint: "UZ_TipoDocumentoIdentidad",
    siteId: "proniedoti.sharepoint.com,24c388e8-793d-47b7-8687-18028d6663f7,9939e5bc-b700-4b5d-a796-67bd4da3a462",
    listId: "7037c5ef-28cc-419e-b662-941680912165",
    campoDescripcion: "field_1",
  },
  cargo: {
    titulo: "Cargo",
    listaSharePoint: "UZ_Cargo",
    siteId: "proniedoti.sharepoint.com,24c388e8-793d-47b7-8687-18028d6663f7,9939e5bc-b700-4b5d-a796-67bd4da3a462",
    listId: "ac602911-b042-40b7-913c-6a79c89e1a9c",
    campoDescripcion: "field_1",
  },
  "carrera-personal": {
    titulo: "Carrera de Personal",
    listaSharePoint: "UZ_CarreraPersonal",
    siteId: "proniedoti.sharepoint.com,24c388e8-793d-47b7-8687-18028d6663f7,9939e5bc-b700-4b5d-a796-67bd4da3a462",
    listId: "866399e0-7191-4b74-aee6-0869bdb97fd3",
    campoDescripcion: "field_1",
  },
  "medio-coordinacion": {
    titulo: "Medio de Coordinación",
    listaSharePoint: "UZ_MedioCoordinacion",
    siteId: "proniedoti.sharepoint.com,24c388e8-793d-47b7-8687-18028d6663f7,9939e5bc-b700-4b5d-a796-67bd4da3a462",
    listId: "4a7ff98c-6f32-4eea-a1a1-d18797762d3c",
    campoDescripcion: "field_1",
  },
  "tipo-entidad": {
    titulo: "Tipo de Entidad",
    listaSharePoint: "UZ_TipoEntidad",
    siteId: "proniedoti.sharepoint.com,24c388e8-793d-47b7-8687-18028d6663f7,9939e5bc-b700-4b5d-a796-67bd4da3a462",
    listId: "ea8f0b12-dcda-4645-b7ae-c9769bbce349",
    campoDescripcion: "field_2",
  },
} as const;

export type CatalogoKey = keyof typeof catalogosConfig;
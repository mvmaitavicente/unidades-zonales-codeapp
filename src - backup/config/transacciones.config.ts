import { SHAREPOINT_CONFIG } from "./sharepoint.config";
import type { TransaccionConfig } from "../types/transaccion.types";

export const transaccionesConfig: Record<string, TransaccionConfig> = {
  visitaAutoridades: {
    key: "visitaAutoridades",
    titulo: "Registro de Visitas",
    descripcion: "Registro de visitas de autoridades a locales educativos.",
    listaId: SHAREPOINT_CONFIG.lists.visitaAutoridades,
    titleField: "Asunto",
    codigoField: "CodigoVisita",
    fields: [
      {
        key: "Asunto",
        label: "Asunto",
        type: "text",
        required: true,
      },
      {
        key: "Detalle",
        label: "Detalle",
        type: "textarea",
        required: true,
      },
      {
        key: "Observacion",
        label: "Observación",
        type: "textarea",
      },
      {
        key: "MedioCoordinacion",
        label: "Medio de coordinación",
        type: "lookup",
        required: true,
        catalogoKey: "mediosCoordinacion",
      },
      {
        key: "FechaInicio",
        label: "Fecha inicio",
        type: "date",
        required: true,
      },
      {
        key: "FechaFin",
        label: "Fecha fin",
        type: "date",
      },
      {
        key: "TipoDocIdentidadRepresentante",
        label: "Tipo doc. representante",
        type: "lookup",
        required: true,
        catalogoKey: "tiposDocumento",
      },
      {
        key: "DocIdentidadRepresentante",
        label: "Documento representante",
        type: "text",
        required: true,
      },
      {
        key: "TipoDocIdentidadAutoridad",
        label: "Tipo doc. autoridad",
        type: "lookup",
        required: true,
        catalogoKey: "tiposDocumento",
      },
      {
        key: "DocIdentidadAutoridad",
        label: "Documento autoridad",
        type: "text",
        required: true,
      },
      {
        key: "CodigoLocal",
        label: "Código local",
        type: "text",
      },
      {
        key: "LinkInforme",
        label: "Link informe",
        type: "url",
      },
      {
        key: "NroExpedienteSGD",
        label: "Nro. expediente SGD",
        type: "text",
      },
    ],
  },
};
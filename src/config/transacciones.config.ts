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
      { key: "Asunto", label: "Asunto", type: "text", required: true },
      { key: "Detalle", label: "Detalle", type: "textarea", required: true },
      { key: "Observacion", label: "Observación", type: "textarea" },
      {
        key: "MedioCoordinacion",
        label: "Medio de coordinación",
        type: "lookup",
        required: true,
        catalogoKey: "mediosCoordinacion",
      },
      { key: "FechaInicio", label: "Fecha inicio", type: "date", required: true },
      { key: "FechaFin", label: "Fecha fin", type: "date" },

      { key: "CodigoLocal", label: "Código local", type: "text", required: true },
      { key: "NombreIE", label: "Nombre de la Institución Educativa", type: "text" },
      { key: "NombreUGEL", label: "UGEL", type: "text" },
      { key: "Region", label: "Región", type: "text" },
      { key: "Provincia", label: "Provincia", type: "text" },
      { key: "Distrito", label: "Distrito", type: "text" },
      { key: "DireccionIE", label: "Dirección", type: "text" },

      {
        key: "TipoDocIdentidadAutoridad",
        label: "Tipo doc. autoridad",
        type: "lookup",
        catalogoKey: "tiposDocumento",
      },
      {
        key: "DocIdentidadAutoridad",
        label: "Documento autoridad",
        type: "text",
        required: true,
      },
      { key: "NombresAutoridad", label: "Nombres autoridad", type: "text" },
      { key: "ApellidosAutoridad", label: "Apellidos autoridad", type: "text" },
      { key: "EntidadAutoridad", label: "Tipo entidad autoridad", type: "text" },
      { key: "CargoAutoridad", label: "Cargo autoridad", type: "text" },
      { key: "CorreoAutoridad", label: "Correo autoridad", type: "email" },

      {
        key: "TipoDocIdentidadRepresentante",
        label: "Tipo doc. representante",
        type: "lookup",
        catalogoKey: "tiposDocumento",
      },
      {
        key: "DocIdentidadRepresentante",
        label: "Documento representante",
        type: "text",
        required: true,
      },
      { key: "NombresRepresentante", label: "Nombres representante", type: "text" },
      { key: "ApellidosRepresentante", label: "Apellidos representante", type: "text" },
      { key: "UnidadZonalRepresentante", label: "Unidad Zonal representante", type: "text" },
      { key: "CargoRepresentante", label: "Cargo representante", type: "text" },
      { key: "CorreoRepresentante", label: "Correo representante", type: "email" },

      { key: "LinkInforme", label: "Link informe", type: "url" },
      { key: "NroExpedienteSGD", label: "Nro. expediente SGD", type: "text" },
    ],
  },
};

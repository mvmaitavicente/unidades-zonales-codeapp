export type ColumnType = "text" | "multilineText" | "number" | "boolean" | "dateTime" | "lookup";

export type ColumnSchema = {
  name: string;
  type: ColumnType;
  required?: boolean;
  indexed?: boolean;
  lookupList?: string;
  lookupColumn?: string;
};

export type ListSchema = {
  name: string;
  description: string;
  columns: ColumnSchema[];
};

export const listsSchema: ListSchema[] = [
  {
    name: "UzRoles",
    description: "Roles del sistema de unidades zonales.",
    columns: [
      { name: "NombreRol", type: "text", required: true, indexed: true },
      { name: "Descripcion", type: "multilineText" },
      { name: "NivelAcceso", type: "number", required: true },
      { name: "Activo", type: "boolean", required: true, indexed: true },
    ],
  },
  {
    name: "UzPermisos",
    description: "Permisos disponibles por modulo y accion.",
    columns: [
      { name: "NombrePermiso", type: "text", required: true, indexed: true },
      { name: "Modulo", type: "text", required: true, indexed: true },
      { name: "Accion", type: "text", required: true },
      { name: "CodigoPermiso", type: "text", required: true, indexed: true },
      { name: "Descripcion", type: "multilineText" },
      { name: "Activo", type: "boolean", required: true, indexed: true },
    ],
  },
  {
    name: "UzRolPermisos",
    description: "Relacion entre roles y permisos.",
    columns: [
      { name: "IdRol", type: "lookup", required: true, indexed: true, lookupList: "UzRoles", lookupColumn: "Title" },
      { name: "IdPermiso", type: "lookup", required: true, indexed: true, lookupList: "UzPermisos", lookupColumn: "Title" },
      { name: "Activo", type: "boolean", required: true, indexed: true },
    ],
  },
  {
    name: "UzUsuariosSistema",
    description: "Usuarios autorizados para ingresar al sistema.",
    columns: [
      { name: "Correo", type: "text", required: true, indexed: true },
      { name: "NombreCompleto", type: "text", required: true },
      { name: "IdRol", type: "lookup", required: true, indexed: true, lookupList: "UzRoles", lookupColumn: "Title" },
      { name: "IdUnidadZonal", type: "number" },
      { name: "Activo", type: "boolean", required: true, indexed: true },
    ],
  },
  {
    name: "UzAuditoriaSistema",
    description: "Auditoria de acciones relevantes del sistema.",
    columns: [
      { name: "Evento", type: "text", required: true, indexed: true },
      { name: "Modulo", type: "text", required: true, indexed: true },
      { name: "Accion", type: "text", required: true, indexed: true },
      { name: "ListaOrigen", type: "text", required: true },
      { name: "IdRegistro", type: "text" },
      { name: "CorreoUsuario", type: "text", required: true, indexed: true },
      { name: "NombreUsuario", type: "text", required: true },
      { name: "FechaAccion", type: "dateTime", required: true, indexed: true },
      { name: "Detalle", type: "multilineText" },
    ],
  },
  {
    name: "UzSesionUsuario",
    description: "Registro opcional de ultimo acceso por usuario.",
    columns: [
      { name: "Correo", type: "text", required: true, indexed: true },
      { name: "NombreCompleto", type: "text", required: true },
      { name: "Rol", type: "text", required: true },
      { name: "UltimoAcceso", type: "dateTime", required: true },
      { name: "SesionActiva", type: "boolean", required: true, indexed: true },
    ],
  },
];

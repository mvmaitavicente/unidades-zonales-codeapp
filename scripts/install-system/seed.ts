export const rolesSeed = [
  { NombreRol: "Administrador", Descripcion: "Acceso total al sistema", NivelAcceso: 1, Activo: true },
  { NombreRol: "Supervisor", Descripcion: "Consulta, edicion y supervision operativa", NivelAcceso: 2, Activo: true },
  { NombreRol: "Registrador", Descripcion: "Registro y edicion basica de visitas", NivelAcceso: 3, Activo: true },
  { NombreRol: "Consulta", Descripcion: "Solo lectura", NivelAcceso: 4, Activo: true },
  { NombreRol: "GestorCatalogos", Descripcion: "Administracion de catalogos y maestros", NivelAcceso: 2, Activo: true },
];

export const permisosSeed = [
  ["RegistroVisitas", "Ver", "VISITAS_VER"],
  ["RegistroVisitas", "Crear", "VISITAS_CREAR"],
  ["RegistroVisitas", "Editar", "VISITAS_EDITAR"],
  ["RegistroVisitas", "Desactivar", "VISITAS_DESACTIVAR"],
  ["RegistroVisitas", "ExportarExcel", "VISITAS_EXPORTAR"],
  ["BandejaVisitas", "Ver", "BANDEJA_VER"],
  ["BandejaVisitas", "ExportarExcel", "BANDEJA_EXPORTAR"],
  ["Catalogos", "Ver", "CATALOGOS_VER"],
  ["Catalogos", "Crear", "CATALOGOS_CREAR"],
  ["Catalogos", "Editar", "CATALOGOS_EDITAR"],
  ["Catalogos", "Desactivar", "CATALOGOS_DESACTIVAR"],
  ["Catalogos", "ExportarExcel", "CATALOGOS_EXPORTAR"],
  ["Maestros", "Ver", "MAESTROS_VER"],
  ["Maestros", "Crear", "MAESTROS_CREAR"],
  ["Maestros", "Editar", "MAESTROS_EDITAR"],
  ["Maestros", "Desactivar", "MAESTROS_DESACTIVAR"],
  ["Maestros", "ExportarExcel", "MAESTROS_EXPORTAR"],
  ["Administracion", "Usuarios", "USUARIOS_ADMIN"],
  ["Administracion", "Roles", "ROLES_ADMIN"],
  ["Administracion", "Permisos", "PERMISOS_ADMIN"],
].map(([Modulo, Accion, CodigoPermiso]) => ({
  NombrePermiso: CodigoPermiso,
  Modulo,
  Accion,
  CodigoPermiso,
  Descripcion: `Permite ${Accion} en ${Modulo}`,
  Activo: true,
}));

export const rolPermisosSeed: Record<string, string[]> = {
  Administrador: permisosSeed.map((p) => p.CodigoPermiso),
  Supervisor: [
    "VISITAS_VER", "VISITAS_CREAR", "VISITAS_EDITAR", "VISITAS_DESACTIVAR", "VISITAS_EXPORTAR",
    "BANDEJA_VER", "BANDEJA_EXPORTAR", "MAESTROS_VER", "CATALOGOS_VER",
  ],
  Registrador: ["VISITAS_VER", "VISITAS_CREAR", "VISITAS_EDITAR", "BANDEJA_VER"],
  Consulta: ["VISITAS_VER", "BANDEJA_VER"],
  GestorCatalogos: [
    "CATALOGOS_VER", "CATALOGOS_CREAR", "CATALOGOS_EDITAR", "CATALOGOS_DESACTIVAR", "CATALOGOS_EXPORTAR",
    "MAESTROS_VER", "MAESTROS_CREAR", "MAESTROS_EDITAR", "MAESTROS_DESACTIVAR", "MAESTROS_EXPORTAR",
  ],
};

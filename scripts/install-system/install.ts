import "dotenv/config";
import { ensureColumn, ensureItem, ensureList, getSiteId } from "./graphInstaller";
import { listsSchema } from "./schema";
import { permisosSeed, rolesSeed, rolPermisosSeed } from "./seed";

async function main() {
  console.log("Iniciando instalacion de estructura SharePoint...");

  const siteId = await getSiteId();
  console.log(`SiteId: ${siteId}`);

  const listIdsByName: Record<string, string> = {};

  console.log("\n1. Creando listas...");
  for (const list of listsSchema) {
    const created = await ensureList(siteId, list);
    listIdsByName[list.name] = created.id;
  }

  console.log("\n2. Creando columnas...");
  for (const list of listsSchema) {
    console.log(`Lista: ${list.name}`);
    const listId = listIdsByName[list.name];
    for (const column of list.columns) {
      await ensureColumn(siteId, listId, column, listIdsByName);
    }
  }

  console.log("\n3. Insertando roles...");
  const rolItemIdByName: Record<string, string> = {};
  for (const rol of rolesSeed) {
    const item = await ensureItem(siteId, listIdsByName.UzRoles, "NombreRol", rol.NombreRol, {
      Title: rol.NombreRol,
      ...rol,
    });
    rolItemIdByName[rol.NombreRol] = item.id;
  }

  console.log("\n4. Insertando permisos...");
  const permisoItemIdByCode: Record<string, string> = {};
  for (const permiso of permisosSeed) {
    const item = await ensureItem(siteId, listIdsByName.UzPermisos, "CodigoPermiso", permiso.CodigoPermiso, {
      Title: permiso.CodigoPermiso,
      ...permiso,
    });
    permisoItemIdByCode[permiso.CodigoPermiso] = item.id;
  }

  console.log("\n5. Insertando relacion rol-permisos...");
  for (const [rolNombre, permisos] of Object.entries(rolPermisosSeed)) {
    const rolId = rolItemIdByName[rolNombre];
    if (!rolId) throw new Error(`No existe rol en seed: ${rolNombre}`);

    for (const codigoPermiso of permisos) {
      const permisoId = permisoItemIdByCode[codigoPermiso];
      if (!permisoId) throw new Error(`No existe permiso en seed: ${codigoPermiso}`);

      const unique = `${rolNombre}-${codigoPermiso}`;
      await ensureItem(siteId, listIdsByName.UzRolPermisos, "Title", unique, {
        Title: unique,
        IdRolLookupId: rolId,
        IdPermisoLookupId: permisoId,
        Activo: true,
      });
    }
  }

  console.log("\nInstalacion completada correctamente.");
  console.log("Listas creadas o verificadas:");
  Object.keys(listIdsByName).forEach((name) => console.log(`- ${name}`));
}

main().catch((error) => {
  console.error("\nError en instalacion:");
  console.error(error);
  process.exit(1);
});

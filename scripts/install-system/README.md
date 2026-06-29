# Instalador SharePoint - Unidades Zonales

Este script crea la estructura base de seguridad del sistema en SharePoint usando Microsoft Graph.

## Listas que crea

- UzRoles
- UzPermisos
- UzRolPermisos
- UzUsuariosSistema
- UzAuditoriaSistema
- UzSesionUsuario

Todos los nombres de listas y columnas están en formato PascalCase, sin espacios ni tildes.

## Requisitos

1. Una App Registration en Microsoft Entra ID.
2. Flujo de cliente público habilitado para Device Code.
3. Permisos delegados de Microsoft Graph:
   - User.Read
   - Sites.ReadWrite.All
4. Admin consent concedido, si la organización lo exige.
5. Tu usuario debe tener permisos de propietario o diseño en el sitio de SharePoint.

## Dependencias

Instalar:

```bash
npm install -D tsx
npm install @azure/identity dotenv
```

## package.json

Agregar scripts:

```json
{
  "scripts": {
    "install-system": "tsx scripts/install-system/install.ts"
  }
}
```

## Configuracion

Copiar:

```bash
cp scripts/install-system/.env.example .env
```

Completar:

```env
TenantId=...
ClientId=...
SiteHostname=proniedoti.sharepoint.com
SitePath=/sites/OTI_PUBLICACION
```

## Ejecucion

```bash
npm run install-system
```

El script es idempotente a nivel básico: si una lista, columna o registro inicial ya existe, no lo duplica.

## Nota importante sobre Title

SharePoint crea por defecto la columna interna `Title`. Este script no la usa como campo funcional principal, pero la rellena con valores equivalentes para facilitar búsquedas y lookups.

Los campos reales de negocio son:

- NombreRol
- NombrePermiso
- CodigoPermiso
- Correo
- NombreCompleto
- Evento
- etc.

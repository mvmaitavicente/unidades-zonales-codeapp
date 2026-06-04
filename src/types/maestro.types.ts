import type { CatalogoGlobalKey } from "../config/catalogos-global.config";

export type MaestroFieldType =
  | "text"
  | "email"
  | "number"
  | "boolean"
  | "lookup";

export type MaestroFieldConfig = {
  key: string;
  label: string;
  type: MaestroFieldType;
  required?: boolean;
  visibleInTable?: boolean;
  maxLength?: number;

  catalogoKey?: CatalogoGlobalKey;
};

export type MaestroConfig = {
  key: string;
  titulo: string;
  descripcion: string;
  listaSharePoint: string;
  titleField?: string;
  fields: MaestroFieldConfig[];
};

export type MaestroItem = {
  itemId: string;
  id: number;
  values: Record<string, unknown>;
};

export type MaestroFormData = Record<string, unknown>;
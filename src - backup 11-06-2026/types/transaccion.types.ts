import type { CatalogoGlobalKey } from "../config/catalogos-global.config";

export type TransaccionFieldType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "date"
  | "url"
  | "lookup"
  | "file";

export type TransaccionFieldConfig = {
  key: string;
  label: string;
  type: TransaccionFieldType;
  required?: boolean;
  placeholder?: string;
  catalogoKey?: CatalogoGlobalKey;
  section?: string;
};

export type TransaccionConfig = {
  key: string;
  titulo: string;
  descripcion: string;
  listaId: string;
  titleField?: string;
  codigoField?: string;
  fields: TransaccionFieldConfig[];
};

export type TransaccionFormData = Record<string, unknown>;

export type TransaccionItem = {
  itemId: string;
  id: number;
  values: Record<string, unknown>;
};
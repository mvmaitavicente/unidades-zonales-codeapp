import type { CatalogoGlobalKey } from "../config/catalogos-global.config";

export type MaestroFieldType =
  | "text"
  | "email"
  | "number"
  | "boolean"
  | "lookup";

export type MaestroFieldValidation = {
  onlyNumbers?: boolean;
  decimal?: boolean;
  minLength?: number;
  maxLength?: number;
  emailDomain?: string;
  dynamicDocumentFrom?: string;
  startsWith?: string;
};

export type MaestroFieldConfig = {
  key: string;
  label: string;
  type: MaestroFieldType;
  required?: boolean;
  visibleInTable?: boolean;
  placeholder?: string;
  validation?:MaestroFieldValidation;

  catalogoKey?: CatalogoGlobalKey;
};

export type MaestroConfig = {
  key: string;
  titulo: string;
  descripcion: string;
  listaId: string;
  titleField?: string;
  fields: MaestroFieldConfig[];
};

export type MaestroItem = {
  itemId: string;
  id: number;
  values: Record<string, unknown>;
};

export type MaestroFormData = Record<string, unknown>;
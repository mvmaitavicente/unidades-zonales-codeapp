export type MaestroFieldType =
  | "text"
  | "email"
  | "number"
  | "boolean"
  | "lookup";

export type LookupOption = {
  value: number;
  label: string;
};

export type MaestroFieldConfig = {
  key: string;
  label: string;
  type: MaestroFieldType;
  required?: boolean;
  visibleInTable?: boolean;
  maxLength?: number;

  lookupList?: string;
  lookupTextField?: string;
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
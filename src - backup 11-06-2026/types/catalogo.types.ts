export type CatalogoCampoExtra = {
  key: string;
  label: string;
  type: "text" | "number";
};

export type CatalogoItem = {
  itemId: string;
  id: number;
  descripcion: string;
  activo: boolean;
  extra: Record<string, unknown>;
};

export type CatalogoFormData = {
  itemId?: string;
  descripcion: string;
  activo: boolean;
  extra?: Record<string, unknown>;
};
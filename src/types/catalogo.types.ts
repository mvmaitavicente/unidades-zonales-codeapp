export type CatalogoItem = {
  itemId: string;
  id: number;
  descripcion: string;
  activo: boolean;
};

export type CatalogoFormData = {
  itemId?: string;
  descripcion: string;
  activo: boolean;
};
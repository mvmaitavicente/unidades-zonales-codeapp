import { useCallback, useEffect, useState } from "react";
import type { CatalogoFormData, CatalogoItem } from "../types/catalogo.types";
import {
  actualizarCatalogo,
  cambiarEstadoCatalogo,
  crearCatalogo,
  listarCatalogo,
} from "../services/catalogo.service";

type UseCatalogosParams = {
  siteId: string;
  listId: string;
  campoDescripcion: string;
};

export function useCatalogos(params: UseCatalogosParams) {
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await listarCatalogo({
        siteId: params.siteId,
        listId: params.listId,
        campoDescripcion: params.campoDescripcion,
      });

      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido.");
    } finally {
      setLoading(false);
    }
  }, [params.siteId, params.listId, params.campoDescripcion]);

  const guardar = async (data: CatalogoFormData) => {
    if (data.itemId) {
      await actualizarCatalogo({
        siteId: params.siteId,
        listId: params.listId,
        campoDescripcion: params.campoDescripcion,
        data,
      });
    } else {
      await crearCatalogo({
        siteId: params.siteId,
        listId: params.listId,
        campoDescripcion: params.campoDescripcion,
        data,
      });
    }

    await cargar();
  };

  const cambiarEstado = async (itemId: string, activoActual: boolean) => {
    await cambiarEstadoCatalogo({
      siteId: params.siteId,
      listId: params.listId,
      itemId,
      activoActual,
    });

    await cargar();
  };

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    items,
    loading,
    error,
    cargar,
    guardar,
    cambiarEstado,
  };
}
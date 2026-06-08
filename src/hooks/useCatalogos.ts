
import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogoCampoExtra, CatalogoFormData, CatalogoItem } from "../types/catalogo.types";
import {
  actualizarCatalogo,
  cambiarEstadoCatalogo,
  crearCatalogo,
  listarCatalogo,
} from "../services/catalogo.service";


type Params = {
  siteId: string;
  listId: string;
  campoDescripcion: string;
  camposExtra?: CatalogoCampoExtra[];
};

export function useCatalogos(params: Params) {
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const yaCargoRef = useRef(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listarCatalogo(params);
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los registros.");
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
    if (yaCargoRef.current) return;

    yaCargoRef.current = true;
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
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CatalogoCampoExtra,
  CatalogoFormData,
  CatalogoItem,
} from "../types/catalogo.types";
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
  nombreTabla?: string;
};

export function useCatalogos(params: Params) {
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ultimaCargaKeyRef = useRef("");

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
  }, [
    params.siteId,
    params.listId,
    params.campoDescripcion,
    params.camposExtra,
    params.nombreTabla,
  ]);

  const guardar = async (data: CatalogoFormData) => {
    setSaving(true);
    setError("");

    try {
    if (data.itemId) {
      await actualizarCatalogo({
        siteId: params.siteId,
        listId: params.listId,
        campoDescripcion: params.campoDescripcion,
        data,
        nombreTabla: params.nombreTabla,
      });
    } else {
      await crearCatalogo({
        siteId: params.siteId,
        listId: params.listId,
        campoDescripcion: params.campoDescripcion,
        data,
        nombreTabla: params.nombreTabla,
      });
    }

    await cargar();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el registro.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (itemId: string, activoActual: boolean) => {
    setSaving(true);
    setError("");

    try {
    await cambiarEstadoCatalogo({
      siteId: params.siteId,
      listId: params.listId,
      itemId,
      activoActual,
      nombreTabla: params.nombreTabla,
    });

    await cargar();
    } catch (err) {
      console.error(err);
      setError("No se pudo cambiar el estado del registro.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const key = `${params.siteId}_${params.listId}_${params.campoDescripcion}`;

    if (ultimaCargaKeyRef.current === key) return;

    ultimaCargaKeyRef.current = key;
    cargar();
  }, [cargar, params.siteId, params.listId, params.campoDescripcion]);

  return {
    items,
    loading,
    saving,
    error,
    cargar,
    guardar,
    cambiarEstado,
  };
}
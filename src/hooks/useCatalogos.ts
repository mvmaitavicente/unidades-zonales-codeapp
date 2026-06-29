import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
      const descripcion = String(data.descripcion ?? "").trim();

      if (data.itemId) {
        await actualizarCatalogo({
          siteId: params.siteId,
          listId: params.listId,
          campoDescripcion: params.campoDescripcion,
          data,
          nombreTabla: params.nombreTabla,
        });

        toast.success("Registro actualizado correctamente.", {
          description: descripcion
            ? `${descripcion} fue actualizado.`
            : `${params.nombreTabla ?? "Catálogo"}: registro actualizado.`,
          duration: Infinity,
        });
      } else {
        await crearCatalogo({
          siteId: params.siteId,
          listId: params.listId,
          campoDescripcion: params.campoDescripcion,
          data,
          nombreTabla: params.nombreTabla,
        });

        toast.success("Registro creado correctamente.", {
          description: descripcion
            ? `${descripcion} fue agregado a ${params.nombreTabla ?? "catálogo"}.`
            : `${params.nombreTabla ?? "Catálogo"}: nuevo registro guardado.`,
          duration: Infinity,
        });
      }

      await cargar();
    } catch (err) {
      console.error(err);
      const mensaje = "No se pudo guardar el registro.";
      setError(mensaje);
      toast.error(mensaje, { duration: Infinity });
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

      toast.success(
        activoActual ? "Registro eliminado correctamente." : "Registro restaurado correctamente.",
        {
          description: activoActual
            ? `${params.nombreTabla ?? "Catálogo"}: el registro fue inactivado.`
            : `${params.nombreTabla ?? "Catálogo"}: el registro volvió a estar activo.`,
          duration: Infinity,
        }
      );

      await cargar();
    } catch (err) {
      console.error(err);
      const mensaje = "No se pudo cambiar el estado del registro.";
      setError(mensaje);
      toast.error(mensaje, { duration: Infinity });
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
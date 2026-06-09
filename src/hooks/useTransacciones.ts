import { useCallback, useEffect, useState } from "react";
import type {
  TransaccionConfig,
  TransaccionFormData,
  TransaccionItem,
} from "../types/transaccion.types";
import {
  actualizarTransaccion,
  crearTransaccion,
  eliminarTransaccion,
  listarTransacciones,
} from "../services/transaccion.service";

export function useTransacciones(config: TransaccionConfig) {
  const [items, setItems] = useState<TransaccionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listarTransacciones(config);
      setItems(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los registros."
      );
    } finally {
      setLoading(false);
    }
  }, [config]);

  const guardar = async (
    data: TransaccionFormData,
    itemId?: string
  ): Promise<string> => {
    setSaving(true);
    setError("");

    try {
      if (itemId) {
        await actualizarTransaccion({ config, itemId, data });
        await cargar();
        return "";
      }

      const codigo = await crearTransaccion(config, data);
      await cargar();
      return codigo;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el registro."
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (itemId: string) => {
    setSaving(true);
    setError("");

    try {
      await eliminarTransaccion({ config, itemId });
      await cargar();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el registro."
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    items,
    loading,
    saving,
    error,
    cargar,
    guardar,
    eliminar,
  };
}
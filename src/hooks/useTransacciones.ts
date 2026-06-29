import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
    itemId?: string,
    options?: { recargar?: boolean }
  ): Promise<string> => {
    setSaving(true);
    setError("");

    try {
      let codigo = "";

      if (itemId) {
        await actualizarTransaccion({ config, itemId, data });

        toast.success("Registro actualizado correctamente.", {
          description: `${config.titulo}: cambios guardados.`,
          duration: Infinity,
        });
      } else {
        codigo = await crearTransaccion(config, data);

        toast.success("Registro creado correctamente.", {
          description: codigo
            ? `${config.titulo}: código generado ${codigo}.`
            : `${config.titulo}: nuevo registro guardado.`,
          duration: Infinity,
        });
      }

      if (options?.recargar !== false) {
        await cargar();
      }

      return codigo;
    } catch (err) {
      console.error(err);
      const mensaje = err instanceof Error ? err.message : "No se pudo guardar el registro.";
      setError(mensaje);
      toast.error(mensaje, { duration: Infinity });
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

      toast.success("Registro eliminado correctamente.", {
        description: `${config.titulo}: registro eliminado.`,
        duration: Infinity,
      });

      await cargar();
    } catch (err) {
      console.error(err);
      const mensaje = err instanceof Error ? err.message : "No se pudo eliminar el registro.";
      setError(mensaje);
      toast.error(mensaje, { duration: Infinity });
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
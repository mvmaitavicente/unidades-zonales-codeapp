import { useCallback, useEffect, useState } from "react";
import type {
  MaestroConfig,
  MaestroFormData,
  MaestroItem,
} from "../types/maestro.types";
import {
  actualizarMaestro,
  cambiarEstadoMaestro,
  crearMaestro,
  listarMaestro,
} from "../services/maestro.service";

export function useMaestro(config: MaestroConfig) {
  const [items, setItems] = useState<MaestroItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);

    try {
      const maestroItems = await listarMaestro(config);
      setItems(maestroItems);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const guardar = async (data: MaestroFormData, itemId?: string) => {
    setSaving(true);

    try {
      if (itemId) {
        await actualizarMaestro({
          config,
          itemId,
          data,
        });
      } else {
        await crearMaestro(config, data);
      }

      await cargar();
    } finally {
      setSaving(false);
    }
  };

  const cambiarEstado = async (item: MaestroItem) => {
    const activoActual = Boolean(item.values.Activo);

    await cambiarEstadoMaestro({
      config,
      itemId: item.itemId,
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
    saving,
    cargar,
    guardar,
    cambiarEstado,
  };
}
import { useCallback, useEffect, useState } from "react";
import type {
  LookupOption,
  MaestroConfig,
  MaestroFormData,
  MaestroItem,
} from "../types/maestro.types";
import {
  actualizarMaestro,
  cambiarEstadoMaestro,
  cargarLookupsMaestro,
  crearMaestro,
  listarMaestro,
} from "../services/maestro.service";

export function useMaestro(config: MaestroConfig) {
  const [items, setItems] = useState<MaestroItem[]>([]);
  const [lookups, setLookups] = useState<Record<string, LookupOption[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);

    try {
      const [maestroItems, maestroLookups] = await Promise.all([
        listarMaestro(config),
        cargarLookupsMaestro(config),
      ]);

      setItems(maestroItems);
      setLookups(maestroLookups);
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
    lookups,
    loading,
    saving,
    cargar,
    guardar,
    cambiarEstado,
  };
}
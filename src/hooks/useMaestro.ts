import { useCallback, useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 20;

type EstadoFiltro = "todos" | "activos" | "inactivos";

export function useMaestro(config: MaestroConfig) {
  const [items, setItems] = useState<MaestroItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");
  const [paginaActual, setPaginaActual] = useState(1);

  const cargar = useCallback(async () => {
    setLoading(true);

    try {
      const maestroItems = await listarMaestro(config);
      setItems(maestroItems);
      setPaginaActual(1);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const itemsFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return items.filter((item) => {
      const activo = Boolean(item.values.Activo);

      if (estadoFiltro === "activos" && !activo) return false;
      if (estadoFiltro === "inactivos" && activo) return false;

      if (!texto) return true;

      return Object.values(item.values).some((value) =>
        String(value ?? "").toLowerCase().includes(texto)
      );
    });
  }, [items, busqueda, estadoFiltro]);

  const totalRegistros = itemsFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE));

  const itemsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * PAGE_SIZE;
    const fin = inicio + PAGE_SIZE;

    return itemsFiltrados.slice(inicio, fin);
  }, [itemsFiltrados, paginaActual]);

  const cambiarBusqueda = (value: string) => {
    setBusqueda(value);
    setPaginaActual(1);
  };

  const cambiarEstadoFiltro = (value: EstadoFiltro) => {
    setEstadoFiltro(value);
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("todos");
    setPaginaActual(1);
  };

  const irPaginaAnterior = () => {
    setPaginaActual((prev) => Math.max(1, prev - 1));
  };

  const irPaginaSiguiente = () => {
    setPaginaActual((prev) => Math.min(totalPaginas, prev + 1));
  };

  const irAPagina = (pagina: number) => {
    setPaginaActual(Math.min(Math.max(1, pagina), totalPaginas));
  };

  const guardar = async (data: MaestroFormData, itemId?: string) => {
    setSaving(true);

    try {
      if (itemId) {
        await actualizarMaestro({ config, itemId, data });
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
    itemsFiltrados,
    itemsPaginados,
    loading,
    saving,

    busqueda,
    estadoFiltro,
    cambiarBusqueda,
    cambiarEstadoFiltro,
    limpiarFiltros,

    paginaActual,
    totalPaginas,
    totalRegistros,
    pageSize: PAGE_SIZE,
    irPaginaAnterior,
    irPaginaSiguiente,
    irAPagina,

    cargar,
    guardar,
    cambiarEstado,
  };
}
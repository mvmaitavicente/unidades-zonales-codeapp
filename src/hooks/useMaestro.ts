import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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

type EstadoFiltro = "todos" | "activos" | "inactivos";

export function useMaestro(config: MaestroConfig) {
  const [items, setItems] = useState<MaestroItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const maestroItems = await listarMaestro(config);
      setItems(maestroItems);
      setPaginaActual(1);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudieron cargar los registros.");
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
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / pageSize));

  const itemsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * pageSize;
    const fin = inicio + pageSize;

    return itemsFiltrados.slice(inicio, fin);
  }, [itemsFiltrados, paginaActual, pageSize]);

  const cambiarBusqueda = (value: string) => {
    setBusqueda(value);
    setPaginaActual(1);
  };

  const cambiarEstadoFiltro = (value: EstadoFiltro) => {
    setEstadoFiltro(value);
    setPaginaActual(1);
  };

  const cambiarPageSize = (size: number) => {
    setPageSize(size);
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
    setError("");

    try {
      const nombreRegistro = [data.Nombres, data.Apellidos]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
        .join(" ");

      if (itemId) {
        await actualizarMaestro({ config, itemId, data });

        toast.success("Registro actualizado correctamente.", {
          description: nombreRegistro
            ? `${nombreRegistro} fue actualizado.`
            : `${config.titulo}: registro actualizado.`,
          duration: Infinity,
        });
      } else {
        await crearMaestro(config, data);

        toast.success("Registro creado correctamente.", {
          description: nombreRegistro
            ? `${nombreRegistro} fue agregado a ${config.titulo.toLowerCase()}.`
            : `${config.titulo}: nuevo registro guardado.`,
          duration: Infinity,
        });
      }

      await cargar();
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

  const cambiarEstado = async (item: MaestroItem) => {
    const activoActual = Boolean(item.values.Activo);
    setSaving(true);
    setError("");

    try {
      await cambiarEstadoMaestro({
        config,
        itemId: item.itemId,
        activoActual,
      });

      const nombreRegistro = [item.values.Nombres, item.values.Apellidos]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
        .join(" ");

      toast.success(
        activoActual ? "Registro eliminado correctamente." : "Registro restaurado correctamente.",
        {
          description: nombreRegistro
            ? `${nombreRegistro} ${activoActual ? "fue inactivado" : "volvió a estar activo"}.`
            : `${config.titulo}: estado actualizado.`,
          duration: Infinity,
        }
      );

      await cargar();
    } catch (err) {
      console.error(err);
      const mensaje = err instanceof Error ? err.message : "No se pudo cambiar el estado.";
      setError(mensaje);
      toast.error(mensaje, { duration: Infinity });
      throw err;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setBusqueda("");
    setEstadoFiltro("todos");
    setPaginaActual(1);
    setPageSize(20);
    setError("");
  }, [config.key]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return {
    items,
    itemsFiltrados,
    itemsPaginados,
    loading,
    saving,
    error,

    busqueda,
    estadoFiltro,
    cambiarBusqueda,
    cambiarEstadoFiltro,
    limpiarFiltros,

    paginaActual,
    totalPaginas,
    totalRegistros,
    pageSize,
    cambiarPageSize,
    irPaginaAnterior,
    irPaginaSiguiente,
    irAPagina,

    cargar,
    guardar,
    cambiarEstado,
  };
}
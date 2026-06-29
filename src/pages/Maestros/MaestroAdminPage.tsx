import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus, RefreshCcw, Search, X } from "lucide-react";
import { useParams } from "react-router-dom";

import { maestrosConfig } from "../../config/maestros.config";
import { useCatalogosGlobal } from "../../hooks/useCatalogosGlobal";
import { useMaestro } from "../../hooks/useMaestro";

import MaestroForm from "../../components/Maestros/MaestroForm";
import MaestroModal from "../../components/Maestros/MaestroModal";
import MaestroTable from "../../components/Maestros/MaestroTable";
import MaestroDetail from "../../components/Maestros/MaestroDetail";

import type { MaestroConfig, MaestroItem } from "../../types/maestro.types";

export default function MaestroAdminPage() {
  const { maestroKey } = useParams();

  const config = useMemo(() => {
    if (!maestroKey) return null;
    return maestrosConfig[maestroKey] ?? null;
  }, [maestroKey]);

  if (!config) {
    return (
      <div className="page-content">
        <h1>Maestro no encontrado</h1>
        <p>La configuración solicitada no existe.</p>
      </div>
    );
  }

  return <MaestroAdminContent key={config.key} config={config} />;
}

function MaestroAdminContent({ config }: { config: MaestroConfig }) {
  const { catalogos, loading: loadingCatalogos, recargarCatalogos } = useCatalogosGlobal();

  useEffect(() => {
    recargarCatalogos();
  }, [recargarCatalogos, config.key]);

  const {
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
  } = useMaestro(config);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [itemEditando, setItemEditando] = useState<MaestroItem | null>(null);
  const [itemDetalle, setItemDetalle] = useState<MaestroItem | null>(null);

  const nuevoRegistro = () => {
    setItemEditando(null);
    setMostrarFormulario(true);
  };

  const editarRegistro = (item: MaestroItem) => {
    setItemEditando(item);
    setMostrarFormulario(true);
  };

  const verDetalle = (item: MaestroItem) => {
    setItemDetalle(item);
  };

  const cerrarModal = () => {
    setItemEditando(null);
    setMostrarFormulario(false);
  };

  const guardarRegistro = async (
    data: Record<string, unknown>,
    itemId?: string
  ) => {
    try {
      await guardar(data, itemId);
      cerrarModal();
    } catch {
      // El hook ya muestra el error.
    }
  };

  const desde =
    totalRegistros === 0
      ? 0
      : Math.min((paginaActual - 1) * pageSize + 1, totalRegistros);

  const hasta = Math.min(paginaActual * pageSize, totalRegistros);

  return (
    <div className="page-content">
      <div className="maestro-panel">
        <div className="maestro-header">
          <div>
            <h1>{config.titulo}</h1>
            <p>{config.descripcion}</p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={nuevoRegistro}
            disabled={saving}
          >
            <Plus size={18} />
            Nuevo registro
          </button>
        </div>

        <div className="maestro-toolbar">
          <div className="maestro-search">
            <Search size={18} />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => cambiarBusqueda(e.target.value)}
              placeholder="Buscar por documento, nombres, apellidos, correo..."
            />
          </div>

          <div className="maestro-filter">
            <label>Estado:</label>
            <select
              value={estadoFiltro}
              onChange={(e) =>
                cambiarEstadoFiltro(
                  e.target.value as "todos" | "activos" | "inactivos"
                )
              }
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={limpiarFiltros}
            disabled={saving}
          >
            <X size={17} />
            Limpiar filtros
          </button>

          <button className="secondary-button" type="button" onClick={cargar} disabled={loading || saving}>
            <RefreshCcw size={17} />
            Actualizar
          </button>
        </div>

        {error && <div className="catalogo-error">{error}</div>}

        <div className="maestro-table-section">
          {loading ? (
            <p>Cargando registros...</p>
          ) : (
            <>
              <div className="page-size-selector">
                <span>Mostrar</span>

                <select
                  value={pageSize}
                  onChange={(e) => cambiarPageSize(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>

                <span>registros</span>
              </div>

              <MaestroTable
                config={config}
                items={itemsPaginados}
                onViewDetail={verDetalle}
                onEdit={editarRegistro}
                onToggleEstado={cambiarEstado}
                disabled={saving}
              />

              <div className="pagination-bar">
                <span>
                  Mostrando {desde} - {hasta} de {totalRegistros} registros
                </span>

                <div className="pagination-actions">
                  <button
                    type="button"
                    onClick={irPaginaAnterior}
                    disabled={paginaActual === 1}
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPaginas }, (_, index) => {
                    const pagina = index + 1;

                    return (
                      <button
                        key={pagina}
                        type="button"
                        className={paginaActual === pagina ? "active" : ""}
                        onClick={() => irAPagina(pagina)}
                      >
                        {pagina}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={irPaginaSiguiente}
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {mostrarFormulario && (
        <MaestroModal
          title={itemEditando ? "Editar registro" : "Nuevo registro"}
          subtitle={
            itemEditando
              ? `Actualiza la información de ${config.titulo.toLowerCase()}.`
              : `Completa los datos de ${config.titulo.toLowerCase()}.`
          }
          onClose={saving ? () => undefined : cerrarModal}
        >
          {loadingCatalogos ? (
            <p>Cargando opciones...</p>
          ) : (
            <MaestroForm
              config={config}
              itemEditando={itemEditando}
              catalogos={catalogos}
              saving={saving}
              onGuardar={guardarRegistro}
              onCancelar={saving ? () => undefined : cerrarModal}
            />
          )}
        </MaestroModal>
      )}

      {itemDetalle && (
        <MaestroModal
          title="Detalle del registro"
          subtitle="Vista resumida y ordenada del maestro seleccionado."
          onClose={() => setItemDetalle(null)}
        >
          <MaestroDetail config={config} item={itemDetalle} />
        </MaestroModal>
      )}

      {saving && (
        <div className="blocking-loader">
          <div className="blocking-loader-card">
            <LoaderCircle className="spin-icon" size={22} />
            Procesando cambios del maestro...
          </div>
        </div>
      )}
    </div>
  );
}
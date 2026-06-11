import { Eye, LoaderCircle, Pencil, RefreshCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransaccionForm from "../components/transacciones/TransaccionForm";
import { transaccionesConfig } from "../config/transacciones.config";
import { useCatalogosGlobal } from "../hooks/useCatalogosGlobal";
import { useTransacciones } from "../hooks/useTransacciones";
import MaestroModal from "../components/Maestros/MaestroModal";
import type { TransaccionItem } from "../types/transaccion.types";

const PAGE_SIZE_DEFAULT = 10;

export default function BandejaVisitasPage() {
  const navigate = useNavigate();
  const { catalogos, recargarCatalogos } = useCatalogosGlobal();
  const config = transaccionesConfig.visitaAutoridades;

  useEffect(() => {
    recargarCatalogos();
  }, [recargarCatalogos]);

  const { items, loading, saving, error, cargar, guardar, eliminar } =
    useTransacciones(config);

  const [itemEditando, setItemEditando] = useState<TransaccionItem | null>(null);
  const [itemDetalle, setItemDetalle] = useState<TransaccionItem | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);

  const itemsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) => {
      const texto = [
        item.values.CodigoVisita,
        item.values.Asunto,
        item.values.FechaInicio,
        item.values.MedioCoordinacion,
        item.values.DocIdentidadAutoridad,
        item.values.CodigoLocal,
        item.values.NroExpedienteSGD,
      ]
        .join(" ")
        .toLowerCase();

      return texto.includes(q);
    });
  }, [items, busqueda]);

  const totalRegistros = itemsFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / pageSize));

  const itemsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * pageSize;
    return itemsFiltrados.slice(inicio, inicio + pageSize);
  }, [itemsFiltrados, paginaActual, pageSize]);

  const desde =
    totalRegistros === 0
      ? 0
      : Math.min((paginaActual - 1) * pageSize + 1, totalRegistros);

  const hasta = Math.min(paginaActual * pageSize, totalRegistros);

  const limpiarFiltros = () => {
    setBusqueda("");
    setPaginaActual(1);
  };

  const cambiarPageSize = (size: number) => {
    setPageSize(size);
    setPaginaActual(1);
  };

  const confirmarEliminar = async (itemId: string) => {
    const confirmar = window.confirm("¿Deseas eliminar este registro?");
    if (!confirmar) return;

    await eliminar(itemId);
  };

  const formatearFecha = (value: unknown) => {
    if (!value) return "-";

    const fecha = new Date(String(value));

    if (Number.isNaN(fecha.getTime())) return String(value);

    return fecha.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const detalle = itemDetalle?.values;

  return (
    <section className="page-content">
      <div className="maestro-panel">
        <div className="maestro-header">
          <div>
            <h1>Bandeja de Visitas</h1>
            <p>Consulta y administra las visitas registradas.</p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/registro-visitas")}
            disabled={saving}
          >
            + Nueva visita
          </button>
        </div>

        <div className="maestro-toolbar">
          <div className="maestro-search">
            <Search size={18} />
            <input
              value={busqueda}
              placeholder="Buscar por código, asunto, autoridad o local..."
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>

          <button type="button" className="secondary-button" onClick={limpiarFiltros} disabled={saving}>
            <X size={17} />
            Limpiar filtros
          </button>

          <button type="button" className="secondary-button" onClick={cargar} disabled={loading || saving}>
            <RefreshCcw size={17} />
            Actualizar
          </button>
        </div>

        {error && <div className="catalogo-error">{error}</div>}

        {itemEditando && (
          <div className="maestro-form-card">
            <h2>Editar visita</h2>
            <p>Actualiza la información del registro seleccionado.</p>

            <TransaccionForm
              config={config}
              itemEditando={itemEditando}
              catalogos={catalogos}
              saving={saving}
              onGuardar={async (data, itemId) => {
                await guardar(data, itemId, { recargar: true });
                setItemEditando(null);
              }}
              onCancelar={saving ? () => undefined : () => setItemEditando(null)}
            />
          </div>
        )}

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

              <div className="catalogo-table-card">
                <table className="catalogo-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Asunto</th>
                      <th>Fecha inicio</th>
                      <th>Medio</th>
                      <th>Doc. autoridad</th>
                      <th>Código local</th>
                      <th>Estado</th>
                      <th className="actions-column">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {itemsPaginados.map((item) => (
                      <tr key={item.itemId}>
                        <td>
                          <strong>{String(item.values.CodigoVisita ?? "-")}</strong>
                        </td>
                        <td>{String(item.values.Asunto ?? "-")}</td>
                        <td>{formatearFecha(item.values.FechaInicio)}</td>
                        <td>{String(item.values.MedioCoordinacion ?? "-")}</td>
                        <td>{String(item.values.DocIdentidadAutoridad ?? "-")}</td>
                        <td>{String(item.values.CodigoLocal ?? "-")}</td>
                        <td>
                          <span className="status active">Registrado</span>
                        </td>
                        <td className="actions-column">
                          <div className="table-actions">
                            <button
                              className="icon-action"
                              type="button"
                              title="Ver detalle"
                              disabled={saving}
                              onClick={() => setItemDetalle(item)}
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              className="icon-action"
                              type="button"
                              title="Editar"
                              disabled={saving}
                              onClick={() => setItemEditando(item)}
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="icon-action"
                              type="button"
                              title="Eliminar"
                              disabled={saving}
                              onClick={() => confirmarEliminar(item.itemId)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {itemsPaginados.length === 0 && (
                      <tr>
                        <td colSpan={8}>No hay registros para mostrar.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-bar">
                <span>
                  Mostrando {desde} - {hasta} de {totalRegistros} registros
                </span>

                <div className="pagination-actions">
                  <button
                    type="button"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
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
                        onClick={() => setPaginaActual(pagina)}
                      >
                        {pagina}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() =>
                      setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))
                    }
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {itemDetalle && detalle && (
        <MaestroModal
          title="Detalle de la visita"
          subtitle={String(detalle.CodigoVisita ?? "Información del registro")}
          onClose={() => setItemDetalle(null)}
        >
          <div className="visit-detail">
            <section className="visit-detail-section visit-detail-main">
              <div className="visit-detail-section-title">
                <span>Información de la visita</span>
              </div>
              <div className="detail-grid">
                <div className="detail-item featured">
                  <span>Código visita</span>
                  <strong>{String(detalle.CodigoVisita ?? "-")}</strong>
                </div>
                <div className="detail-item featured">
                  <span>Asunto</span>
                  <strong>{String(detalle.Asunto ?? "-")}</strong>
                </div>
                <div className="detail-item detail-wide">
                  <span>Detalle</span>
                  <strong>{String(detalle.Detalle ?? "-")}</strong>
                </div>
                <div className="detail-item detail-wide">
                  <span>Observación</span>
                  <strong>{String(detalle.Observacion ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Fecha inicio</span>
                  <strong>{formatearFecha(detalle.FechaInicio)}</strong>
                </div>
                <div className="detail-item">
                  <span>Fecha fin</span>
                  <strong>{formatearFecha(detalle.FechaFin)}</strong>
                </div>
                <div className="detail-item">
                  <span>Medio coordinación</span>
                  <strong>{String(detalle.MedioCoordinacion ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Nro. expediente SGD</span>
                  <strong>{String(detalle.NroExpedienteSGD ?? "-")}</strong>
                </div>
                <div className="detail-item detail-wide">
                  <span>Link informe</span>
                  <strong>{String(detalle.LinkInforme ?? "-")}</strong>
                </div>
              </div>
            </section>

            <section className="visit-detail-section">
              <div className="visit-detail-section-title">
                <span>Información del colegio</span>
              </div>
              <div className="detail-grid detail-grid-school">
                <div className="detail-item">
                  <span>Código local</span>
                  <strong>{String(detalle.CodigoLocal ?? "-")}</strong>
                </div>
                <div className="detail-item detail-wide">
                  <span>Nombre Institución Educativa</span>
                  <strong>{String(detalle.NombreIE ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>UGEL</span>
                  <strong>{String(detalle.NombreUGEL ?? detalle.NombreUgel ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Región</span>
                  <strong>{String(detalle.Region ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Provincia</span>
                  <strong>{String(detalle.Provincia ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Distrito</span>
                  <strong>{String(detalle.Distrito ?? "-")}</strong>
                </div>
                <div className="detail-item detail-wide">
                  <span>Dirección Institución Educativa</span>
                  <strong>{String(detalle.Direccion ?? detalle.DireccionIE ?? "-")}</strong>
                </div>
              </div>
            </section>

            <section className="visit-detail-section">
              <div className="visit-detail-section-title">
                <span>Autoridad visitante</span>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Tipo doc. autoridad</span>
                  <strong>{String(detalle.TipoDocIdentidadAutoridad ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Documento autoridad</span>
                  <strong>{String(detalle.DocIdentidadAutoridad ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Nombres</span>
                  <strong>{String(detalle.NombresAutoridad ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Apellidos</span>
                  <strong>{String(detalle.ApellidosAutoridad ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Tipo entidad</span>
                  <strong>{String(detalle.EntidadAutoridad ?? detalle.TipoEntidadAutoridad ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Cargo</span>
                  <strong>{String(detalle.CargoAutoridad ?? "-")}</strong>
                </div>
                <div className="detail-item detail-wide">
                  <span>Correo</span>
                  <strong>{String(detalle.CorreoAutoridad ?? "-")}</strong>
                </div>
              </div>
            </section>

            <section className="visit-detail-section">
              <div className="visit-detail-section-title">
                <span>Representante PRONIED</span>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span>Tipo doc. representante</span>
                  <strong>{String(detalle.TipoDocIdentidadRepresentante ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Documento representante</span>
                  <strong>{String(detalle.DocIdentidadRepresentante ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Nombres</span>
                  <strong>{String(detalle.NombresRepresentante ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Apellidos</span>
                  <strong>{String(detalle.ApellidosRepresentante ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Unidad Zonal</span>
                  <strong>{String(detalle.UnidadZonalRepresentante ?? "-")}</strong>
                </div>
                <div className="detail-item">
                  <span>Cargo</span>
                  <strong>{String(detalle.CargoRepresentante ?? "-")}</strong>
                </div>
                <div className="detail-item detail-wide">
                  <span>Correo</span>
                  <strong>{String(detalle.CorreoRepresentante ?? "-")}</strong>
                </div>
              </div>
            </section>
          </div>
        </MaestroModal>
      )}

      {saving && (
        <div className="blocking-loader">
          <div className="blocking-loader-card">
            <LoaderCircle className="spin-icon" size={22} />
            Procesando cambios de la visita...
          </div>
        </div>
      )}
    </section>
  );
}
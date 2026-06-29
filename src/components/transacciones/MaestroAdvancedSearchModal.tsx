import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search, X } from "lucide-react";
import { toast } from "sonner";

import { maestrosConfig } from "../../config/maestros.config";
import type { LookupOption } from "../../contexts/CatalogosGlobalContext";
import { listarMaestro } from "../../services/maestro.service";
import type { MaestroItem } from "../../types/maestro.types";

type TipoBusquedaMaestro = "autoridades" | "personal";

type Props = {
  tipo: TipoBusquedaMaestro;
  catalogos: Record<string, LookupOption[]>;
  onClose: () => void;
  onSelect: (item: MaestroItem) => void;
};

const PAGE_SIZE = 10;

function normalizarTexto(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getValue(item: MaestroItem, key: string) {
  return String(item.values[key] ?? "");
}

function coincideLookup(item: MaestroItem, key: string, filtro: string) {
  if (!filtro) return true;

  const lookupId = String(item.values[`${key}Id`] ?? "");
  const value = String(item.values[key] ?? "");

  return lookupId === filtro || value === filtro;
}

export default function MaestroAdvancedSearchModal({
  tipo,
  catalogos,
  onClose,
  onSelect,
}: Props) {
  const config = maestrosConfig[tipo];
  const esAutoridad = tipo === "autoridades";

  const [items, setItems] = useState<MaestroItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [texto, setTexto] = useState("");
  const [pagina, setPagina] = useState(1);

  const [tipoEntidad, setTipoEntidad] = useState("");
  const [cargoAutoridad, setCargoAutoridad] = useState("");

  const [unidadZonal, setUnidadZonal] = useState("");
  const [cargoPersonal, setCargoPersonal] = useState("");
  const [modalidad, setModalidad] = useState("");

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);

      try {
        const data = await listarMaestro(config);

        if (activo) {
          setItems(data.filter((item) => Boolean(item.values.Activo)));
        }
      } catch (err) {
        console.error(err);
        toast.error(
          esAutoridad
            ? "No se pudieron cargar las autoridades."
            : "No se pudo cargar el personal PRONIED.",
          { duration: Infinity }
        );
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [config, esAutoridad]);

  useEffect(() => {
    setPagina(1);
  }, [texto, tipoEntidad, cargoAutoridad, unidadZonal, cargoPersonal, modalidad]);

  const itemsFiltrados = useMemo(() => {
    const query = normalizarTexto(texto);

    return items.filter((item) => {
      if (esAutoridad) {
        if (!coincideLookup(item, "TipoEntidad", tipoEntidad)) return false;
        if (!coincideLookup(item, "Cargo", cargoAutoridad)) return false;
      } else {
        if (!coincideLookup(item, "IdUnidadZonal", unidadZonal)) return false;
        if (!coincideLookup(item, "IdCargo", cargoPersonal)) return false;
        if (!coincideLookup(item, "IdModalidadContratacion", modalidad)) return false;
      }

      if (!query) return true;

      const nombresCompletos = `${getValue(item, "Nombres")} ${getValue(
        item,
        "Apellidos"
      )}`;
      const correo = esAutoridad
        ? getValue(item, "Correo")
        : getValue(item, "CorreoInstitucional");

      return (
        normalizarTexto(nombresCompletos).includes(query) ||
        normalizarTexto(correo).includes(query)
      );
    });
  }, [
    items,
    texto,
    esAutoridad,
    tipoEntidad,
    cargoAutoridad,
    unidadZonal,
    cargoPersonal,
    modalidad,
  ]);

  const totalPaginas = Math.max(1, Math.ceil(itemsFiltrados.length / PAGE_SIZE));
  const inicio = (pagina - 1) * PAGE_SIZE;
  const itemsPaginados = itemsFiltrados.slice(inicio, inicio + PAGE_SIZE);

  const limpiarFiltros = () => {
    setTexto("");
    setTipoEntidad("");
    setCargoAutoridad("");
    setUnidadZonal("");
    setCargoPersonal("");
    setModalidad("");
    setPagina(1);
  };

  const seleccionar = (item: MaestroItem) => {
    onSelect(item);
    onClose();
  };

  return (
    <div className="modal-overlay maestro-advanced-overlay" onMouseDown={onClose}>
      <div
        className="maestro-advanced-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="maestro-advanced-header">
          <div>
            <h2>
              {esAutoridad
                ? "Búsqueda avanzada de autoridad"
                : "Búsqueda avanzada de representante PRONIED"}
            </h2>
            <p>Filtra y selecciona un registro activo del maestro correspondiente.</p>
          </div>

          <button
            type="button"
            className="icon-close-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="maestro-advanced-filters">
          {esAutoridad ? (
            <>
              <div className="form-field">
                <label>Tipo entidad</label>
                <select
                  value={tipoEntidad}
                  onChange={(event) => setTipoEntidad(event.target.value)}
                >
                  <option value="">Todos</option>
                  {catalogos.tiposEntidad.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Cargo</label>
                <select
                  value={cargoAutoridad}
                  onChange={(event) => setCargoAutoridad(event.target.value)}
                >
                  <option value="">Todos</option>
                  {catalogos.cargos.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="form-field">
                <label>Unidad Zonal</label>
                <select
                  value={unidadZonal}
                  onChange={(event) => setUnidadZonal(event.target.value)}
                >
                  <option value="">Todos</option>
                  {catalogos.unidadesZonales.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Cargo</label>
                <select
                  value={cargoPersonal}
                  onChange={(event) => setCargoPersonal(event.target.value)}
                >
                  <option value="">Todos</option>
                  {catalogos.cargos.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Modalidad</label>
                <select
                  value={modalidad}
                  onChange={(event) => setModalidad(event.target.value)}
                >
                  <option value="">Todos</option>
                  {catalogos.modalidadContratacion.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="form-field maestro-advanced-search-field">
            <label>Nombres completos o correo</label>
            <div className="input-with-icon">
              <Search size={17} />
              <input
                value={texto}
                placeholder="Buscar por nombres completos o correo"
                onChange={(event) => setTexto(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    event.stopPropagation();
                    setTexto("");
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="maestro-advanced-toolbar">
          <span>{itemsFiltrados.length} registros encontrados</span>
          <button type="button" className="secondary-button" onClick={limpiarFiltros}>
            <X size={16} />
            Limpiar filtros
          </button>
        </div>

        <div className="catalogo-table-card maestro-advanced-table-card">
          {loading ? (
            <div className="maestro-advanced-loading">
              <LoaderCircle className="spin-icon" size={24} />
              <span>Cargando registros...</span>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="catalogo-table">
                <thead>
                  <tr>
                    <th>Tipo Doc.</th>
                    <th>Nro. Doc.</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    {esAutoridad ? (
                      <>
                        <th>Cargo</th>
                        <th>Tipo entidad</th>
                      </>
                    ) : (
                      <>
                        <th>Unidad Zonal</th>
                        <th>Cargo</th>
                        <th>Modalidad</th>
                      </>
                    )}
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsPaginados.length === 0 ? (
                    <tr>
                      <td colSpan={esAutoridad ? 7 : 8}>
                        No se encontraron registros.
                      </td>
                    </tr>
                  ) : (
                    itemsPaginados.map((item) => (
                      <tr key={item.itemId}>
                        <td>{getValue(item, "IdTipoDocIdentidad")}</td>
                        <td>{getValue(item, "NroDocumentoIdentidad")}</td>
                        <td>{getValue(item, "Nombres")}</td>
                        <td>{getValue(item, "Apellidos")}</td>
                        {esAutoridad ? (
                          <>
                            <td>{getValue(item, "Cargo")}</td>
                            <td>{getValue(item, "TipoEntidad")}</td>
                          </>
                        ) : (
                          <>
                            <td>{getValue(item, "IdUnidadZonal")}</td>
                            <td>{getValue(item, "IdCargo")}</td>
                            <td>{getValue(item, "IdModalidadContratacion")}</td>
                          </>
                        )}
                        <td>
                          <button
                            type="button"
                            className="primary-button compact-button"
                            onClick={() => seleccionar(item)}
                          >
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pagination-bar maestro-advanced-pagination">
          <span>
            Página {pagina} de {totalPaginas}
          </span>

          <div className="pagination-actions">
            <button
              type="button"
              onClick={() => setPagina((prev) => Math.max(1, prev - 1))}
              disabled={pagina === 1}
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPagina((prev) => Math.min(totalPaginas, prev + 1))}
              disabled={pagina === totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

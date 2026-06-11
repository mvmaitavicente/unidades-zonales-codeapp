import { MapPin, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SHAREPOINT_CONFIG } from "../../config/sharepoint.config";
import {
  buscarItemsListaConFiltros,
  type RawSharePointItem,
} from "../../services/maestro.service";
import {
  listarDistritosPorProvincia,
  listarProvinciasPorRegion,
  listarRegiones,
  type DistritoOption,
  type ProvinciaOption,
  type RegionOption,
} from "../../services/ubicacion.service";

type Props = {
  onClose: () => void;
  onSelect: (local: RawSharePointItem) => void;
};

type ModoBusqueda = "ubicacion" | "nombre";

const LOCAL_ESCOLAR_SELECT_FIELDS = [
  "CodigoLocal",
  "NombreIE",
  "NombreUGEL",
  "Region",
  "Provincia",
  "Distrito",
  "Direccion",
  "RegionSinAcento",
  "ProvinciaSinAcento",
  "DistritoSinAcento",
];

const ITEMS_POR_PAGINA = 5;

function normalizarTexto(value: string) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

export default function LocalEscolarSearchModal({ onClose, onSelect }: Props) {
  const [modoBusqueda, setModoBusqueda] = useState<ModoBusqueda>("ubicacion");

  const [regiones, setRegiones] = useState<RegionOption[]>([]);
  const [provincias, setProvincias] = useState<ProvinciaOption[]>([]);
  const [distritos, setDistritos] = useState<DistritoOption[]>([]);

  const [regionSeleccionada, setRegionSeleccionada] = useState("");
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [distritoSeleccionado, setDistritoSeleccionado] = useState("");

  const [nombreIE, setNombreIE] = useState("");

  const [loadingRegiones, setLoadingRegiones] = useState(false);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingDistritos, setLoadingDistritos] = useState(false);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<RawSharePointItem[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [error, setError] = useState("");

  const totalPaginas = Math.ceil(items.length / ITEMS_POR_PAGINA);

  const itemsPaginados = items.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  useEffect(() => {
    const cargarRegiones = async () => {
      setLoadingRegiones(true);
      setError("");

      try {
        const data = await listarRegiones();
        setRegiones(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las regiones.");
      } finally {
        setLoadingRegiones(false);
      }
    };

    cargarRegiones();
  }, []);

  const limpiarResultados = () => {
    setItems([]);
    setPaginaActual(1);
    setError("");
  };

  const cambiarModoBusqueda = (modo: ModoBusqueda) => {
    setModoBusqueda(modo);
    setRegionSeleccionada("");
    setProvinciaSeleccionada("");
    setDistritoSeleccionado("");
    setNombreIE("");
    setProvincias([]);
    setDistritos([]);
    limpiarResultados();
  };

  const cambiarRegion = async (value: string) => {
    setRegionSeleccionada(value);
    setProvinciaSeleccionada("");
    setDistritoSeleccionado("");
    setProvincias([]);
    setDistritos([]);
    limpiarResultados();

    if (!value) return;

    setLoadingProvincias(true);

    try {
      const data = await listarProvinciasPorRegion(value);
      setProvincias(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las provincias.");
    } finally {
      setLoadingProvincias(false);
    }
  };

  const cambiarProvincia = async (value: string) => {
    setProvinciaSeleccionada(value);
    setDistritoSeleccionado("");
    setDistritos([]);
    limpiarResultados();

    if (!value || !regionSeleccionada) return;

    setLoadingDistritos(true);

    try {
      const data = await listarDistritosPorProvincia({
        regionSinAcento: regionSeleccionada,
        provinciaSinAcento: value,
      });

      setDistritos(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los distritos.");
    } finally {
      setLoadingDistritos(false);
    }
  };

  const buscarPorUbicacion = async () => {
    if (!regionSeleccionada) {
      setError("Seleccione una región.");
      return;
    }

    if (!provinciaSeleccionada) {
      setError("Seleccione una provincia.");
      return;
    }

    if (!distritoSeleccionado) {
      setError("Seleccione un distrito.");
      return;
    }

    const data = await buscarItemsListaConFiltros({
      listId: SHAREPOINT_CONFIG.lists.localEscolar,
      selectFields: LOCAL_ESCOLAR_SELECT_FIELDS,
      filtros: [
        {
          campo: "RegionSinAcento",
          valor: regionSeleccionada,
          operador: "eq",
        },
        {
          campo: "ProvinciaSinAcento",
          valor: provinciaSeleccionada,
          operador: "eq",
        },
        {
          campo: "DistritoSinAcento",
          valor: distritoSeleccionado,
          operador: "eq",
        },
      ],
      top: 500,
    });

    const textoNombre = normalizarTexto(nombreIE);

    const dataFiltrada = textoNombre
      ? data.filter((item) =>
          normalizarTexto(String(item.values.NombreIE ?? "")).includes(
            textoNombre
          )
        )
      : data;

    setItems(dataFiltrada);
    setPaginaActual(1);

    if (dataFiltrada.length === 0) {
      setError("No se encontraron locales escolares con los filtros indicados.");
    }
  };

  const buscarPorNombre = async () => {
    const textoNombre = normalizarTexto(nombreIE);

    if (textoNombre.length < 3) {
      setError("Ingrese al menos 3 caracteres para buscar por nombre.");
      return;
    }

    const data = await buscarItemsListaConFiltros({
      listId: SHAREPOINT_CONFIG.lists.localEscolar,
      selectFields: LOCAL_ESCOLAR_SELECT_FIELDS,
      filtros: [
        {
          campo: "NombreIE",
          valor: textoNombre,
          operador: "contains",
        },
      ],
      top: 50,
    });

    setItems(data);
    setPaginaActual(1);

    if (data.length === 0) {
      setError("No se encontraron locales escolares con ese nombre.");
    }
  };

  const buscar = async () => {
    setError("");
    setItems([]);
    setPaginaActual(1);
    setLoading(true);

    try {
      if (modoBusqueda === "ubicacion") {
        await buscarPorUbicacion();
      } else {
        await buscarPorNombre();
      }
    } catch (err) {
      console.error(err);
      setError(
        modoBusqueda === "nombre"
          ? "No se pudo buscar por nombre. Verifique que exista la columna NombreIESinAcento."
          : "No se pudieron buscar locales escolares."
      );
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setRegionSeleccionada("");
    setProvinciaSeleccionada("");
    setDistritoSeleccionado("");
    setNombreIE("");
    setProvincias([]);
    setDistritos([]);
    setItems([]);
    setPaginaActual(1);
    setError("");
  };

  return (
    <div className="modal-overlay">
      <div className="maestro-modal">
        <div className="maestro-modal-header">
          <div>
            <h2>Buscar Local Escolar</h2>
          </div>

          <button className="modal-close-button" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="maestro-modal-body">
          <div className="local-search-mode-box">
            <div>
              <label className="local-search-mode-label">Modo de búsqueda</label>

              <div className="local-search-mode-tabs">
                <button
                  type="button"
                  className={
                    modoBusqueda === "ubicacion"
                      ? "local-search-mode active"
                      : "local-search-mode"
                  }
                  onClick={() => cambiarModoBusqueda("ubicacion")}
                >
                  <MapPin size={17} />
                  Por ubicación
                </button>

                <button
                  type="button"
                  className={
                    modoBusqueda === "nombre"
                      ? "local-search-mode active"
                      : "local-search-mode"
                  }
                  onClick={() => cambiarModoBusqueda("nombre")}
                >
                  <Search size={17} />
                  Por nombre
                </button>
              </div>
            </div>

            <div className="local-search-help">
              {modoBusqueda === "ubicacion"
                ? "Busca por región, provincia y distrito. El nombre de la I.E. es opcional."
                : "Busca directamente por el nombre de la Institución Educativa."}
            </div>
          </div>

          {modoBusqueda === "ubicacion" && (
            <div className="local-search-filters">
              <div className="form-field">
                <label>Región *</label>
                <select
                  value={regionSeleccionada}
                  onChange={(e) => cambiarRegion(e.target.value)}
                  disabled={loadingRegiones}
                >
                  <option value="">
                    {loadingRegiones
                      ? "Cargando regiones..."
                      : "Seleccionar región"}
                  </option>

                  {regiones.map((item) => (
                    <option key={item.id} value={item.RegionSinAcento}>
                      {item.Region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Provincia *</label>
                <select
                  value={provinciaSeleccionada}
                  onChange={(e) => cambiarProvincia(e.target.value)}
                  disabled={!regionSeleccionada || loadingProvincias}
                >
                  <option value="">
                    {!regionSeleccionada
                      ? "Seleccione región primero"
                      : loadingProvincias
                      ? "Cargando provincias..."
                      : "Seleccionar provincia"}
                  </option>

                  {provincias.map((item) => (
                    <option key={item.id} value={item.ProvinciaSinAcento}>
                      {item.Provincia}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Distrito *</label>
                <select
                  value={distritoSeleccionado}
                  onChange={(e) => {
                    setDistritoSeleccionado(e.target.value);
                    limpiarResultados();
                  }}
                  disabled={!provinciaSeleccionada || loadingDistritos}
                >
                  <option value="">
                    {!provinciaSeleccionada
                      ? "Seleccione provincia primero"
                      : loadingDistritos
                      ? "Cargando distritos..."
                      : "Seleccionar distrito"}
                  </option>

                  {distritos.map((item) => (
                    <option key={item.id} value={item.DistritoSinAcento}>
                      {item.Distrito}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="local-search-actions-row">
            <div className="form-field local-search-name">
              <label>
                Nombre de la Institución Educativa{" "}
                {modoBusqueda === "ubicacion" ? "(opcional)" : "*"}
              </label>
              <input
                value={nombreIE}
                onChange={(e) => {
                  setNombreIE(e.target.value);
                  limpiarResultados();
                }}
                placeholder={
                  modoBusqueda === "ubicacion"
                    ? "Opcional. Ejemplo: San José"
                    : "Ingrese al menos 3 caracteres"
                }
              />
            </div>

            <button
              type="button"
              className="secondary-button local-search-clear"
              onClick={limpiarFiltros}
              disabled={loading}
            >
              Limpiar
            </button>

            <button
              type="button"
              className="primary-button local-search-submit"
              onClick={buscar}
              disabled={loading}
            >
              <Search size={16} />
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {error && <div className="catalogo-error">{error}</div>}

          <div className="catalogo-table-card" style={{ marginTop: 20 }}>
            <table className="catalogo-table">
              <thead>
                <tr>
                  <th>Código Local</th>
                  <th>Nombre I.E.</th>
                  <th>Región</th>
                  <th>Provincia</th>
                  <th>Distrito</th>
                  <th className="actions-column">Acción</th>
                </tr>
              </thead>

              <tbody>
                {itemsPaginados.map((item) => (
                  <tr key={item.itemId}>
                    <td>{String(item.values.CodigoLocal ?? "")}</td>
                    <td>{String(item.values.NombreIE ?? "")}</td>
                    <td>{String(item.values.Region ?? "")}</td>
                    <td>{String(item.values.Provincia ?? "")}</td>
                    <td>{String(item.values.Distrito ?? "")}</td>
                    <td className="actions-column">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => onSelect(item)}
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6}>No hay resultados.</td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={6}>Buscando locales escolares...</td>
                  </tr>
                )}
              </tbody>
            </table>

            {items.length > 0 && (
              <div className="pagination-bar">
                <span>
                  Mostrando {(paginaActual - 1) * ITEMS_POR_PAGINA + 1} -{" "}
                  {Math.min(paginaActual * ITEMS_POR_PAGINA, items.length)} de{" "}
                  {items.length}
                </span>

                <div className="pagination-actions">
                  <button
                    type="button"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((prev) => prev - 1)}
                  >
                    Anterior
                  </button>

                  <span>
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual((prev) => prev + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
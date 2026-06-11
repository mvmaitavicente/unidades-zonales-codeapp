import { LoaderCircle, MapPin, Search, X } from "lucide-react";
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

const LOCAL_ESCOLAR_SELECT_FIELDS = [
  "CodigoLocal",
  "NombreIE",
  "NombreUgel",
  "Direccion",
  "IdUbigeoKey",
];

const ITEMS_POR_PAGINA = 5;

export default function LocalEscolarSearchModal({ onClose, onSelect }: Props) {
  const [regiones, setRegiones] = useState<RegionOption[]>([]);
  const [provincias, setProvincias] = useState<ProvinciaOption[]>([]);
  const [distritos, setDistritos] = useState<DistritoOption[]>([]);

  const [regionSeleccionada, setRegionSeleccionada] = useState("");
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [distritoSeleccionado, setDistritoSeleccionado] = useState("");

  const [loadingRegiones, setLoadingRegiones] = useState(false);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingDistritos, setLoadingDistritos] = useState(false);
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState<RawSharePointItem[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [error, setError] = useState("");

  const totalPaginas = Math.max(1, Math.ceil(items.length / ITEMS_POR_PAGINA));

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

    const distrito = distritos.find((item) => item.id === distritoSeleccionado);
    const idUbigeoKeys = (distrito?.IdUbigeoKeys ?? [])
      .map(Number)
      .filter((value) => value > 0);

    if (!distrito || idUbigeoKeys.length === 0) {
      setError("El distrito seleccionado no tiene IdUbigeoKey configurado.");
      return;
    }

    const region = regiones.find(
      (item) => item.RegionSinAcento === regionSeleccionada
    );

    const provincia = provincias.find(
      (item) => item.ProvinciaSinAcento === provinciaSeleccionada
    );

    const data = await buscarItemsListaConFiltros({
      listId: SHAREPOINT_CONFIG.lists.localEscolar,
      selectFields: LOCAL_ESCOLAR_SELECT_FIELDS,
      filtros: [
        {
          campo: "IdUbigeoKey",
          valor: idUbigeoKeys,
          operador: "in",
          tipo: "number",
        },
      ],
      top: 500,
    });

    const dataEnriquecida = data.map((item) => ({
      ...item,
      values: {
        ...item.values,
        Region: region?.Region ?? "",
        Provincia: provincia?.Provincia ?? "",
        Distrito: distrito.Distrito,
      },
    }));

    setItems(dataEnriquecida);
    setPaginaActual(1);

    if (dataEnriquecida.length === 0) {
      setError("No se encontraron locales escolares para el distrito seleccionado.");
    }
  };

  const buscar = async () => {
    setError("");
    setItems([]);
    setPaginaActual(1);
    setLoading(true);

    try {
      await buscarPorUbicacion();
    } catch (err) {
      console.error(err);
      setError("No se pudieron buscar locales escolares.");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setRegionSeleccionada("");
    setProvinciaSeleccionada("");
    setDistritoSeleccionado("");
    setProvincias([]);
    setDistritos([]);
    setItems([]);
    setPaginaActual(1);
    setError("");
  };

  return (
    <div className="modal-overlay">
      <div className="maestro-modal local-school-modal">
        <div className="maestro-modal-header">
          <div>
            <h2>Buscar Local Escolar</h2>
            <p>Seleccione región, provincia y distrito para listar los locales disponibles.</p>
          </div>

          <button className="modal-close-button" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="maestro-modal-body">
          <div className="local-search-mode-box location-only">
            <div className="local-search-help full">
              <MapPin size={17} />
              Búsqueda avanzada por ubicación. Los distritos se muestran una sola vez y se consultan todos sus IdUbigeoKey asociados.
            </div>
          </div>

          <div className="local-search-filters">
            <div className="form-field">
              <label>Región *</label>
              <select
                value={regionSeleccionada}
                onChange={(e) => cambiarRegion(e.target.value)}
                disabled={loadingRegiones || loading}
              >
                <option value="">
                  {loadingRegiones ? "Cargando regiones..." : "Seleccionar región"}
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
                disabled={!regionSeleccionada || loadingProvincias || loading}
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
                disabled={!provinciaSeleccionada || loadingDistritos || loading}
              >
                <option value="">
                  {!provinciaSeleccionada
                    ? "Seleccione provincia primero"
                    : loadingDistritos
                    ? "Cargando distritos..."
                    : "Seleccionar distrito"}
                </option>

                {distritos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.Distrito}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="local-search-actions-row location-actions">
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
              {loading ? <LoaderCircle className="spin-icon" size={16} /> : <Search size={16} />}
              {loading ? "Buscando..." : "Buscar locales"}
            </button>
          </div>

          {error && <div className="catalogo-error">{error}</div>}

          <div className="catalogo-table-card" style={{ marginTop: 20 }}>
            <table className="catalogo-table">
              <thead>
                <tr>
                  <th>Código Local</th>
                  <th>Nombre I.E.</th>
                  <th>UGEL</th>
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
                    <td>{String(item.values.NombreUgel ?? item.values.NombreUGEL ?? "")}</td>
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
                    <td colSpan={7}>No hay resultados.</td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={7}>
                      <span className="inline-loading">
                        <LoaderCircle className="spin-icon" size={16} />
                        Buscando locales escolares...
                      </span>
                    </td>
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
                    onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </button>

                  <span>
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))}
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

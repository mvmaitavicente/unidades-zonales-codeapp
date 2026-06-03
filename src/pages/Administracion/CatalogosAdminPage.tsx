import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Check, Pencil, Plus, RefreshCcw, Search, X } from "lucide-react";

import {
  catalogosConfig,
  type CatalogoKey,
} from "../../data/catalogos.config";
import { useCatalogos } from "../../hooks/useCatalogos";
import type { CatalogoFormData, CatalogoItem } from "../../types/catalogo.types";

export default function CatalogosAdminPage() {
  const { catalogoKey } = useParams();

  if (!catalogoKey || !(catalogoKey in catalogosConfig)) {
    return <Navigate to="/administracion/catalogos/medio-coordinacion" replace />;
  }

  const config = catalogosConfig[catalogoKey as CatalogoKey];

  const { items, loading, error, cargar, guardar, cambiarEstado } = useCatalogos({
    siteId: config.siteId,
    listId: config.listId,
    campoDescripcion: config.campoDescripcion,
  });

  const [busqueda, setBusqueda] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [itemEditando, setItemEditando] = useState<CatalogoItem | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);

  const itemsFiltrados = useMemo(() => {
    return items.filter((item) =>
      item.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [items, busqueda]);

  const abrirNuevo = () => {
    setItemEditando(null);
    setDescripcion("");
    setActivo(true);
    setModalOpen(true);
  };

  const abrirEditar = (item: CatalogoItem) => {
    setItemEditando(item);
    setDescripcion(item.descripcion);
    setActivo(item.activo);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setItemEditando(null);
    setDescripcion("");
    setActivo(true);
  };

  const guardarRegistro = async () => {
    const data: CatalogoFormData = {
      itemId: itemEditando?.itemId,
      descripcion: descripcion.trim(),
      activo,
    };

    if (!data.descripcion) {
      alert("Ingrese la descripción.");
      return;
    }

    await guardar(data);
    cerrarModal();
  };

  return (
    <div className="page">
      <div className="catalogo-header">
        <div>
          <h1>{config.titulo}</h1>
          <p>Administración de la lista {config.listaSharePoint}.</p>
        </div>

        <button className="primary-button" onClick={abrirNuevo} type="button">
          <Plus size={18} />
          Nuevo registro
        </button>
      </div>

      <div className="catalogo-card">
        <div className="catalogo-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={`Buscar en ${config.titulo.toLowerCase()}...`}
            />
          </div>

          <button className="secondary-button" onClick={cargar} type="button">
            <RefreshCcw size={17} />
            Actualizar
          </button>
        </div>

        {error && <div className="catalogo-error">{error}</div>}

        <div className="table-wrapper">
          <table className="catalogo-table">
            <thead>
              <tr>
                <th className="index-column">#</th>
                <th>Descripción</th>
                <th>Activo</th>
                <th className="actions-column">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Cargando registros...</td>
                </tr>
              ) : itemsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4}>No se encontraron registros.</td>
                </tr>
              ) : (
                itemsFiltrados.map((item, index) => (
                  <tr key={item.itemId}>
                    <td className="index-column">{index + 1}</td>
                    <td>{item.descripcion}</td>
                    <td>
                      <span
                        className={
                          item.activo ? "status active" : "status inactive"
                        }
                      >
                        {item.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="actions-column">
                      <button
                        className="icon-action"
                        onClick={() => abrirEditar(item)}
                        title="Editar"
                        type="button"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="icon-action"
                        onClick={() =>
                          cambiarEstado(item.itemId, item.activo)
                        }
                        title={item.activo ? "Inactivar" : "Activar"}
                        type="button"
                      >
                        {item.activo ? <X size={16} /> : <Check size={16} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="drawer">
            <div className="drawer-header">
              <div>
                <h2>{itemEditando ? "Editar registro" : "Nuevo registro"}</h2>
                <p>{config.titulo}</p>
              </div>

              <button className="icon-action" onClick={cerrarModal} type="button">
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <label className="form-label">
                Descripción
                <input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ingrese la descripción"
                />
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                />
                Activo
              </label>
            </div>

            <div className="drawer-footer">
              <button
                className="secondary-button"
                onClick={cerrarModal}
                type="button"
              >
                Cancelar
              </button>

              <button
                className="primary-button"
                onClick={guardarRegistro}
                type="button"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
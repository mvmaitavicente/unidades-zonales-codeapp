import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { maestrosConfig } from "../../config/maestros.config";
import type { MaestroConfig, MaestroItem } from "../../types/maestro.types";
import { useMaestro } from "../../hooks/useMaestro";
import { useCatalogosGlobal } from "../../hooks/useCatalogosGlobal";
import MaestroForm from "../../components/Maestros/MaestroForm";
import MaestroTable from "../../components/Maestros/MaestroTable";

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

  return <MaestroAdminContent config={config} />;
}

function MaestroAdminContent({ config }: { config: MaestroConfig }) {
  const { catalogos, loading: loadingCatalogos } = useCatalogosGlobal();
  const { items, loading, saving, guardar, cambiarEstado } =
    useMaestro(config);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [itemEditando, setItemEditando] = useState<MaestroItem | null>(null);

  const nuevoRegistro = () => {
    setItemEditando(null);
    setMostrarFormulario(true);
  };

  const editarRegistro = (item: MaestroItem) => {
    setItemEditando(item);
    setMostrarFormulario(true);
  };

  const cancelar = () => {
    setItemEditando(null);
    setMostrarFormulario(false);
  };

  const guardarRegistro = async (
    data: Record<string, unknown>,
    itemId?: string
  ) => {
    await guardar(data, itemId);
    cancelar();
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>{config.titulo}</h1>
          <p>{config.descripcion}</p>
        </div>

        <button className="primary-button" type="button" onClick={nuevoRegistro}>
          Nuevo registro
        </button>
      </div>

      {mostrarFormulario && (
        <div className="content-card">
          <h2>{itemEditando ? "Editar registro" : "Nuevo registro"}</h2>

          {loadingCatalogos ? (
            <p>Cargando opciones...</p>
          ) : (
            <MaestroForm
              config={config}
              itemEditando={itemEditando}
              catalogos={catalogos}
              saving={saving}
              onGuardar={guardarRegistro}
              onCancelar={cancelar}
            />
          )}
        </div>
      )}

      <div className="content-card">
        {loading ? (
          <p>Cargando registros...</p>
        ) : (
          <MaestroTable
            config={config}
            items={items}
            onEdit={editarRegistro}
            onToggleEstado={cambiarEstado}
          />
        )}
      </div>
    </div>
  );
}
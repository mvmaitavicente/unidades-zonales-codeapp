import { useState } from "react";
import TransaccionForm from "../components/transacciones/TransaccionForm";
import { transaccionesConfig } from "../config/transacciones.config";
import { useCatalogosGlobal } from "../hooks/useCatalogosGlobal";
import { useTransacciones } from "../hooks/useTransacciones";
import type { TransaccionItem } from "../types/transaccion.types";

export default function BandejaVisitasPage() {
  const { catalogos } = useCatalogosGlobal();
  const config = transaccionesConfig.visitaAutoridades;

  const {
    items,
    loading,
    saving,
    error,
    cargar,
    guardar,
    eliminar,
  } = useTransacciones(config);

  const [itemEditando, setItemEditando] = useState<TransaccionItem | null>(
    null
  );

  const confirmarEliminar = async (itemId: string) => {
    const confirmar = window.confirm("¿Deseas eliminar este registro?");
    if (!confirmar) return;

    await eliminar(itemId);
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Bandeja de Visitas</h1>
          <p>Consulta y administra las visitas registradas.</p>
        </div>

        <button type="button" onClick={cargar}>
          Actualizar
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {itemEditando && (
        <div className="card">
          <h2>Editar visita</h2>

          <TransaccionForm
            config={config}
            itemEditando={itemEditando}
            catalogos={catalogos}
            saving={saving}
            onGuardar={async (data, itemId) => {
              await guardar(data, itemId);
              setItemEditando(null);
            }}
            onCancelar={() => setItemEditando(null)}
          />
        </div>
      )}

      <div className="card">
        {loading ? (
          <p>Cargando registros...</p>
        ) : (
          <table className="maestro-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Asunto</th>
                <th>Fecha inicio</th>
                <th>Medio coordinación</th>
                <th>Documento autoridad</th>
                <th>Código local</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.itemId}>
                  <td>{String(item.values.CodigoVisita ?? "")}</td>
                  <td>{String(item.values.Asunto ?? "")}</td>
                  <td>{String(item.values.FechaInicio ?? "")}</td>
                  <td>{String(item.values.MedioCoordinacion ?? "")}</td>
                  <td>{String(item.values.DocIdentidadAutoridad ?? "")}</td>
                  <td>{String(item.values.CodigoLocal ?? "")}</td>
                  <td>
                    <button type="button" onClick={() => setItemEditando(item)}>
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => confirmarEliminar(item.itemId)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={7}>No hay registros.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
import { CheckCircle, ListChecks } from "lucide-react";
import { useState } from "react";
import TransaccionForm from "../components/transacciones/TransaccionForm";
import { transaccionesConfig } from "../config/transacciones.config";
import { useCatalogosGlobal } from "../hooks/useCatalogosGlobal";
import { useTransacciones } from "../hooks/useTransacciones";
import type { TransaccionFormData } from "../types/transaccion.types";

export default function RegistroVisitasPage() {
  const { catalogos } = useCatalogosGlobal();
  const config = transaccionesConfig.visitaAutoridades;
  const { guardar, saving, error } = useTransacciones(config);

  const [mensaje, setMensaje] = useState("");

  const onGuardar = async (data: TransaccionFormData) => {
    setMensaje("");

    const codigo = await guardar(data, undefined, { recargar: false });

    setMensaje(
      codigo
        ? `Registro guardado correctamente. Código generado: ${codigo}`
        : "Registro guardado correctamente."
    );
  };

  return (
    <section className="page-container">
      <div className="maestro-panel">
        <div className="maestro-header">
          <div>
            <h1>{config.titulo}</h1>
            <p>{config.descripcion}</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              window.location.hash = "/bandeja-visitas";
            }}
          >
            <ListChecks size={18} />
            Ver bandeja
          </button>
        </div>

        {(mensaje || error) && (
          <div style={{ padding: "18px 32px 0" }}>
            {mensaje && (
              <div className="status active" style={{ gap: 8 }}>
                <CheckCircle size={16} />
                {mensaje}
              </div>
            )}

            {error && <div className="catalogo-error">{error}</div>}
          </div>
        )}

        <div className="maestro-form-card" style={{ marginTop: 24 }}>
          <h2>Nuevo registro</h2>
          <p>Completa los datos de la visita.</p>

          <TransaccionForm
            config={config}
            catalogos={catalogos}
            saving={saving}
            onGuardar={onGuardar}
          />
        </div>
      </div>
    </section>
  );
}
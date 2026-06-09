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

    const codigo = await guardar(data);

    setMensaje(
      codigo
        ? `Registro guardado correctamente. Código generado: ${codigo}`
        : "Registro guardado correctamente."
    );
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>{config.titulo}</h1>
          <p>{config.descripcion}</p>
        </div>
      </div>

      {mensaje && <div className="form-message">{mensaje}</div>}
      {error && <div className="form-error">{error}</div>}

      <TransaccionForm
        config={config}
        catalogos={catalogos}
        saving={saving}
        onGuardar={onGuardar}
      />
    </section>
  );
}
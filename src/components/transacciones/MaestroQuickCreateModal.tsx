import { useState } from "react";
import MaestroForm from "../Maestros/MaestroForm";
import MaestroModal from "../Maestros/MaestroModal";
import { maestrosConfig } from "../../config/maestros.config";
import {
  crearMaestro,
  existeDocumentoMaestro,
} from "../../services/maestro.service";
import type { LookupOption } from "../../contexts/CatalogosGlobalContext";
import type { MaestroFormData } from "../../types/maestro.types";

type Props = {
  tipo: "personal" | "autoridades";
  catalogos: Record<string, LookupOption[]>;
  onClose: () => void;
  onCreated: (nroDocumento: string) => Promise<void>;
};

export default function MaestroQuickCreateModal({
  tipo,
  catalogos,
  onClose,
  onCreated,
}: Props) {
  const config = maestrosConfig[tipo];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const guardar = async (data: MaestroFormData) => {
    setError("");

    const nroDocumento = String(data.NroDocumentoIdentidad ?? "").trim();

    if (!nroDocumento) {
      setError("Ingrese el número de documento.");
      return;
    }

    setSaving(true);

    try {
      const existe = await existeDocumentoMaestro({
        config,
        nroDocumento,
      });

      if (existe) {
        setError(`Ya existe un registro con el documento ${nroDocumento}.`);
        return;
      }

      await crearMaestro(config, data);
      await onCreated(nroDocumento);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el maestro."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <MaestroModal
      title={tipo === "personal" ? "Registrar personal" : "Registrar autoridad"}
      subtitle="El registro se guardará en el maestro correspondiente."
      onClose={onClose}
    >
      {error && <div className="catalogo-error">{error}</div>}

      <MaestroForm
        config={config}
        catalogos={catalogos}
        saving={saving}
        onGuardar={guardar}
        onCancelar={onClose}
      />
    </MaestroModal>
  );
}
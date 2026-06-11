import { useEffect, useState } from "react";
import type {
  TransaccionConfig,
  TransaccionFieldConfig,
  TransaccionFormData,
  TransaccionItem,
} from "../../types/transaccion.types";
import type { LookupOption } from "../../contexts/CatalogosGlobalContext";

type Props = {
  config: TransaccionConfig;
  itemEditando?: TransaccionItem | null;
  catalogos: Record<string, LookupOption[]>;
  saving: boolean;
  onGuardar: (data: TransaccionFormData, itemId?: string) => Promise<void>;
  onCancelar?: () => void;
};

export default function TransaccionForm({
  config,
  itemEditando,
  catalogos,
  saving,
  onGuardar,
  onCancelar,
}: Props) {
  const [formData, setFormData] = useState<TransaccionFormData>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const data: TransaccionFormData = {};

    config.fields.forEach((field) => {
      if (itemEditando) {
        data[field.key] =
          field.type === "lookup"
            ? itemEditando.values[`${field.key}Id`] ?? ""
            : itemEditando.values[field.key] ?? "";
      } else {
        data[field.key] = "";
      }
    });

    setFormData(data);
    setError("");
  }, [config, itemEditando]);

  const actualizarCampo = (field: TransaccionFieldConfig, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field.key]: value,
    }));
  };

  const validar = () => {
    for (const field of config.fields) {
      const value = String(formData[field.key] ?? "").trim();

      if (field.required && !value) {
        setError(`El campo ${field.label} es obligatorio.`);
        return false;
      }
    }

    setError("");
    return true;
  };

  const guardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validar()) return;

    await onGuardar(formData, itemEditando?.itemId);
  };

  return (
    <form className="maestro-form" onSubmit={guardar}>
      {error && <div className="form-error">{error}</div>}

      <div className="maestro-form-grid">
        {config.fields.map((field) => {
          const value = formData[field.key] ?? "";

          if (field.type === "lookup") {
            const options =
              field.catalogoKey && catalogos[field.catalogoKey]
                ? catalogos[field.catalogoKey]
                : [];

            return (
              <div key={field.key} className="form-field">
                <label>
                  {field.label}
                  {field.required && <span>*</span>}
                </label>

                <select
                  value={String(value)}
                  required={field.required}
                  onChange={(e) =>
                    actualizarCampo(
                      field,
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                >
                  <option value="">Seleccionar</option>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.key} className="form-field form-field-full">
                <label>
                  {field.label}
                  {field.required && <span>*</span>}
                </label>

                <textarea
                  value={String(value)}
                  required={field.required}
                  placeholder={field.placeholder}
                  onChange={(e) => actualizarCampo(field, e.target.value)}
                />
              </div>
            );
          }

          return (
            <div key={field.key} className="form-field">
              <label>
                {field.label}
                {field.required && <span>*</span>}
              </label>

              <input
                type={
                  field.type === "date"
                    ? "date"
                    : field.type === "email"
                    ? "email"
                    : field.type === "url"
                    ? "url"
                    : "text"
                }
                value={String(value)}
                required={field.required}
                placeholder={field.placeholder}
                onChange={(e) => actualizarCampo(field, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        {onCancelar && (
          <button type="button" onClick={onCancelar}>
            Cancelar
          </button>
        )}

        <button type="submit" disabled={saving}>
          {saving
            ? "Guardando..."
            : itemEditando
            ? "Actualizar registro"
            : "Guardar registro"}
        </button>
      </div>
    </form>
  );
}
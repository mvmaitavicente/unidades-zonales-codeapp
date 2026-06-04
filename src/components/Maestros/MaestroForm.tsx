import { useEffect, useState } from "react";
import type {
  LookupOption,
  MaestroConfig,
  MaestroFormData,
  MaestroItem,
} from "../../types/maestro.types";

type Props = {
  config: MaestroConfig;
  itemEditando?: MaestroItem | null;
  lookups: Record<string, LookupOption[]>;
  saving: boolean;
  onGuardar: (data: MaestroFormData, itemId?: string) => Promise<void>;
  onCancelar: () => void;
};

export default function MaestroForm({
  config,
  itemEditando,
  lookups,
  saving,
  onGuardar,
  onCancelar,
}: Props) {
  const [formData, setFormData] = useState<MaestroFormData>({});

  useEffect(() => {
    if (!itemEditando) {
      const initialData: MaestroFormData = {};

      config.fields.forEach((field) => {
        if (field.type === "boolean") {
          initialData[field.key] = true;
        } else {
          initialData[field.key] = "";
        }
      });

      setFormData(initialData);
      return;
    }

    const editData: MaestroFormData = {};

    config.fields.forEach((field) => {
      if (field.type === "lookup") {
        editData[field.key] = itemEditando.values[`${field.key}Id`] ?? "";
      } else {
        editData[field.key] = itemEditando.values[field.key] ?? "";
      }
    });

    setFormData(editData);
  }, [config, itemEditando]);

  const actualizarCampo = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const guardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onGuardar(formData, itemEditando?.itemId);
  };

  return (
    <form className="maestro-form" onSubmit={guardar}>
      <div className="maestro-form-grid">
        {config.fields.map((field) => {
          const value = formData[field.key] ?? "";

          if (field.type === "boolean") {
            return (
              <label key={field.key} className="form-check">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) =>
                    actualizarCampo(field.key, e.target.checked)
                  }
                />
                {field.label}
              </label>
            );
          }

          if (field.type === "lookup") {
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
                    actualizarCampo(field.key, Number(e.target.value))
                  }
                >
                  <option value="">Seleccionar</option>

                  {(lookups[field.key] ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                type={field.type === "email" ? "email" : "text"}
                value={String(value)}
                required={field.required}
                maxLength={field.maxLength}
                onChange={(e) => actualizarCampo(field.key, e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>

        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : itemEditando ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
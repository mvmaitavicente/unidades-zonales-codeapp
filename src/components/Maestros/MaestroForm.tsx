import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import type {
  MaestroConfig,
  MaestroFieldConfig,
  MaestroFormData,
  MaestroItem,
} from "../../types/maestro.types";
import type { LookupOption } from "../../contexts/CatalogosGlobalContext";

type Props = {
  config: MaestroConfig;
  itemEditando?: MaestroItem | null;
  catalogos: Record<string, LookupOption[]>;
  saving: boolean;
  onGuardar: (data: MaestroFormData, itemId?: string) => Promise<void>;
  onCancelar: () => void;
};

type CatalogoOptionExtra = LookupOption & {
  extra?: Record<string, unknown>;
};

const soloNumeros = (value: string) => /^\d*$/.test(value);
const decimal = (value: string) => /^\d*\.?\d*$/.test(value);

function validarDominioCorreo(value: string, domain: string) {
  return value.toLowerCase().endsWith(domain.toLowerCase());
}

function toNumberOrZero(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const text = String(value ?? "").trim().toLowerCase();
  return ["true", "1", "sí", "si", "yes", "y", "x"].includes(text);
}

export default function MaestroForm({
  config,
  itemEditando,
  catalogos,
  saving,
  onGuardar,
  onCancelar,
}: Props) {
  const [formData, setFormData] = useState<MaestroFormData>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const data: MaestroFormData = {};

    config.fields.forEach((field) => {
      if (itemEditando) {
        data[field.key] =
          field.type === "lookup"
            ? itemEditando.values[`${field.key}Id`] ?? ""
            : itemEditando.values[field.key] ?? "";
      } else {
        data[field.key] = field.type === "boolean" ? true : "";
      }
    });

    setFormData(data);
    setError("");
  }, [config, itemEditando]);

  const obtenerOpcionCatalogo = (
    field: MaestroFieldConfig
  ): CatalogoOptionExtra | undefined => {
    if (!field.catalogoKey) return undefined;

    const value = formData[field.key];
    if (value === undefined || value === null || value === "") return undefined;

    const options = catalogos[field.catalogoKey] ?? [];

    return options.find(
      (option) => String(option.value) === String(value)
    ) as CatalogoOptionExtra | undefined;
  };

  const obtenerReglaDocumento = (field: MaestroFieldConfig) => {
    const sourceKey = field.validation?.dynamicDocumentFrom;
    if (!sourceKey) return null;

    const sourceField = config.fields.find((f) => f.key === sourceKey);
    if (!sourceField) return null;

    const option = obtenerOpcionCatalogo(sourceField);
    if (!option) return null;

    return {
      minLength: toNumberOrZero(option.extra?.LongitudMinima),
      maxLength: toNumberOrZero(option.extra?.LongitudMaxima),
      onlyNumbers: toBoolean(option.extra?.SoloNumeros),
      label: option.label,
    };
  };

  const actualizarCampo = (field: MaestroFieldConfig, value: unknown) => {
    setError("");

    const textValue = String(value ?? "");
    const validation = field.validation;
    const documentoRule = obtenerReglaDocumento(field);

    const onlyNumbers = validation?.onlyNumbers || documentoRule?.onlyNumbers;
    const maxLength = validation?.maxLength ?? documentoRule?.maxLength;

    if (onlyNumbers && !soloNumeros(textValue)) return;

    if (validation?.decimal && !decimal(textValue)) return;

    if (maxLength && textValue.length > maxLength) return;

    setFormData((prev) => {
      const next: MaestroFormData = {
        ...prev,
        [field.key]: value,
      };

      if (field.type === "lookup") {
        config.fields.forEach((candidate) => {
          if (candidate.validation?.dynamicDocumentFrom === field.key) {
            next[candidate.key] = "";
          }
        });
      }

      return next;
    });
  };

  const validarFormulario = (): boolean => {
    for (const field of config.fields) {
      const value = String(formData[field.key] ?? "").trim();
      const validation = field.validation;
      const documentoRule = obtenerReglaDocumento(field);

      if (field.required && !value) {
        setError(`El campo ${field.label} es obligatorio.`);
        return false;
      }

      const minLength = validation?.minLength ?? documentoRule?.minLength;
      const maxLength = validation?.maxLength ?? documentoRule?.maxLength;

      if (value && minLength && value.length < minLength) {
        setError(`El campo ${field.label} debe tener mínimo ${minLength} caracteres.`);
        return false;
      }

      if (value && maxLength && value.length > maxLength) {
        setError(`El campo ${field.label} debe tener máximo ${maxLength} caracteres.`);
        return false;
      }

      if (
        value &&
        minLength &&
        maxLength &&
        minLength === maxLength &&
        value.length !== maxLength
      ) {
        setError(`El campo ${field.label} debe tener exactamente ${maxLength} caracteres.`);
        return false;
      }

      if (value && validation?.emailDomain) {
        if (!validarDominioCorreo(value, validation.emailDomain)) {
          setError(`El campo ${field.label} debe terminar en ${validation.emailDomain}.`);
          return false;
        }
      }

      if (
        value &&
        validation?.startsWith &&
        !value.startsWith(validation.startsWith)
      ) {
        setError(`El campo ${field.label} debe empezar con ${validation.startsWith}.`);
        return false;
      }
    }

    setError("");
    return true;
  };

  const guardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validarFormulario()) return;

    await onGuardar(formData, itemEditando?.itemId);
  };

  return (
    <form className="maestro-form" onSubmit={guardar}>
      {error && <div className="form-error">{error}</div>}

      <div className="maestro-form-grid">
        {config.fields.map((field) => {
          const value = formData[field.key] ?? "";

          if (field.type === "boolean") {
            return (
              <label key={field.key} className="form-check">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => actualizarCampo(field, e.target.checked)}
                />
                {field.label}
              </label>
            );
          }

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

          const documentoRule = obtenerReglaDocumento(field);
          const maxLength =
            field.validation?.maxLength ?? documentoRule?.maxLength;

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
                disabled={
                  Boolean(field.validation?.dynamicDocumentFrom) &&
                  !obtenerReglaDocumento(field)
                }
                placeholder={
                  field.validation?.dynamicDocumentFrom && !obtenerReglaDocumento(field)
                    ? "Seleccione primero el tipo de documento"
                    : field.placeholder
                }
                maxLength={maxLength || undefined}
                inputMode={
                  field.validation?.onlyNumbers || documentoRule?.onlyNumbers
                    ? "numeric"
                    : field.validation?.decimal
                    ? "decimal"
                    : undefined
                }
                onChange={(e) => actualizarCampo(field, e.target.value)}
              />

              {documentoRule && documentoRule.minLength > 0 && documentoRule.maxLength > 0 && (
                <small className="form-help">
                  {documentoRule.minLength === documentoRule.maxLength
                    ? `Debe tener exactamente ${documentoRule.maxLength} caracteres${documentoRule.onlyNumbers ? " numéricos" : ""}.`
                    : `Debe tener entre ${documentoRule.minLength} y ${documentoRule.maxLength} caracteres${documentoRule.onlyNumbers ? " numéricos" : ""}.`}
                </small>
              )}

              {field.validation?.emailDomain &&
                String(value).trim() &&
                !validarDominioCorreo(String(value), field.validation.emailDomain) && (
                  <small className="form-help-error">
                    El correo debe terminar en {field.validation.emailDomain}
                  </small>
                )}

              {field.validation?.startsWith &&
                String(value).trim() &&
                !String(value).startsWith(field.validation.startsWith) && (
                  <small className="form-help-error">
                    El celular debe empezar con {field.validation.startsWith}.
                  </small>
                )}
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancelar} disabled={saving}>
          Cancelar
        </button>

        <button type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="spin-icon" size={17} /> : null}
          {saving ? "Guardando..." : itemEditando ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
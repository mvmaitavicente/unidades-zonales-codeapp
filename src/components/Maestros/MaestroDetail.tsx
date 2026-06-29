import { BriefcaseBusiness, Building2, CircleDollarSign, FileText, Mail, Phone, UserRound } from "lucide-react";
import type { MaestroConfig, MaestroFieldConfig, MaestroItem } from "../../types/maestro.types";

type Props = {
  config: MaestroConfig;
  item: MaestroItem;
};

const detalleOrden: Record<string, string[]> = {
  autoridades: [
    "IdTipoDocIdentidad",
    "NroDocumentoIdentidad",
    "Nombres",
    "Apellidos",
    "TipoEntidad",
    "Cargo",
    "Correo",
    "NroCelular",
  ],
  personal: [
    "IdTipoDocIdentidad",
    "NroDocumentoIdentidad",
    "Nombres",
    "Apellidos",
    "IdUnidadZonal",
    "IdCargo",
    "IdCarreraPersonal",
    "IdModalidadContratacion",
    "MontoRemuneracion",
    "CorreoInstitucional",
    "NroCelular",
  ],
};

function getNombreCompleto(item: MaestroItem) {
  return [item.values.Nombres, item.values.Apellidos]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

function getIniciales(nombreCompleto: string) {
  const partes = nombreCompleto.split(" ").filter(Boolean);

  if (partes.length === 0) return "--";

  return partes
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

function formatValue(field: MaestroFieldConfig, value: unknown) {
  if (value === undefined || value === null || value === "") return "-";

  if (field.type === "number") {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) return String(value);

    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(numericValue);
  }

  return String(value);
}

function getIcon(fieldKey: string) {
  if (fieldKey.includes("Correo")) return <Mail size={18} />;
  if (fieldKey.includes("Celular")) return <Phone size={18} />;
  if (fieldKey.includes("Documento") || fieldKey.includes("TipoDoc")) return <FileText size={18} />;
  if (fieldKey.includes("Cargo") || fieldKey.includes("Modalidad") || fieldKey.includes("Carrera")) return <BriefcaseBusiness size={18} />;
  if (fieldKey.includes("Unidad") || fieldKey.includes("Entidad")) return <Building2 size={18} />;
  if (fieldKey.includes("Monto")) return <CircleDollarSign size={18} />;
  return <UserRound size={18} />;
}

function getDetailFields(config: MaestroConfig) {
  const orden = detalleOrden[config.key];

  if (!orden) {
    return config.fields.filter((field) => field.visibleInDetail);
  }

  return orden
    .map((key) => config.fields.find((field) => field.key === key))
    .filter((field): field is MaestroFieldConfig => Boolean(field));
}

export default function MaestroDetail({ config, item }: Props) {
  const fields = getDetailFields(config);
  const nombreCompleto = getNombreCompleto(item) || "Registro seleccionado";
  const activo = Boolean(item.values.Activo);

  return (
    <div className="maestro-detail-shell">
      <div className="maestro-detail-hero">
        <div className="maestro-detail-avatar">{getIniciales(nombreCompleto)}</div>

        <div className="maestro-detail-heading">
          <span>{config.titulo}</span>
          <h3>{nombreCompleto}</h3>
          <p>
            {String(item.values.NroDocumentoIdentidad ?? "Sin documento")}
          </p>
        </div>

        <span className={activo ? "status active" : "status inactive"}>
          {activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="maestro-detail-grid">
        {fields.map((field) => (
          <div className="maestro-detail-item" key={field.key}>
            <div className="maestro-detail-item-icon">{getIcon(field.key)}</div>
            <div>
              <span>{field.label}</span>
              <strong>{formatValue(field, item.values[field.key])}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Check, Eye, Pencil, X } from "lucide-react";
import type { MaestroConfig, MaestroItem } from "../../types/maestro.types";

type Props = {
  config: MaestroConfig;
  items: MaestroItem[];
  onViewDetail: (item: MaestroItem) => void;
  onEdit: (item: MaestroItem) => void;
  onToggleEstado: (item: MaestroItem) => void;
  disabled?: boolean;
};

export default function MaestroTable({
  config,
  items,
  onViewDetail,
  onEdit,
  onToggleEstado,
  disabled = false,
}: Props) {
  const visibleFields = config.fields.filter((field) => field.visibleInTable);

  return (
    <div className="catalogo-table-card">
      <table className="catalogo-table">
        <thead>
          <tr>
            {visibleFields.map((field) => (
              <th key={field.key}>{field.label}</th>
            ))}
            <th className="actions-column">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.itemId}>
              {visibleFields.map((field) => {
                const value = item.values[field.key];

                if (field.type === "boolean") {
                  return (
                    <td key={field.key}>
                      <span
                        className={
                          Boolean(value) ? "status active" : "status inactive"
                        }
                      >
                        {Boolean(value) ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  );
                }

                return <td key={field.key}>{String(value ?? "")}</td>;
              })}

              <td className="actions-column">
                <button
                  className="icon-action"
                  type="button"
                  title="Ver detalle"
                  disabled={disabled}
                  onClick={() => onViewDetail(item)}
                >
                  <Eye size={16} />
                </button>

                <button
                  className="icon-action"
                  type="button"
                  title="Editar"
                  disabled={disabled}
                  onClick={() => onEdit(item)}
                >
                  <Pencil size={16} />
                </button>

                <button
                  className="icon-action"
                  type="button"
                  title={Boolean(item.values.Activo) ? "Inactivar" : "Activar"}
                  disabled={disabled}
                  onClick={() => onToggleEstado(item)}
                >
                  {Boolean(item.values.Activo) ? (
                    <X size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td colSpan={visibleFields.length + 1}>
                No se encontraron registros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
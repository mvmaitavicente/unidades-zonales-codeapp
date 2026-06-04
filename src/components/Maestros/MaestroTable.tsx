import type { MaestroConfig, MaestroItem } from "../../types/maestro.types";

type Props = {
  config: MaestroConfig;
  items: MaestroItem[];
  onEdit: (item: MaestroItem) => void;
  onToggleEstado: (item: MaestroItem) => void;
};

export default function MaestroTable({
  config,
  items,
  onEdit,
  onToggleEstado,
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
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.itemId}>
              {visibleFields.map((field) => {
                const value = item.values[field.key];

                return (
                  <td key={field.key}>
                    {field.type === "boolean"
                      ? Boolean(value)
                        ? "Activo"
                        : "Inactivo"
                      : String(value ?? "")}
                  </td>
                );
              })}

              <td>
                <div className="table-actions">
                  <button type="button" onClick={() => onEdit(item)}>
                    Editar
                  </button>

                  <button type="button" onClick={() => onToggleEstado(item)}>
                    {Boolean(item.values.Activo) ? "Inactivar" : "Activar"}
                  </button>
                </div>
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
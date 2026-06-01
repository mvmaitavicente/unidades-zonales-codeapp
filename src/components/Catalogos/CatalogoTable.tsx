import type { MedioCoordinacion } from "../../types/catalogo.types";

type Props = {
  data: MedioCoordinacion[];
  onEditar: (item: MedioCoordinacion) => void;
  onEliminar: (item: MedioCoordinacion) => void;
};

export default function CatalogoTable({ data, onEditar, onEliminar }: Props) {
  return (
    <table className="catalogo-table">
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {data.map((item) => (
          <tr key={item.ID}>
            <td>{item.Descripcion}</td>
            <td>{item.Activo ? "Sí" : "No"}</td>
            <td>
              <button className="btn-small" onClick={() => onEditar(item)}>
                Editar
              </button>

              <button className="btn-danger" onClick={() => onEliminar(item)}>
                Desactivar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
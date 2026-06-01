import { useEffect, useState } from "react";
import type { MedioCoordinacion } from "../../types/catalogo.types";

type Props = {
  itemEditando?: MedioCoordinacion | null;
  onGuardar: (data: {
    id?: number;
    codigo: string;
    descripcion: string;
    activo: boolean;
  }) => void;
  onCancelar: () => void;
};

export default function CatalogoForm({
  itemEditando,
  onGuardar,
  onCancelar,
}: Props) {
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    setCodigo(itemEditando?.Codigo ?? "");
    setDescripcion(itemEditando?.Descripcion ?? "");
    setActivo(itemEditando?.Activo ?? true);
  }, [itemEditando]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim() || !descripcion.trim()) {
      alert("Debe ingresar código y descripción.");
      return;
    }

    onGuardar({
      id: itemEditando?.ID,
      codigo: codigo.trim(),
      descripcion: descripcion.trim(),
      activo,
    });
  };

  return (
    <form className="catalogo-form" onSubmit={handleSubmit}>
      <h3>{itemEditando ? "Editar medio" : "Nuevo medio"}</h3>

      <label>Código</label>
      <input
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Ejemplo: 1"
      />

      <label>Descripción</label>
      <input
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Ejemplo: WhatsApp"
      />

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => setActivo(e.target.checked)}
        />
        Activo
      </label>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          Guardar
        </button>

        <button type="button" className="btn-secondary" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
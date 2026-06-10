import { Search, X } from "lucide-react";
import { useState } from "react";
import { SHAREPOINT_CONFIG } from "../../config/sharepoint.config";
import {
  buscarItemsListaConFiltros,
  type RawSharePointItem,
} from "../../services/maestro.service";

type Props = {
  onClose: () => void;
  onSelect: (local: RawSharePointItem) => void;
};

const LOCAL_ESCOLAR_SELECT_FIELDS = [
  "CodigoLocal",
  "NombreIE",
  "NombreUGEL",
  "Region",
  "Provincia",
  "Distrito",
  "Direccion",
];

export default function LocalEscolarSearchModal({ onClose, onSelect }: Props) {
  const [region, setRegion] = useState("");
  const [provincia, setProvincia] = useState("");
  const [distrito, setDistrito] = useState("");
  const [nombreIE, setNombreIE] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RawSharePointItem[]>([]);
  const [error, setError] = useState("");

  const buscar = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await buscarItemsListaConFiltros({
        listId: SHAREPOINT_CONFIG.lists.localEscolar,
        selectFields: LOCAL_ESCOLAR_SELECT_FIELDS,
        filtros: [
          {
            campo: "Region",
            valor: region.trim(),
            operador: "eq",
          },
          {
            campo: "Provincia",
            valor: provincia.trim(),
            operador: "eq",
          },
          {
            campo: "Distrito",
            valor: distrito.trim(),
            operador: "eq",
          },
          {
            campo: "NombreIE",
            valor: nombreIE.trim(),
            operador: "contains",
          },
        ],
        top: 20,
      });

      setItems(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron buscar locales escolares.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="maestro-modal">
        <div className="maestro-modal-header">
          <div>
            <h2>Buscar Local Escolar</h2>
            <p>Filtra por región, provincia, distrito o nombre de I.E.</p>
          </div>

          <button className="modal-close-button" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="maestro-modal-body">
          <div className="maestro-form-grid">
            <div className="form-field">
              <label>Región</label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Provincia</label>
              <input
                value={provincia}
                onChange={(e) => setProvincia(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Distrito</label>
              <input
                value={distrito}
                onChange={(e) => setDistrito(e.target.value)}
              />
            </div>

            <div className="form-field form-field-full">
              <label>Nombre de la Institución Educativa</label>
              <input
                value={nombreIE}
                onChange={(e) => setNombreIE(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={buscar} disabled={loading}>
              <Search size={16} />
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {error && <div className="catalogo-error">{error}</div>}

          <div className="catalogo-table-card" style={{ marginTop: 20 }}>
            <table className="catalogo-table">
              <thead>
                <tr>
                  <th>Código Local</th>
                  <th>Nombre I.E.</th>
                  <th>Región</th>
                  <th>Provincia</th>
                  <th>Distrito</th>
                  <th className="actions-column">Acción</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.itemId}>
                    <td>{String(item.values.CodigoLocal ?? "")}</td>
                    <td>
                      {String(item.values.NombreIE ?? "")}
                    </td>
                    <td>{String(item.values.Region ?? "")}</td>
                    <td>{String(item.values.Provincia ?? "")}</td>
                    <td>{String(item.values.Distrito ?? "")}</td>
                    <td className="actions-column">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => onSelect(item)}
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={6}>No hay resultados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
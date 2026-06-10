import { CheckCircle, ListChecks, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import LocalEscolarSearchModal from "../components/transacciones/LocalEscolarSearchModal";
import MaestroQuickCreateModal from "../components/transacciones/MaestroQuickCreateModal";
import { maestrosConfig } from "../config/maestros.config";
import { SHAREPOINT_CONFIG } from "../config/sharepoint.config";
import { transaccionesConfig } from "../config/transacciones.config";
import { useCatalogosGlobal } from "../hooks/useCatalogosGlobal";
import {
  buscarItemListaPorCampo,
  buscarMaestroPorDocumento,
  type RawSharePointItem,
} from "../services/maestro.service";
import { crearTransaccion } from "../services/transaccion.service";
import type { TransaccionFormData } from "../types/transaccion.types";

const LOCAL_ESCOLAR_SELECT_FIELDS = [
  "CodigoLocal",
  "NombreIE",
  "NombreUGEL",
  "Region",
  "Provincia",
  "Distrito",
  "Direccion",
];

const initialData: TransaccionFormData = {
  Asunto: "",
  Detalle: "",
  Observacion: "",
  MedioCoordinacion: "",
  FechaInicio: "",
  FechaFin: "",

  CodigoLocal: "",
  NombreIE: "",
  NombreUGEL: "",
  Region: "",
  Provincia: "",
  Distrito: "",
  Direccion: "",

  TipoDocIdentidadAutoridad: "",
  DocIdentidadAutoridad: "",
  NombresAutoridad: "",
  ApellidosAutoridad: "",
  TipoEntidadAutoridad: "",
  CargoAutoridad: "",
  CorreoAutoridad: "",

  TipoDocIdentidadRepresentante: "",
  DocIdentidadRepresentante: "",
  NombresRepresentante: "",
  ApellidosRepresentante: "",
  UnidadZonalRepresentante: "",
  CargoRepresentante: "",
  CorreoRepresentante: "",

  LinkInforme: "",
  NroExpedienteSGD: "",
};

export default function RegistroVisitasPage() {
  const { catalogos } = useCatalogosGlobal();
  const config = transaccionesConfig.visitaAutoridades;

  const [formData, setFormData] = useState<TransaccionFormData>(initialData);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [modalLocalOpen, setModalLocalOpen] = useState(false);
  const [modalCrear, setModalCrear] = useState<"personal" | "autoridades" | null>(
    null
  );

  const actualizarCampo = (key: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const aplicarLocalEscolar = (item: RawSharePointItem) => {
    setFormData((prev) => ({
      ...prev,
      CodigoLocal: String(item.values.CodigoLocal ?? ""),
      NombreIE: String(
        item.values.NombreIE ?? ""
      ),
      NombreUGEL: String(item.values.NombreUGEL ?? ""),
      Region: String(item.values.Region ?? ""),
      Provincia: String(item.values.Provincia ?? ""),
      Distrito: String(item.values.Distrito ?? ""),
      Direccion: String(item.values.Direccion ?? ""),
    }));

    setModalLocalOpen(false);
  };

  const buscarCodigoLocal = async () => {
    setError("");

    const codigoLocal = String(formData.CodigoLocal ?? "").trim();

    if (!codigoLocal) {
      setError("Ingrese el código local.");
      return;
    }

    const local = await buscarItemListaPorCampo({
      listId: SHAREPOINT_CONFIG.lists.localEscolar,
      campo: "CodigoLocal",
      valor: codigoLocal,
      selectFields: LOCAL_ESCOLAR_SELECT_FIELDS,
    });

    if (!local) {
      setError("No se encontró el código local.");
      return;
    }

    aplicarLocalEscolar(local);
  };

  const buscarRepresentante = async () => {
    setError("");

    const nroDocumento = String(formData.DocIdentidadRepresentante ?? "").trim();

    if (!nroDocumento) {
      setError("Ingrese el documento del representante PRONIED.");
      return;
    }

    const persona = await buscarMaestroPorDocumento({
      config: maestrosConfig.personal,
      nroDocumento,
    });

    if (!persona) {
      setError("No se encontró el personal. Puede registrarlo sin salir del formulario.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      TipoDocIdentidadRepresentante: String(
        persona.values.IdTipoDocIdentidad ?? ""
      ),
      DocIdentidadRepresentante: String(
        persona.values.NroDocumentoIdentidad ?? nroDocumento
      ),
      NombresRepresentante: String(persona.values.Nombres ?? ""),
      ApellidosRepresentante: String(persona.values.Apellidos ?? ""),
      UnidadZonalRepresentante: String(persona.values.IdUnidadZonal ?? ""),
      CargoRepresentante: String(persona.values.IdCargo ?? ""),
      CorreoRepresentante: String(persona.values.CorreoInstitucional ?? ""),
    }));
  };

  const buscarAutoridad = async () => {
    setError("");

    const nroDocumento = String(formData.DocIdentidadAutoridad ?? "").trim();

    if (!nroDocumento) {
      setError("Ingrese el documento de la autoridad.");
      return;
    }

    const autoridad = await buscarMaestroPorDocumento({
      config: maestrosConfig.autoridades,
      nroDocumento,
    });

    if (!autoridad) {
      setError("No se encontró la autoridad. Puede registrarla sin salir del formulario.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      TipoDocIdentidadAutoridad: String(
        autoridad.values.IdTipoDocIdentidad ??
          autoridad.values.TipoDocIdentidad ??
          ""
      ),
      DocIdentidadAutoridad: String(
        autoridad.values.NroDocumentoIdentidad ?? nroDocumento
      ),
      NombresAutoridad: String(autoridad.values.Nombres ?? ""),
      ApellidosAutoridad: String(autoridad.values.Apellidos ?? ""),
      TipoEntidadAutoridad: String(autoridad.values.TipoEntidad ?? ""),
      CargoAutoridad: String(autoridad.values.Cargo ?? ""),
      CorreoAutoridad: String(autoridad.values.Correo ?? ""),
    }));
  };

  const onCreatedMaestro = async (nroDocumento: string) => {
    if (modalCrear === "personal") {
      setFormData((prev) => ({
        ...prev,
        DocIdentidadRepresentante: nroDocumento,
      }));

      const persona = await buscarMaestroPorDocumento({
        config: maestrosConfig.personal,
        nroDocumento,
      });

      if (persona) {
        setFormData((prev) => ({
          ...prev,
          TipoDocIdentidadRepresentante: String(
            persona.values.IdTipoDocIdentidad ?? ""
          ),
          DocIdentidadRepresentante: String(
            persona.values.NroDocumentoIdentidad ?? nroDocumento
          ),
          NombresRepresentante: String(persona.values.Nombres ?? ""),
          ApellidosRepresentante: String(persona.values.Apellidos ?? ""),
          UnidadZonalRepresentante: String(persona.values.IdUnidadZonal ?? ""),
          CargoRepresentante: String(persona.values.IdCargo ?? ""),
          CorreoRepresentante: String(persona.values.CorreoInstitucional ?? ""),
        }));
      }
    }

    if (modalCrear === "autoridades") {
      setFormData((prev) => ({
        ...prev,
        DocIdentidadAutoridad: nroDocumento,
      }));

      const autoridad = await buscarMaestroPorDocumento({
        config: maestrosConfig.autoridades,
        nroDocumento,
      });

      if (autoridad) {
        setFormData((prev) => ({
          ...prev,
          TipoDocIdentidadAutoridad: String(
            autoridad.values.IdTipoDocIdentidad ??
              autoridad.values.TipoDocIdentidad ??
              ""
          ),
          DocIdentidadAutoridad: String(
            autoridad.values.NroDocumentoIdentidad ?? nroDocumento
          ),
          NombresAutoridad: String(autoridad.values.Nombres ?? ""),
          ApellidosAutoridad: String(autoridad.values.Apellidos ?? ""),
          TipoEntidadAutoridad: String(autoridad.values.TipoEntidad ?? ""),
          CargoAutoridad: String(autoridad.values.Cargo ?? ""),
          CorreoAutoridad: String(autoridad.values.Correo ?? ""),
        }));
      }
    }

    setModalCrear(null);
  };

  const validar = () => {
    if (!formData.Asunto) return "Ingrese el asunto.";
    if (!formData.Detalle) return "Ingrese el detalle.";
    if (!formData.MedioCoordinacion) {
      return "Seleccione el medio de coordinación.";
    }
    if (!formData.FechaInicio) return "Seleccione la fecha de inicio.";
    if (!formData.CodigoLocal) return "Ingrese o seleccione un código local.";
    if (!formData.DocIdentidadRepresentante) {
      return "Ingrese el documento del representante PRONIED.";
    }
    if (!formData.DocIdentidadAutoridad) {
      return "Ingrese el documento de la autoridad.";
    }

    return "";
  };

  const guardar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setMensaje("");
    setError("");

    const validacion = validar();

    if (validacion) {
      setError(validacion);
      return;
    }

    setSaving(true);

    try {
      const codigo = await crearTransaccion(config, formData);
      setMensaje(`Visita registrada correctamente. Código generado: ${codigo}`);
      setFormData(initialData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo guardar la visita.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-container">
      <div className="maestro-panel">
        <div className="maestro-header">
          <div>
            <h1>{config.titulo}</h1>
            <p>{config.descripcion}</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              window.location.hash = "/bandeja-visitas";
            }}
          >
            <ListChecks size={18} />
            Ver bandeja
          </button>
        </div>

        {(mensaje || error) && (
          <div style={{ padding: "18px 32px 0" }}>
            {mensaje && (
              <div className="status active" style={{ gap: 8 }}>
                <CheckCircle size={16} />
                {mensaje}
              </div>
            )}

            {error && <div className="catalogo-error">{error}</div>}
          </div>
        )}

        <div className="maestro-form-card" style={{ marginTop: 24 }}>
          <h2>Nuevo registro</h2>
          <p>Completa los datos de la visita.</p>

          <form className="transaccion-form" onSubmit={guardar}>
            <section className="transaccion-section">
              <div className="transaccion-section-title">
                <h3>Información de la Visita</h3>
              </div>

              <div className="transaccion-section-body">
                <div className="form-field">
                  <label>Asunto *</label>
                  <input
                    value={String(formData.Asunto ?? "")}
                    onChange={(e) => actualizarCampo("Asunto", e.target.value)}
                  />
                </div>

                <div className="form-field form-field-full">
                  <label>Detalle *</label>
                  <textarea
                    value={String(formData.Detalle ?? "")}
                    onChange={(e) => actualizarCampo("Detalle", e.target.value)}
                  />
                </div>

                <div className="form-field form-field-full">
                  <label>Observación</label>
                  <textarea
                    value={String(formData.Observacion ?? "")}
                    onChange={(e) =>
                      actualizarCampo("Observacion", e.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Medio de Coordinación *</label>
                  <select
                    value={String(formData.MedioCoordinacion ?? "")}
                    onChange={(e) =>
                      actualizarCampo(
                        "MedioCoordinacion",
                        e.target.value ? Number(e.target.value) : ""
                      )
                    }
                  >
                    <option value="">Seleccionar</option>
                    {catalogos.mediosCoordinacion.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Fecha Inicio *</label>
                  <input
                    type="date"
                    value={String(formData.FechaInicio ?? "")}
                    onChange={(e) =>
                      actualizarCampo("FechaInicio", e.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Fecha Fin</label>
                  <input
                    type="date"
                    value={String(formData.FechaFin ?? "")}
                    onChange={(e) => actualizarCampo("FechaFin", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="transaccion-section">
              <div className="transaccion-section-title">
                <h3>Información del Colegio</h3>
              </div>

              <div className="transaccion-section-body">
                <div className="form-field">
                  <label>Código Local *</label>
                  <input
                    value={String(formData.CodigoLocal ?? "")}
                    onChange={(e) => actualizarCampo("CodigoLocal", e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={buscarCodigoLocal}
                  >
                    <Search size={17} />
                    Buscar código
                  </button>
                </div>

                <div className="form-field">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setModalLocalOpen(true)}
                  >
                    <Search size={17} />
                    Buscar local escolar
                  </button>
                </div>

                {[
                  ["NombreIE", "Nombre de la Institución Educativa"],
                  ["NombreUGEL", "UGEL"],
                  ["Region", "Región"],
                  ["Provincia", "Provincia"],
                  ["Distrito", "Distrito"],
                  ["Direccion", "Dirección"],
                ].map(([key, label]) => (
                  <div className="form-field" key={key}>
                    <label>{label}</label>
                    <input value={String(formData[key] ?? "")} disabled readOnly />
                  </div>
                ))}
              </div>
            </section>

            <section className="transaccion-section">
              <div className="transaccion-section-title">
                <h3>Autoridad Visitante</h3>
              </div>

              <div className="transaccion-section-body">
                <div className="form-field">
                  <label>Nro. Documento *</label>
                  <input
                    value={String(formData.DocIdentidadAutoridad ?? "")}
                    onChange={(e) =>
                      actualizarCampo("DocIdentidadAutoridad", e.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={buscarAutoridad}
                  >
                    <Search size={17} />
                    Buscar autoridad
                  </button>
                </div>

                <div className="form-field">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setModalCrear("autoridades")}
                  >
                    <UserPlus size={17} />
                    Registrar autoridad
                  </button>
                </div>

                {[
                  ["NombresAutoridad", "Nombres"],
                  ["ApellidosAutoridad", "Apellidos"],
                  ["TipoEntidadAutoridad", "Tipo de Entidad"],
                  ["CargoAutoridad", "Cargo"],
                  ["CorreoAutoridad", "Correo"],
                ].map(([key, label]) => (
                  <div className="form-field" key={key}>
                    <label>{label}</label>
                    <input value={String(formData[key] ?? "")} disabled readOnly />
                  </div>
                ))}
              </div>
            </section>

            <section className="transaccion-section">
              <div className="transaccion-section-title">
                <h3>Representante PRONIED</h3>
              </div>

              <div className="transaccion-section-body">
                <div className="form-field">
                  <label>Nro. Documento *</label>
                  <input
                    value={String(formData.DocIdentidadRepresentante ?? "")}
                    onChange={(e) =>
                      actualizarCampo("DocIdentidadRepresentante", e.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={buscarRepresentante}
                  >
                    <Search size={17} />
                    Buscar personal
                  </button>
                </div>

                <div className="form-field">
                  <label>&nbsp;</label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setModalCrear("personal")}
                  >
                    <UserPlus size={17} />
                    Registrar personal
                  </button>
                </div>

                {[
                  ["NombresRepresentante", "Nombres"],
                  ["ApellidosRepresentante", "Apellidos"],
                  ["UnidadZonalRepresentante", "Unidad Zonal"],
                  ["CargoRepresentante", "Cargo"],
                  ["CorreoRepresentante", "Correo"],
                ].map(([key, label]) => (
                  <div className="form-field" key={key}>
                    <label>{label}</label>
                    <input value={String(formData[key] ?? "")} disabled readOnly />
                  </div>
                ))}
              </div>
            </section>

            <section className="transaccion-section">
              <div className="transaccion-section-title">
                <h3>Adicional</h3>
              </div>

              <div className="transaccion-section-body">
                <div className="form-field">
                  <label>Link informe</label>
                  <input
                    value={String(formData.LinkInforme ?? "")}
                    onChange={(e) =>
                      actualizarCampo("LinkInforme", e.target.value)
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Nro. Expediente SGD</label>
                  <input
                    value={String(formData.NroExpedienteSGD ?? "")}
                    onChange={(e) =>
                      actualizarCampo("NroExpedienteSGD", e.target.value)
                    }
                  />
                </div>
              </div>
            </section>

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar visita"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {modalLocalOpen && (
        <LocalEscolarSearchModal
          onClose={() => setModalLocalOpen(false)}
          onSelect={aplicarLocalEscolar}
        />
      )}

      {modalCrear && (
        <MaestroQuickCreateModal
          tipo={modalCrear}
          catalogos={catalogos}
          onClose={() => setModalCrear(null)}
          onCreated={onCreatedMaestro}
        />
      )}
    </section>
  );
}
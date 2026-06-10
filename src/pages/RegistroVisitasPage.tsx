import {
  CheckCircle,
  ClipboardList,
  GraduationCap,
  ListChecks,
  RotateCcw,
  Save,
  Search,
  UserPlus,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  const limpiarFormulario = () => {
    setFormData(initialData);
    setMensaje("");
    setError("");
  };

  const limpiarLocalEscolar = () => {
    setFormData((prev) => ({
      ...prev,
      CodigoLocal: "",
      NombreIE: "",
      NombreUGEL: "",
      Region: "",
      Provincia: "",
      Distrito: "",
      Direccion: "",
    }));
  };

  const limpiarAutoridad = () => {
    setFormData((prev) => ({
      ...prev,
      TipoDocIdentidadAutoridad: "",
      DocIdentidadAutoridad: "",
      NombresAutoridad: "",
      ApellidosAutoridad: "",
      TipoEntidadAutoridad: "",
      CargoAutoridad: "",
      CorreoAutoridad: "",
    }));
  };

  const limpiarRepresentante = () => {
    setFormData((prev) => ({
      ...prev,
      TipoDocIdentidadRepresentante: "",
      DocIdentidadRepresentante: "",
      NombresRepresentante: "",
      ApellidosRepresentante: "",
      UnidadZonalRepresentante: "",
      CargoRepresentante: "",
      CorreoRepresentante: "",
    }));
  };

  const aplicarLocalEscolar = (item: RawSharePointItem) => {
    setFormData((prev) => ({
      ...prev,
      CodigoLocal: String(item.values.CodigoLocal ?? ""),
      NombreIE: String(item.values.NombreIE ?? ""),
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
      setError("No se encontró el código local. Puede usar la búsqueda avanzada.");
      return;
    }

    aplicarLocalEscolar(local);
  };

  const aplicarRepresentante = (
    persona: Awaited<ReturnType<typeof buscarMaestroPorDocumento>>,
    nroDocumento: string
  ) => {
    if (!persona) return;

    setFormData((prev) => ({
      ...prev,
      TipoDocIdentidadRepresentante: persona.values.IdTipoDocIdentidadId ?? "",
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

    aplicarRepresentante(persona, nroDocumento);
  };

  const aplicarAutoridad = (
    autoridad: Awaited<ReturnType<typeof buscarMaestroPorDocumento>>,
    nroDocumento: string
  ) => {
    if (!autoridad) return;

    setFormData((prev) => ({
      ...prev,
      TipoDocIdentidadAutoridad:
        autoridad.values.TipoDocIdentidadId ??
        autoridad.values.IdTipoDocIdentidadId ??
        "",
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

    aplicarAutoridad(autoridad, nroDocumento);
  };

  const onCreatedMaestro = async (nroDocumento: string) => {
    if (modalCrear === "personal") {
      const persona = await buscarMaestroPorDocumento({
        config: maestrosConfig.personal,
        nroDocumento,
      });

      aplicarRepresentante(persona, nroDocumento);
    }

    if (modalCrear === "autoridades") {
      const autoridad = await buscarMaestroPorDocumento({
        config: maestrosConfig.autoridades,
        nroDocumento,
      });

      aplicarAutoridad(autoridad, nroDocumento);
    }

    setModalCrear(null);
  };

  const validar = () => {
    if (!formData.Asunto) return "Ingrese el asunto.";
    if (!formData.Detalle) return "Ingrese el detalle.";
    if (!formData.MedioCoordinacion) return "Seleccione el medio de coordinación.";
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
    <section className="page-content registro-visitas-page">
      <div className="registro-hero">
        <div>
          <h1>{config.titulo}</h1>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => navigate("/bandeja-visitas")}
        >
          <ListChecks size={18} />
          Ver bandeja de visitas
        </button>
      </div>

      <div className="registro-alert-card">
        <CheckCircle size={20} />
        <span>
          Completa los campos obligatorios (*) y utiliza las búsquedas para
          autocompletar información.
        </span>
      </div>

      {(mensaje || error) && (
        <div className="registro-message-zone">
          {mensaje && (
            <div className="status active" style={{ gap: 8 }}>
              <CheckCircle size={16} />
              {mensaje}
            </div>
          )}

          {error && <div className="catalogo-error">{error}</div>}
        </div>
      )}

      <form className="registro-form-shell" onSubmit={guardar}>
        <section className="registro-section-card section-visita">
          <div className="registro-section-header">
            <div className="registro-section-icon">
              <ClipboardList size={22} />
            </div>
            <div>
              <h2>Información de la Visita</h2>
              <p>Datos principales para identificar la coordinación.</p>
            </div>
          </div>

          <div className="visita-layout-excel">
            <div className="form-field visita-asunto">
              <label>Asunto *</label>
              <input
                value={String(formData.Asunto ?? "")}
                placeholder="Ingrese el asunto de la visita"
                onChange={(e) => actualizarCampo("Asunto", e.target.value)}
              />
            </div>

            <div className="form-field visita-fecha-inicio">
              <label>Fecha Inicio *</label>
              <input
                type="date"
                value={String(formData.FechaInicio ?? "")}
                onChange={(e) => actualizarCampo("FechaInicio", e.target.value)}
              />
            </div>

            <div className="form-field visita-fecha-fin">
              <label>Fecha Fin</label>
              <input
                type="date"
                value={String(formData.FechaFin ?? "")}
                onChange={(e) => actualizarCampo("FechaFin", e.target.value)}
              />
            </div>

            <div className="form-field visita-medio">
              <label>Medio Coordinación *</label>
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

            <div className="form-field visita-link">
              <label>Link Informe</label>
              <input
                value={String(formData.LinkInforme ?? "")}
                placeholder="https://..."
                onChange={(e) => actualizarCampo("LinkInforme", e.target.value)}
              />
            </div>

            <div className="form-field visita-expediente">
              <label>Nro. Expediente SGD</label>
              <input
                value={String(formData.NroExpedienteSGD ?? "")}
                placeholder="Ingrese número de expediente"
                onChange={(e) =>
                  actualizarCampo("NroExpedienteSGD", e.target.value)
                }
              />
            </div>

            <div className="form-field visita-detalle">
              <label>Detalle *</label>
              <textarea
                value={String(formData.Detalle ?? "")}
                placeholder="Describe el detalle de la visita realizada..."
                onChange={(e) => actualizarCampo("Detalle", e.target.value)}
              />
            </div>

            <div className="form-field visita-observacion">
              <label>Observación</label>
              <textarea
                value={String(formData.Observacion ?? "")}
                placeholder="Ingrese alguna observación adicional..."
                onChange={(e) => actualizarCampo("Observacion", e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="registro-section-card section-colegio">
          <div className="registro-section-header">
            <div className="registro-section-icon">
              <GraduationCap size={22} />
            </div>
            <div>
              <h2>Información del Colegio</h2>
              <p>Busca por código local o usa la búsqueda avanzada.</p>
            </div>
          </div>

          <div className="registro-form-grid cols-4">
            <div className="form-field">
              <label>Código Local *</label>
              <input
                value={String(formData.CodigoLocal ?? "")}
                placeholder="Ejemplo: 818553"
                onChange={(e) => actualizarCampo("CodigoLocal", e.target.value)}
              />
            </div>

            <div className="form-field form-action-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="primary-button soft-primary-button"
                onClick={buscarCodigoLocal}
              >
                <Search size={17} />
                Buscar
              </button>
            </div>

            <div className="form-field form-action-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setModalLocalOpen(true)}
              >
                <Search size={17} />
                Búsqueda avanzada
              </button>
            </div>

            <div className="form-field form-action-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="secondary-button icon-only-button"
                title="Limpiar Filtro"
                aria-label="Limpiar Filtro"
                onClick={limpiarLocalEscolar}
              >
                <XCircle size={17} />
                Limpiar
              </button>
            </div>
          </div>

        <div className="registro-form-grid colegio-info-grid">
          <div className="form-field colegio-nombre">
            <label>Nombre Institución Educativa</label>
            <input value={String(formData.NombreIE ?? "")} disabled readOnly />
          </div>

          <div className="form-field colegio-ugel">
            <label>UGEL</label>
            <input value={String(formData.NombreUGEL ?? "")} disabled readOnly />
          </div>

          <div className="form-field colegio-region">
            <label>Región</label>
            <input value={String(formData.Region ?? "")} disabled readOnly />
          </div>

          <div className="form-field colegio-provincia">
            <label>Provincia</label>
            <input value={String(formData.Provincia ?? "")} disabled readOnly />
          </div>

          <div className="form-field colegio-distrito">
            <label>Distrito</label>
            <input value={String(formData.Distrito ?? "")} disabled readOnly />
          </div>

          <div className="form-field colegio-direccion">
            <label>Dirección Institución Educativa</label>
            <input value={String(formData.Direccion ?? "")} disabled readOnly />
          </div>
        </div>
        </section>

        <section className="registro-section-card section-autoridad">
          <div className="registro-section-header">
            <div className="registro-section-icon">
              <UsersRound size={22} />
            </div>
            <div>
              <h2>Autoridad Visitante</h2>
              <p>Busca una autoridad registrada o créala sin salir del formulario.</p>
            </div>
          </div>

          <div className="registro-form-grid cols-4">
            <div className="form-field">
              <label>Nro. Documento *</label>
              <input
                value={String(formData.DocIdentidadAutoridad ?? "")}
                placeholder="Ingrese documento"
                onChange={(e) =>
                  actualizarCampo("DocIdentidadAutoridad", e.target.value)
                }
              />
            </div>

            <div className="form-field form-action-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="primary-button soft-primary-button"
                onClick={buscarAutoridad}
              >
                <Search size={17} />
                Buscar
              </button>
            </div>

            <div className="form-field form-action-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setModalCrear("autoridades")}
              >
                <UserPlus size={17} />
                Registrar
              </button>
            </div>

            <div className="form-field form-action-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="secondary-button icon-only-button"
                title="Limpiar Filtro"
                aria-label="Limpiar Filtro"
                onClick={limpiarAutoridad}
              >
                <XCircle size={17} />
                Limpiar
              </button>
            </div>
          </div>

          <div className="registro-form-grid autoridad-info-grid">
            <div className="form-field autoridad-nombres">
              <label>Nombres</label>
              <input value={String(formData.NombresAutoridad ?? "")} disabled readOnly />
            </div>

            <div className="form-field autoridad-apellidos">
              <label>Apellidos</label>
              <input value={String(formData.ApellidosAutoridad ?? "")} disabled readOnly />
            </div>

            <div className="form-field autoridad-tipo-entidad">
              <label>Tipo Entidad</label>
              <input value={String(formData.TipoEntidadAutoridad ?? "")} disabled readOnly />
            </div>

            <div className="form-field autoridad-cargo">
              <label>Cargo</label>
              <input value={String(formData.CargoAutoridad ?? "")} disabled readOnly />
            </div>

            <div className="form-field autoridad-correo">
              <label>Correo</label>
              <input value={String(formData.CorreoAutoridad ?? "")} disabled readOnly />
            </div>
          </div>
        </section>

        <section className="registro-section-card section-representante">
          <div className="registro-section-header">
            <div className="registro-section-icon">
              <UsersRound size={22} />
            </div>
            <div>
              <h2>Representante PRONIED</h2>
              <p>Identifica al servidor PRONIED que participó en la visita.</p>
            </div>
          </div>

          <div className="registro-form-grid cols-4">
            <div className="form-field">
              <label>Nro. Documento *</label>
              <input
                value={String(formData.DocIdentidadRepresentante ?? "")}
                placeholder="Ingrese documento"
                onChange={(e) =>
                  actualizarCampo("DocIdentidadRepresentante", e.target.value)
                }
              />
            </div>

            <div className="form-field form-action-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="primary-button soft-primary-button"
                onClick={buscarRepresentante}
              >
                <Search size={17} />
                Buscar
              </button>
            </div>

            <div className="form-field form-action-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setModalCrear("personal")}
              >
                <UserPlus size={17} />
                Registrar
              </button>
            </div>

            <div className="form-field form-action-field">
              <label>&nbsp;</label>
              <button
                type="button"
                className="secondary-button icon-only-button"
                title="Limpiar Filtro"
                aria-label="Limpiar Filtro"
                onClick={limpiarRepresentante}
              >
                <XCircle size={17} />
                Limpiar
              </button>
            </div>
          </div>

          <div className="registro-form-grid representante-info-grid">
            <div className="form-field representante-nombres">
              <label>Nombres</label>
              <input value={String(formData.NombresRepresentante ?? "")} disabled readOnly />
            </div>

            <div className="form-field representante-apellidos">
              <label>Apellidos</label>
              <input value={String(formData.ApellidosRepresentante ?? "")} disabled readOnly />
            </div>

            <div className="form-field representante-unidad">
              <label>Unidad Zonal</label>
              <input value={String(formData.UnidadZonalRepresentante ?? "")} disabled readOnly />
            </div>

            <div className="form-field representante-cargo">
              <label>Cargo</label>
              <input value={String(formData.CargoRepresentante ?? "")} disabled readOnly />
            </div>

            <div className="form-field representante-correo">
              <label>Correo</label>
              <input value={String(formData.CorreoRepresentante ?? "")} disabled readOnly />
            </div>
          </div>
        </section>

        <div className="registro-actions-bar">
          <button
            type="button"
            className="secondary-button"
            onClick={limpiarFormulario}
          >
            <RotateCcw size={17} />
            Limpiar formulario
          </button>

          <button type="submit" className="primary-button" disabled={saving}>
            <Save size={17} />
            {saving ? "Guardando..." : "Guardar visita"}
          </button>
        </div>
      </form>

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
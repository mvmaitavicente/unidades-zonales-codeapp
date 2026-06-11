import { ArrowRight, Database, RefreshCcw, Settings2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { catalogosConfig, type CatalogoKey } from "../../data/catalogos.config";

const catalogoDescripcion: Partial<Record<CatalogoKey, string>> = {
  "tipo-documento-identidad": "Documentos permitidos para personal, autoridades y registros.",
  cargo: "Cargos usados en maestros y transacciones del sistema.",
  "carrera-personal": "Carreras o grupos laborales del personal institucional.",
  "medio-coordinacion": "Canales usados para coordinar visitas y comunicaciones.",
  "tipo-entidad": "Tipos de entidades relacionadas a autoridades visitantes.",
  "unidad-zonal": "Unidades zonales PRONIED disponibles para asignación.",
  "modalidad-contratacion": "Modalidades contractuales usadas en el maestro de personal.",
};

export default function CatalogosGlobalesPage() {
  const catalogos = Object.entries(catalogosConfig) as Array<[
    CatalogoKey,
    (typeof catalogosConfig)[CatalogoKey]
  ]>;

  return (
    <div className="page-content">
      <section className="catalogos-hero">
        <div className="catalogos-hero-icon">
          <Database size={28} />
        </div>

        <div className="catalogos-hero-content">
          <span>Administración del sistema</span>
          <h1>Catálogos Globales</h1>
          <p>
            Administra las listas paramétricas que alimentan maestros,
            formularios y transacciones del Registro de Visitas.
          </p>
        </div>

        <div className="catalogos-hero-badge">
          <ShieldCheck size={18} />
          {catalogos.length} catálogos activos
        </div>
      </section>

      <section className="catalogos-summary-grid">
        <div className="catalogos-summary-card">
          <div>
            <span>Modelo</span>
            <strong>Paramétrico</strong>
          </div>
          <Settings2 size={24} />
        </div>

        <div className="catalogos-summary-card">
          <div>
            <span>Uso</span>
            <strong>Maestros y visitas</strong>
          </div>
          <Database size={24} />
        </div>

        <div className="catalogos-summary-card">
          <div>
            <span>Actualización</span>
            <strong>Administrable</strong>
          </div>
          <RefreshCcw size={24} />
        </div>
      </section>

      <section className="catalogos-hub-grid">
        {catalogos.map(([key, config]) => (
          <article className="catalogo-hub-card" key={key}>
            <div className="catalogo-hub-card-top">
              <div className="catalogo-hub-icon">
                <Database size={22} />
              </div>

              <span className="status active">Activo</span>
            </div>

            <h2>{config.titulo}</h2>
            <p>{catalogoDescripcion[key] ?? `Administración de ${config.listaSharePoint}.`}</p>

            <div className="catalogo-hub-meta">
              <span>Lista</span>
              <strong>{config.listaSharePoint}</strong>
            </div>

            <Link
              className="catalogo-hub-link"
              to={`/administracion/catalogos/${key}`}
            >
              Administrar
              <ArrowRight size={18} />
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}

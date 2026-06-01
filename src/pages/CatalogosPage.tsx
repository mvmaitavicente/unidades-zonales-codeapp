import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

import CatalogoForm from "../components/Catalogos/CatalogoForm";
import CatalogoTable from "../components/Catalogos/CatalogoTable";

import type { MedioCoordinacion } from "../types/catalogo.types";

import {
  cargarMediosCoordinacion,
  limpiarCacheMediosCoordinacion,
} from "../services/catalogo.service";

import { guardarCatalogo } from "../services/catalogo-admin.service";

export default function CatalogosPage() {
  const { instance, accounts } = useMsal();
  const user = accounts[0];

  const [medios, setMedios] = useState<MedioCoordinacion[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [itemEditando, setItemEditando] = useState<MedioCoordinacion | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargarData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const data = await cargarMediosCoordinacion(instance, user);
      setMedios(data);
    } catch (error) {
      console.error("Error cargando catálogo:", error);
      alert(
        error instanceof Error
          ? `Error cargando catálogo: ${error.message}`
          : "Error cargando catálogo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarData();
  }, [user]);

  const nuevo = () => {
    setItemEditando(null);
    setMostrarFormulario(true);
  };

  const editar = (item: MedioCoordinacion) => {
    setItemEditando(item);
    setMostrarFormulario(true);
  };

  const cancelar = () => {
    setItemEditando(null);
    setMostrarFormulario(false);
  };

  const guardar = async (data: {
    id?: number;
    codigo: string;
    descripcion: string;
    activo: boolean;
  }) => {
    if (!user) {
      alert("Debe iniciar sesión para guardar cambios.");
      return;
    }

    console.log("DATA FORMULARIO:", data);
    console.log("ITEM EDITANDO:", itemEditando);

    setGuardando(true);

    try {
      await guardarCatalogo(instance, user, {
        accion: itemEditando ? "actualizar" : "crear",
        id: data.id,
        codigo: data.codigo,
        descripcion: data.descripcion,
        activo: data.activo,
      });

      limpiarCacheMediosCoordinacion();
      await cargarData();

      setMostrarFormulario(false);
      setItemEditando(null);
    } catch (error) {
      console.error("Error guardando catálogo:", error);

      alert(
        error instanceof Error
          ? `Error guardando catálogo: ${error.message}`
          : "Error guardando catálogo."
      );
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (item: MedioCoordinacion) => {
    if (!user) {
      alert("Debe iniciar sesión para desactivar registros.");
      return;
    }

    const confirmar = confirm(
      `¿Deseas desactivar el medio "${item.Descripcion}"?`
    );

    if (!confirmar) return;

    setGuardando(true);

    try {
      await guardarCatalogo(instance, user, {
        accion: "eliminar",
        id: item.ID,
        codigo: item.Codigo,
        descripcion: item.Descripcion,
        activo: false,
      });

      limpiarCacheMediosCoordinacion();
      await cargarData();
    } catch (error) {
      console.error("Error desactivando catálogo:", error);

      alert(
        error instanceof Error
          ? `Error desactivando catálogo: ${error.message}`
          : "Error desactivando catálogo."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h2>Administración de catálogos</h2>
          <p>Catálogo: Medios de coordinación</p>
        </div>

        <button
          className="btn-primary"
          onClick={nuevo}
          disabled={loading || guardando}
        >
          Nuevo
        </button>
      </div>

      {loading && <p>Cargando catálogo...</p>}
      {guardando && <p>Guardando cambios...</p>}

      {mostrarFormulario && (
        <CatalogoForm
          itemEditando={itemEditando}
          onGuardar={guardar}
          onCancelar={cancelar}
        />
      )}

      <CatalogoTable data={medios} onEditar={editar} onEliminar={eliminar} />
    </div>
  );
}
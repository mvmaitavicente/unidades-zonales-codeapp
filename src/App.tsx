import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getClientInfo } from "./services/device.service";
import { cargarMediosCoordinacion } from "./services/catalogo.service";
import CatalogosPage from "./pages/CatalogosPage";
import type { ClientInfo } from "./types/usuario.types";
import type { MedioCoordinacion } from "./types/catalogo.types";
import "./styles/App.css";

function App() {
  const { instance, accounts } = useMsal();
  const user = accounts[0];

  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [medios, setMedios] = useState<MedioCoordinacion[]>([]);
  const [medioSeleccionado, setMedioSeleccionado] = useState("");

  useEffect(() => {
    async function loadInfo() {
      if (!user) return;

      const info = await getClientInfo(user);
      setClientInfo(info);

      const dataMedios = await cargarMediosCoordinacion(instance, user);
      setMedios(dataMedios);
    }

    loadInfo().catch(console.error);
  }, [user]);

  const login = async () => {
    await instance.loginRedirect({
      scopes: ["User.Read", "Sites.ReadWrite.All"],
    });
  };

  const medioActual = medios.find(
    (medio) => medio.Codigo === medioSeleccionado
  );

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">UNIDADES ZONALES APP</h1>
        <p className="subtitle">Datos capturados del usuario</p>

        {!user ? (
          <button className="button" onClick={login}>
            Iniciar sesión Microsoft
          </button>
        ) : (
          <>
            <div className="grid">
              <InfoItem
                label="NombreUsuario"
                value={clientInfo?.NombreUsuario}
              />
              <InfoItem
                label="CorreoUsuario"
                value={clientInfo?.CorreoUsuario}
              />
              <InfoItem label="IPPublica" value={clientInfo?.IPPublica} />
              <InfoItem label="Navegador" value={clientInfo?.Navegador} />
              <InfoItem
                label="SistemaOperativo"
                value={clientInfo?.SistemaOperativo}
              />

              <div className="item">
                <span className="label">Medio de coordinación</span>

                <select
                  className="select"
                  value={medioSeleccionado}
                  onChange={(e) => setMedioSeleccionado(e.target.value)}
                >
                  <option value="">Seleccione un medio</option>

                  {medios
                    .filter((medio) => medio.Activo)
                    .map((medio) => (
                      <option key={medio.ID} value={medio.Codigo}>
                        {medio.Descripcion}
                      </option>
                    ))}
                </select>

                {medioActual && (
                  <strong className="value">
                    Código seleccionado: {medioActual.Codigo}
                    <br />
                    Descripción: {medioActual.Descripcion}
                  </strong>
                )}
              </div>
            </div>

            <CatalogosPage />
          </>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="item">
      <span className="label">{label}</span>
      <strong className="value">{value || "Cargando..."}</strong>
    </div>
  );
}

export default App;
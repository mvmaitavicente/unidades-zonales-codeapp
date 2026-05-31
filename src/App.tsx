import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getClientInfo } from "./services/device.service";
import { getMediosCoordinacion } from "./services/sharepoint.service";
import type { MedioCoordinacion } from "./services/sharepoint.service";

type ClientInfo = {
  CorreoUsuario: string;
  NombreUsuario: string;
  IPPublica: string;
  Navegador: string;
  SistemaOperativo: string;
};

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

      const dataMedios = await getMediosCoordinacion(instance, user);
      setMedios(dataMedios);
    }

    loadInfo();
  }, [user, instance]);

  const login = async () => {
    await instance.loginRedirect({
      scopes: ["User.Read", "Sites.Read.All"]
    });
  };

  const medioActual = medios.find(
    (medio) => medio.IdMedio === medioSeleccionado
  );

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>UNIDADES ZONALES APP</h1>
        <p style={styles.subtitle}>Datos capturados del usuario</p>

        {!user ? (
          <button style={styles.button} onClick={login}>
            Iniciar sesión Microsoft
          </button>
        ) : (
          <div style={styles.grid}>
            <InfoItem label="NombreUsuario" value={clientInfo?.NombreUsuario} />
            <InfoItem label="CorreoUsuario" value={clientInfo?.CorreoUsuario} />
            <InfoItem label="IPPublica" value={clientInfo?.IPPublica} />
            <InfoItem label="Navegador" value={clientInfo?.Navegador} />
            <InfoItem
              label="SistemaOperativo"
              value={clientInfo?.SistemaOperativo}
            />

            <div style={styles.item}>
              <span style={styles.label}>Medio de coordinación</span>

              <select
                style={styles.select}
                value={medioSeleccionado}
                onChange={(e) => setMedioSeleccionado(e.target.value)}
              >
                <option value="">Seleccione un medio</option>

                {medios.map((medio) => (
                  <option key={medio.id} value={medio.IdMedio}>
                    {medio.DescripcionMedio}
                  </option>
                ))}
              </select>

              {medioActual && (
                <strong style={styles.value}>
                  Código seleccionado: {medioActual.IdMedio}
                </strong>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div style={styles.item}>
      <span style={styles.label}>{label}</span>
      <strong style={styles.value}>{value || "Cargando..."}</strong>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f3f5f7",
    padding: "40px",
    fontFamily: "Segoe UI, Arial, sans-serif",
  },
  card: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#1f2937",
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: "24px",
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  item: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "#6b7280",
    marginBottom: "6px",
  },
  value: {
    display: "block",
    fontSize: "16px",
    color: "#111827",
    wordBreak: "break-word",
    marginTop: "8px",
  },
  select: {
    width: "100%",
    height: "42px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    padding: "0 12px",
    fontSize: "15px",
    color: "#111827",
    background: "#ffffff",
  },
  button: {
    height: "44px",
    padding: "0 20px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default App;
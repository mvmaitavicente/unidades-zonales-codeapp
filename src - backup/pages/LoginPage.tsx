import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const { instance } = useMsal();

  const iniciarSesion = async () => {
    await instance.loginRedirect(loginRequest);
  };

  return (
    <main className="login-page">
      <section className="login-left">
        <div className="login-logo">
          <Building2 size={64} />
        </div>

        <h1>Sistema de Registro de Visitas</h1>

        <p>
          Plataforma institucional para registrar, consultar y dar seguimiento a
          las visitas de autoridades.
        </p>

        <span>© 2026 · Plataforma institucional</span>
      </section>

      <section className="login-right">
        <div className="login-card">
          <h2>Iniciar sesión</h2>
          <p>Accede con tu cuenta institucional de Microsoft.</p>

          <button className="login-button" onClick={iniciarSesion}>
            Iniciar sesión con Microsoft
          </button>
        </div>
      </section>
    </main>
  );
}
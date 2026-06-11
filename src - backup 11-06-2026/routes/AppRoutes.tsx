import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import RegistroVisitasPage from "../pages/RegistroVisitasPage";
import BandejaVisitasPage from "../pages/BandejaVisitasPage";
import CatalogosGlobalesPage from "../pages/Administracion/CatalogosGlobalesPage";
import CatalogosAdminPage from "../pages/Administracion/CatalogosAdminPage";
import MaestroAdminPage from "../pages/Maestros/MaestroAdminPage";
import ProtectedRoute from "../components/Layout/ProtectedRoute";
import { CatalogosGlobalProvider } from "../contexts/CatalogosGlobalContext";

function AuthenticatedRoutes() {
  return (
    <CatalogosGlobalProvider>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/registro-visitas" element={<RegistroVisitasPage />} />
          <Route path="/bandeja-visitas" element={<BandejaVisitasPage />} />

          <Route
            path="/administracion/catalogos"
            element={<CatalogosGlobalesPage />}
          />

          <Route
            path="/administracion/catalogos/:catalogoKey"
            element={<CatalogosAdminPage />}
          />

          <Route path="/maestros/:maestroKey" element={<MaestroAdminPage />} />

          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Route>
      </Routes>
    </CatalogosGlobalProvider>
  );
}

export default function AppRoutes() {
  const { instance } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accounts = instance.getAllAccounts();

    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [instance]);

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <AuthenticatedRoutes />
      ) : (
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

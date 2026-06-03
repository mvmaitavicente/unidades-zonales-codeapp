import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import RegistroVisitasPage from "../pages/RegistroVisitasPage";
import BandejaVisitasPage from "../pages/BandejaVisitasPage";
import CatalogosAdminPage from "../pages/Administracion/CatalogosAdminPage";
import AutoridadesPage from "../pages/Maestros/AutoridadesPage";
import PersonalPage from "../pages/Maestros/PersonalPage";
import EntidadesPage from "../pages/Maestros/EntidadesPage";
import ProtectedRoute from "../components/Layout/ProtectedRoute";

export default function AppRoutes() {
  return (
    <HashRouter>
      <UnauthenticatedTemplate>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<HomePage />} />
            <Route path="/registro-visitas" element={<RegistroVisitasPage />} />
            <Route path="/bandeja-visitas" element={<BandejaVisitasPage />} />
            <Route
              path="/administracion/catalogos/:catalogoKey"
              element={<CatalogosAdminPage />}
            />
            <Route path="/maestros/autoridades" element={<AutoridadesPage />} />
            <Route path="/maestros/personal" element={<PersonalPage />} />
            <Route path="/maestros/entidades" element={<EntidadesPage />} />

            <Route path="*" element={<Navigate to="/inicio" replace />} />
          </Route>
        </Routes>
      </AuthenticatedTemplate>
    </HashRouter>
  );
}
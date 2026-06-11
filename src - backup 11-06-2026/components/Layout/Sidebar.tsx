import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import {
  Building2,
  Home,
  ClipboardEdit,
  Inbox,
  Database,
  Landmark,
  UserRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
};

export default function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onCloseMobile,
}: SidebarProps) {
  const { instance } = useMsal();

  const [maestrosOpen, setMaestrosOpen] = useState(true);
  const [catalogosOpen, setCatalogosOpen] = useState(true);

  const cerrarSesion = () => {
    instance.logoutRedirect();
  };

  const closeMobileAfterClick = () => {
    onCloseMobile();
  };

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""} ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      <div>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Building2 size={22} />
          </div>

          {!collapsed && (
            <div className="brand-text">
              <strong>Registro de Visitas</strong>
              <span>Gestión institucional</span>
            </div>
          )}

          <button className="sidebar-toggle" onClick={onToggle} type="button">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            className="mobile-sidebar-close"
            onClick={onCloseMobile}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/inicio"
            className="nav-item"
            title="Inicio"
            onClick={closeMobileAfterClick}
          >
            <Home size={18} />
            {!collapsed && <span>Inicio</span>}
          </NavLink>

          <NavLink
            to="/registro-visitas"
            className="nav-item"
            title="Registro de Visitas"
            onClick={closeMobileAfterClick}
          >
            <ClipboardEdit size={18} />
            {!collapsed && <span>Registro de Visitas</span>}
          </NavLink>

          <NavLink
            to="/bandeja-visitas"
            className="nav-item"
            title="Bandeja de Visitas"
            onClick={closeMobileAfterClick}
          >
            <Inbox size={18} />
            {!collapsed && <span>Bandeja de Visitas</span>}
          </NavLink>

          {!collapsed && (
            <button
              type="button"
              className="nav-group-toggle"
              onClick={() => setMaestrosOpen(!maestrosOpen)}
            >
              <span>MAESTROS</span>
              <ChevronDown
                size={15}
                className={maestrosOpen ? "chevron open" : "chevron"}
              />
            </button>
          )}

          {(collapsed || maestrosOpen) && (
            <>
              <NavLink
                to="/maestros/autoridades"
                className="nav-item nav-subitem"
                title="Autoridades"
                onClick={closeMobileAfterClick}
              >
                <Landmark size={17} />
                {!collapsed && <span>Autoridades</span>}
              </NavLink>

              <NavLink
                to="/maestros/personal"
                className="nav-item nav-subitem"
                title="Personal"
                onClick={closeMobileAfterClick}
              >
                <UserRound size={17} />
                {!collapsed && <span>Personal</span>}
              </NavLink>
            </>
          )}

          {!collapsed && (
            <button
              type="button"
              className="nav-group-toggle"
              onClick={() => setCatalogosOpen(!catalogosOpen)}
            >
              <span>CATÁLOGOS</span>
              <ChevronDown
                size={15}
                className={catalogosOpen ? "chevron open" : "chevron"}
              />
            </button>
          )}

          {(collapsed || catalogosOpen) && (
            <NavLink
              to="/administracion/catalogos"
              className="nav-item nav-subitem"
              title="Catálogos Globales"
              onClick={closeMobileAfterClick}
            >
              <Database size={16} />
              {!collapsed && <span>Catálogos Globales</span>}
            </NavLink>
          )}
        </nav>
      </div>

      <button
        className="sidebar-logout"
        onClick={cerrarSesion}
        title="Cerrar sesión"
        type="button"
      >
        <LogOut size={18} />
        {!collapsed && <span>Cerrar sesión</span>}
      </button>
    </aside>
  );
}

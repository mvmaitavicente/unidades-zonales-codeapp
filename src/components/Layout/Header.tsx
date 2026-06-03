import { Bell, Menu, Search, UserCircle } from "lucide-react";
import { useMsal } from "@azure/msal-react";

type HeaderProps = {
  onOpenMobileSidebar: () => void;
};

export default function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { accounts } = useMsal();

  const account = accounts[0];
  const nombre = account?.name ?? "Usuario";
  const correo = account?.username ?? "";

  return (
    <header className="header">
      <button
        className="mobile-menu-button"
        onClick={onOpenMobileSidebar}
        type="button"
      >
        <Menu size={22} />
      </button>

      <div className="header-search">
        <Search size={18} />
        <span>Buscar en el sistema...</span>
      </div>

      <div className="header-actions">
        <button className="icon-button" type="button">
          <Bell size={20} />
        </button>

        <div className="user-profile">
          <UserCircle size={36} />
          <div>
            <strong>{nombre}</strong>
            <span>{correo}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
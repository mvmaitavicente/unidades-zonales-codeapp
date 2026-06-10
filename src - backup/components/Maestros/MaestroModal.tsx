import { X } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
};

export default function MaestroModal({
  title,
  subtitle,
  children,
  onClose,
}: Props) {
  return (
    <div className="modal-overlay">
      <div className="maestro-modal">
        <div className="maestro-modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="maestro-modal-body">{children}</div>
      </div>
    </div>
  );
}
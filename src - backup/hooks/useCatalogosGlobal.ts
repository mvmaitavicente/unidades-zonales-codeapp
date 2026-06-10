import { useContext } from "react";
import { CatalogosGlobalContext } from "../contexts/CatalogosGlobalContext";

export function useCatalogosGlobal() {
  const context = useContext(CatalogosGlobalContext);

  if (!context) {
    throw new Error(
      "useCatalogosGlobal debe usarse dentro de CatalogosGlobalProvider."
    );
  }

  return context;
}
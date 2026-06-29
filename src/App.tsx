import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        toast.dismiss();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={Infinity}
      />
      <AppRoutes />
    </>
  );
}

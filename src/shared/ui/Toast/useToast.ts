import { useContext } from "react";
import { ToastContext } from "./ToastContext";
import type { ToastContextValue } from "./toast.types";

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (context === null) {
    throw new Error("useToast doit être utilisé à l'intérieur de <ToastProvider>");
  }

  return context;
}

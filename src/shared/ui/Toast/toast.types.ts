export type ToastVariant = "info" | "success" | "error";

export type Toast = {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string | undefined;
};

export type ShowToastInput = {
  variant?: ToastVariant;
  title: string;
  message?: string | undefined;
};

export type ToastContextValue = {
  showToast: (input: ShowToastInput) => void;
  dismissToast: (id: string) => void;
};

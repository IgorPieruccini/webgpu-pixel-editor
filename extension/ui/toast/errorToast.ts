import "@kittl/ui/Toast";

const TOAST_ID = "extension-error-toast";
const DEFAULT_ERROR_MESSAGE = "Something went wrong";

const getToastElement = () => {
  if (typeof document === "undefined") {
    return null;
  }

  return document.getElementById(TOAST_ID) as
    | (HTMLElement & {
        status?: "success" | "error" | "warning";
        show: (duration?: number) => void;
      })
    | null;
};

export const getErrorMessage = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return fallback;
};

export const showErrorToast = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
) => {
  const toast = getToastElement();

  if (!toast) {
    return;
  }

  toast.textContent = getErrorMessage(error, fallback);
  toast.status = "error";
  toast.show();
};

export const showSuccessfulToast = (message: string) => {
  const toast = getToastElement();

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.status = "success";
  toast.show();
};

export const toastError = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
) => {
  showErrorToast(error, fallback);
  return error instanceof Error
    ? error
    : new Error(getErrorMessage(error, fallback));
};

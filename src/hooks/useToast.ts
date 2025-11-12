import { toast } from "sonner";

export const useToast = () => {
  return {
    // Success toast
    success: (message: string, description?: string) => {
      toast.success(message, {
        description,
        duration: 4000,
      });
    },

    // Error toast
    error: (message: string, description?: string) => {
      toast.error(message, {
        description,
        duration: 6000,
      });
    },

    // Warning toast
    warning: (message: string, description?: string) => {
      toast.warning(message, {
        description,
        duration: 5000,
      });
    },

    // Info toast
    info: (message: string, description?: string) => {
      toast.info(message, {
        description,
        duration: 4000,
      });
    },

    // Loading toast
    loading: (message: string) => {
      return toast.loading(message);
    },

    // Promise toast - useful for async operations
    promise: <T>(
      promise: Promise<T>,
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error | unknown) => string);
      }
    ) => {
      return toast.promise(promise, {
        loading,
        success,
        error,
      });
    },

    // Dismiss toast by id
    dismiss: (id?: string | number) => {
      toast.dismiss(id);
    },
  };
};

// Direct exports for convenience
export const showToast = {
  success: (message: string, description?: string) =>
    toast.success(message, { description, duration: 4000 }),

  error: (message: string, description?: string) =>
    toast.error(message, { description, duration: 6000 }),

  warning: (message: string, description?: string) =>
    toast.warning(message, { description, duration: 5000 }),

  info: (message: string, description?: string) =>
    toast.info(message, { description, duration: 4000 }),

  loading: (message: string) => toast.loading(message),

  dismiss: (id?: string | number) => toast.dismiss(id),
};

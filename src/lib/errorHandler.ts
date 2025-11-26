import axios, { AxiosError } from "axios";

/**
 * Extract detailed error message from API response
 * Handles various error response formats from the backend
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "Une erreur inconnue s'est produite";
  }

  // Handle axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      detail?: string;
      message?: string;
      error?: string;
      errors?: Record<string, unknown>;
      non_field_errors?: string[];
      [key: string]: unknown;
    }>;

    // Check for response data with error details
    if (axiosError.response?.data) {
      const data = axiosError.response.data;

      // Defensive checks for data properties
      if (data && typeof data === "object") {
        // Try to extract specific error message
        if (data.detail && typeof data.detail === "string") return data.detail;
        if (data.message && typeof data.message === "string") return data.message;
        if (data.error && typeof data.error === "string") return data.error;

        // Handle non_field_errors (common in Django REST)
        if (
          Array.isArray(data.non_field_errors) &&
          data.non_field_errors.length > 0
        ) {
          return data.non_field_errors.join(", ");
        }

        // Handle field-level errors (common in Django REST validation)
        if (data.errors && typeof data.errors === "object") {
          const fieldErrors = Object.entries(data.errors)
            .map(([field, messages]) => {
              const errorMsg = Array.isArray(messages)
                ? messages.join(", ")
                : String(messages);
              return `${field}: ${errorMsg}`;
            })
            .join(" | ");
          if (fieldErrors) return fieldErrors;
        }

        // Try to extract errors from the response data object itself
        // (handles cases where validation errors are directly in data object)
        const fieldMessages: string[] = [];
        for (const [key, value] of Object.entries(data)) {
          if (
            key !== "detail" &&
            key !== "message" &&
            key !== "error" &&
            key !== "errors" &&
            key !== "non_field_errors" &&
            value
          ) {
            const msg = Array.isArray(value) ? value.join(", ") : String(value);
            fieldMessages.push(`${key}: ${msg}`);
          }
        }
        if (fieldMessages.length > 0) {
          return fieldMessages.join(" | ");
        }
      }
    }

    // Fall back to HTTP status message if no data
    if (axiosError.message) {
      return axiosError.message;
    }

    // Map common HTTP status codes to user-friendly messages
    switch (axiosError.response?.status) {
      case 400:
        return "Requête invalide. Vérifiez vos données.";
      case 401:
        return "Non authentifié. Veuillez vous reconnecter.";
      case 403:
        return "Accès refusé. Vous n'avez pas les permissions nécessaires.";
      case 404:
        return "Ressource non trouvée.";
      case 409:
        return "Conflit. Cette ressource existe déjà ou a été modifiée.";
      case 500:
        return "Erreur serveur. Veuillez réessayer plus tard.";
      case 503:
        return "Service indisponible. Le serveur est actuellement hors ligne.";
      default:
        return `Erreur ${axiosError.response?.status || "réseau"}`;
    }
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || "Une erreur inconnue s'est produite";
  }

  // Fallback for unknown error types
  return String(error) || "Une erreur inconnue s'est produite";
}

/**
 * Extract error messages from validation errors
 * Specifically for handling Django REST Framework validation responses
 */
export function getValidationErrors(
  errorData: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, messages] of Object.entries(errorData)) {
    if (Array.isArray(messages)) {
      errors[field] = messages.join(", ");
    } else if (typeof messages === "string") {
      errors[field] = messages;
    } else if (typeof messages === "object" && messages !== null) {
      errors[field] = JSON.stringify(messages);
    }
  }

  return errors;
}

/**
 * Format error message for display in UI
 * Can be used with toast notifications or error alerts
 */
export function formatErrorForDisplay(error: unknown): {
  title: string;
  message: string;
} {
  const message = getErrorMessage(error);

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    let title = "Erreur";

    switch (true) {
      case status && status < 500 && status >= 400:
        title = "Erreur de validation";
        break;
      case status && status >= 500:
        title = "Erreur serveur";
        break;
      case error.code === "ECONNABORTED":
        title = "Délai d'attente dépassé";
        break;
      case !error.response:
        title = "Erreur de connexion";
        break;
    }

    return { title, message };
  }

  return { title: "Erreur", message };
}

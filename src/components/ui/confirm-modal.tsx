import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: {
      icon: "text-red-600",
      bg: "bg-red-50",
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      icon: "text-orange-600",
      bg: "bg-orange-50",
      button: "bg-orange-600 hover:bg-orange-700 text-white",
    },
    info: {
      icon: "text-blue-600",
      bg: "bg-blue-50",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div
          className={`p-4 ${styles.bg} rounded-lg flex items-start space-x-3`}
        >
          <AlertTriangle
            className={`h-6 w-6 ${styles.icon} flex-shrink-0 mt-0.5`}
          />
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? "Chargement..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

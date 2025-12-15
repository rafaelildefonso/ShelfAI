import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "../../index.css"; // Ensure Tailwind/CSS variables are available

export type ModalType = "alert" | "confirm" | "success" | "error" | "warning";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: ModalType;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  type = "alert",
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  isLoading = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (
      modalRef.current &&
      !modalRef.current.contains(e.target as Node) &&
      !isLoading
    ) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <i className="fa-solid fa-circle-check text-[var(--success-color)] text-4xl mb-4"></i>
        );
      case "error":
        return (
          <i className="fa-solid fa-circle-exclamation text-[var(--error-color)] text-4xl mb-4"></i>
        );
      case "warning":
        return (
          <i className="fa-solid fa-triangle-exclamation text-[var(--warning-color)] text-4xl mb-4"></i>
        );
      case "confirm":
        return (
          <i className="fa-solid fa-circle-question text-[var(--accent-color)] text-4xl mb-4"></i>
        );
      default:
        return (
          <i className="fa-solid fa-circle-info text-[var(--accent-color)] text-4xl mb-4"></i>
        );
    }
  };

  const isConfirmType = type === "confirm";

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="bg-[var(--surface-color)] rounded-xl shadow-2xl w-full max-w-md p-6 m-4 transform transition-all scale-100 animate-fadeIn border border-[var(--border-color)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {getIcon()}

          <h3 className="text-xl font-bold text-[var(--text-color)] mb-2">
            {title}
          </h3>

          <div className="text-[var(--text-secondary-color)] mb-6 text-sm leading-relaxed">
            {message}
          </div>

          <div className="flex gap-3 w-full justify-center">
            {isConfirmType && (
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary-color)] hover:bg-[var(--bg-color)] transition-colors font-medium text-sm flex-1 max-w-[120px] cursor-pointer"
              >
                {cancelText}
              </button>
            )}

            <button
              onClick={() => {
                if (onConfirm) {
                  onConfirm();
                } else {
                  onClose();
                }
              }}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg text-white font-medium text-sm flex-1 max-w-[120px] transition-all
                  ${
                    type === "error"
                      ? "bg-[var(--error-color)] hover:bg-red-600"
                      : "bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)]"
                  }
                  ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
                  shadow-md hover:shadow-lg cursor-pointer
              `}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Processando...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

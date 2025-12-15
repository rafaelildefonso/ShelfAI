import { useState, useCallback } from "react";
import { uploadImage } from "../services/fileService";
import Modal from "./common/Modal";
import type { ModalType } from "./common/Modal";

type ImageUploadProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  className?: string;
};

export const ImageUpload = ({
  value,
  onChange,
  label = "Upload Image",
  className = "",
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
  });

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const showModal = (
    type: ModalType,
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModalConfig({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
    });
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);
        const url = await uploadImage(file);
        onChange(url);
      } catch (error) {
        console.error("Error uploading image:", error);
        showModal(
          "error",
          "Erro no Upload",
          "Falha ao fazer upload da imagem. Por favor, tente novamente."
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleRemove = useCallback(() => {
    showModal(
      "confirm",
      "Remover Imagem",
      "Tem certeza que deseja remover esta imagem?",
      () => {
        onChange(null);
        closeModal();
      }
    );
  }, [onChange]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="flex items-center space-x-4">
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        <div className="flex-1">
          <label className="cursor-pointer">
            <span className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
              {isUploading
                ? "Uploading..."
                : value
                ? "Change Image"
                : "Upload Image"}
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            PNG, JPG, WebP up to 5MB
          </p>
        </div>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        confirmText="Sim, remover"
        cancelText="Cancelar"
      />
    </div>
  );
};

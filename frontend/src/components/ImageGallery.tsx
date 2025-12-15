import React from "react";
import { Reorder, AnimatePresence } from "framer-motion";

interface ImageGalleryProps {
  images: string[];
  onReorder: (newOrder: string[]) => void;
  onRemove: (index: number) => void;
  onAdd: (files: File[]) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onReorder,
  onRemove,
  onAdd,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const constraintsRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAdd(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAdd(Array.from(e.target.files));
    }
    // Reset input value to allow selecting same file again
    if (e.target) e.target.value = "";
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <div
          className={`cursor-pointer border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${
            isDragging
              ? "border-[var(--accent-color)] bg-[var(--bg-color)]"
              : "border-[var(--border-color)] hover:border-[var(--accent-color)]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInput}
          />
          <div
            className="w-12 h-12 mb-3"
            style={{ color: "var(--text-secondary-color)" }}
          >
            <i className="fa-solid fa-cloud-arrow-up text-4xl"></i>
          </div>
          <p
            className="font-medium mb-1"
            style={{ color: "var(--text-color)" }}
          >
            Arraste imagens ou clique para selecionar
          </p>
          <p
            className="text-sm"
            style={{ color: "var(--text-secondary-color)" }}
          >
            PNG, JPG ou WEBP (Max 5MB)
          </p>
        </div>
      </div>

      {/* 
           Correct way to use Reorder with Grid:
           Reorder.Group renders a component (default ul). We can style it.
        */}
      <Reorder.Group
        axis="y"
        as="div"
        ref={constraintsRef}
        values={images}
        onReorder={onReorder}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      >
        <AnimatePresence initial={false}>
          {images.map((image, index) => (
            <Reorder.Item
              layout
              key={image}
              value={image}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              className="relative aspect-square rounded-lg overflow-hidden group shadow-sm cursor-move touch-none"
              style={{ backgroundColor: "var(--surface-color)" }}
              whileDrag={{
                scale: 1.05,
                boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                zIndex: 10,
              }}
            >
              <img
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                  type="button"
                  title="Remover"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                {index + 1}
              </div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {images.length === 0 && (
        <div
          className="text-center py-8 rounded-lg border border-dashed"
          style={{
            color: "var(--text-secondary-color)",
            backgroundColor: "var(--bg-color)",
            borderColor: "var(--border-color)",
          }}
        >
          <p>Nenhuma imagem adicionada</p>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

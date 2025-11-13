import React, { useState, useRef } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { FaFileCsv, FaUpload, FaTimes, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminService } from '../services/adminService';

interface CategoryImportProps {
  onImportComplete: () => void;
  onClose: () => void;
}

interface CsvCategory {
  name: string;
  description: string;
  isValid: boolean;
  error?: string;
}

const CategoryImport: React.FC<CategoryImportProps> = ({ onImportComplete, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedCategories, setParsedCategories] = useState<CsvCategory[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateCategory = (category: any): CsvCategory => {
    if (!category.name || typeof category.name !== 'string' || category.name.trim() === '') {
      return { ...category, isValid: false, error: 'Nome é obrigatório' };
    }
    return { ...category, isValid: true };
  };

  const parseCSV = (text: string): CsvCategory[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('O arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    if (!headers.includes('name')) {
      throw new Error('O arquivo CSV deve conter a coluna "name"');
    }

    return lines.slice(1).map((line) => {
      const values = line.split(',').map(v => v.trim());
      const category: any = {};
      
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          category[header] = values[index];
        }
      });

      return validateCategory({
        name: category.name || '',
        description: category.description || '',
        isValid: false
      });
    });
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const categories = parseCSV(text);
        setParsedCategories(categories);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao processar o arquivo CSV');
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleImport = async () => {
    if (parsedCategories.length === 0 || parsedCategories.some(c => !c.isValid)) {
      toast.error('Por favor, corrija os erros antes de importar');
      return;
    }

    try {
      setIsLoading(true);
      const categoriesToImport = parsedCategories.map(({ name, description }) => ({
        name: name.trim(),
        description: description?.trim() || ''
      }));

      await adminService.bulkCreateDefaultCategories(categoriesToImport);
      toast.success(`${categoriesToImport.length} categorias importadas com sucesso!`);
      onImportComplete();
      onClose();
    } catch (error) {
      console.error('Error importing categories:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao importar categorias');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-[var(--text-color)] mb-2">Importar Categorias</h3>
        <p className="text-sm text-[var(--text-secondary-color)]">
          Faça upload de um arquivo CSV com as categorias. O arquivo deve conter as colunas "name" e "description".
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-[var(--accent-color)] bg-[var(--accent-color-hover)]/10' : 'border-[var(--border-color)]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".csv,text/csv"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
            <FaFileCsv className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-color)]">
              Arraste e solte o arquivo CSV aqui
            </p>
            <p className="text-xs text-[var(--text-secondary-color)] mt-1">
              ou clique para selecionar um arquivo
            </p>
          </div>
          <p className="text-xs text-[var(--text-secondary-color)]">
            Apenas arquivos CSV são aceitos
          </p>
        </div>
      </div>

      {parsedCategories.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-[var(--text-color)] mb-3">
            Pré-visualização ({parsedCategories.length} categorias)
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border-color)]">
              <thead className="bg-[var(--surface-color)]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[var(--text-secondary-color)] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bg-color)] divide-y divide-[var(--border-color)]">
                {parsedCategories.map((category, index) => (
                  <tr key={index} className={!category.isValid ? 'bg-[var(--error-color)/10]' : ''}>
                    <td className="px-4 py-2 text-sm text-[var(--text-color)]">
                      {category.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-[var(--text-secondary-color)]">
                      {category.description || '-'}
                    </td>
                    <td className="px-4 py-2">
                      {category.isValid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheck className="mr-1" /> Válido
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaTimes className="mr-1" /> {category.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--border-color)]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-[var(--text-color)] bg-[var(--surface-color)] rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-color)] transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={parsedCategories.length === 0 || parsedCategories.some(c => !c.isValid) || isLoading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center ${
            parsedCategories.length === 0 || parsedCategories.some(c => !c.isValid) || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] cursor-pointer'
          } transition-colors`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importando...
            </>
          ) : (
            <>
              <FaUpload className="mr-2" />
              Importar ({parsedCategories.filter(c => c.isValid).length}/{parsedCategories.length})
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CategoryImport;

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';

interface ValidationOptions {
  maxSize?: number; // em bytes
  allowedTypes?: string[];
  requiredFields?: string[];
}

export const validateImportFile = (options: ValidationOptions = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/octet-stream'],
    requiredFields = ['name', 'sku']
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = (req as any).file;

      if (!file) {
        throw new AppError('Arquivo não enviado', 400);
      }

      // Validar tamanho do arquivo
      if (file.size > maxSize) {
        throw new AppError(`Arquivo muito grande. Tamanho máximo permitido: ${Math.round(maxSize / 1024 / 1024)}MB`, 400);
      }

      // Validar tipo MIME
      if (!allowedTypes.includes(file.mimetype)) {
        throw new AppError(`Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`, 400);
      }

      // Validar extensão baseada no nome do arquivo
      const fileName = file.originalname.toLowerCase();
      const allowedExtensions = ['.csv', '.xlsx', '.xls'];
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        throw new AppError(`Extensão de arquivo não permitida. Extensões aceitas: ${allowedExtensions.join(', ')}`, 400);
      }

      // Armazenar informações do arquivo para uso posterior
      (req as any).fileInfo = {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        extension: fileName.split('.').pop(),
        requiredFields
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware para validar dados de mapeamento
export const validateMapping = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mapping } = req.body;

    if (!mapping) {
      throw new AppError('Mapeamento de colunas é obrigatório', 400);
    }

    let mappingObj: Record<string, string>;

    try {
      mappingObj = typeof mapping === 'string' ? JSON.parse(mapping) : mapping;
    } catch (error) {
      throw new AppError('Mapeamento deve ser um objeto JSON válido', 400);
    }

    if (typeof mappingObj !== 'object' || Array.isArray(mappingObj)) {
      throw new AppError('Mapeamento deve ser um objeto', 400);
    }

    // Validar se há pelo menos os campos obrigatórios mapeados
    const requiredProductFields = ['name', 'sku'];
    const mappedFields = Object.keys(mappingObj);

    const missingRequiredFields = requiredProductFields.filter(
      field => !mappedFields.includes(field) || !mappingObj[field]
    );

    if (missingRequiredFields.length > 0) {
      throw new AppError(`Campos obrigatórios não mapeados: ${missingRequiredFields.join(', ')}`, 400);
    }

    // Armazenar mapeamento validado
    (req as any).validatedMapping = mappingObj;

    next();
  } catch (error) {
    next(error);
  }
};

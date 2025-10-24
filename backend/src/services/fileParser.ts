import csv from 'csv-parser';
import fs from 'fs';
import { AppError } from '../utils/appError.js';

// @ts-ignore - Importação do xlsx
import XLSX from 'xlsx';

export interface ParsedRow {
  [key: string]: any;
}

export interface ParseResult {
  headers: string[];
  data: ParsedRow[];
  totalRows: number;
  errors: string[];
}

export class FileParser {
  static async parseCSV(filePath: string, delimiter: string = ','): Promise<ParseResult> {
    const results: ParsedRow[] = [];
    const errors: string[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({
          separator: delimiter,
          mapHeaders: ({ header }) => header.trim()
        }))
        .on('data', (data: ParsedRow) => {
          // Limpar dados e converter para string se necessário
          const cleanedData: ParsedRow = {};
          for (const [key, value] of Object.entries(data)) {
            cleanedData[key.trim()] = value;
          }
          results.push(cleanedData);
        })
        .on('end', () => {
          const headers = Object.keys(results[0] || {});
          resolve({
            headers,
            data: results,
            totalRows: results.length,
            errors
          });
        })
        .on('error', (error) => {
          reject(new AppError(`Erro ao processar CSV: ${error.message}`, 500));
        });
    });
  }

  static async parseExcel(filePath: string): Promise<ParseResult> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new AppError('Planilha não encontrada no arquivo Excel', 400);
      }

      const worksheet = workbook.Sheets[sheetName];

      // Tentar diferentes opções de parsing para melhor compatibilidade
      let jsonData: any[][];

      try {
        // Opção 1: header: 1 (primeira linha como headers)
        jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false,
          raw: false // Converte números e datas para string
        }) as any[][];
      } catch (error) {
        throw new AppError(`Erro ao processar planilha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 500);
      }

      if (!jsonData || jsonData.length === 0) {
        throw new AppError('Planilha vazia ou sem dados válidos', 400);
      }

      // Verificar se há dados na primeira linha
      if (!jsonData[0] || jsonData[0].length === 0) {
        throw new AppError('Primeira linha da planilha deve conter os cabeçalhos das colunas', 400);
      }

      // Primeira linha são os headers
      const headers = jsonData[0]
        .map((header: any) => String(header || '').trim())
        .filter((header: string) => header.length > 0); // Remove headers vazios

      if (headers.length === 0) {
        throw new AppError('Nenhum cabeçalho válido encontrado na planilha', 400);
      }

      // Restantes são os dados
      const data: ParsedRow[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length > 0) {
          const rowData: ParsedRow = {};

          // Preencher apenas com headers que existem
          headers.forEach((header, index) => {
            const value = row[index];
            if (value !== undefined && value !== null && value !== '') {
              rowData[header] = String(value).trim();
            } else {
              rowData[header] = '';
            }
          });

          // Só adicionar linha se houver pelo menos um campo preenchido
          const hasData = Object.values(rowData).some(value => value !== '');
          if (hasData) {
            data.push(rowData);
          }
        }
      }

      if (data.length === 0) {
        throw new AppError('Nenhum dado válido encontrado na planilha', 400);
      }

      return {
        headers,
        data,
        totalRows: data.length,
        errors: []
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new AppError(`Erro ao processar Excel: ${errorMessage}`, 500);
    }
  }

  static async parseFile(filePath: string, fileType: 'csv' | 'xlsx', delimiter?: string): Promise<ParseResult> {
    switch (fileType) {
      case 'csv':
        return this.parseCSV(filePath, delimiter);
      case 'xlsx':
        return this.parseExcel(filePath);
      default:
        throw new AppError('Tipo de arquivo não suportado', 400);
    }
  }

  static validateData(data: ParsedRow[], requiredFields: string[]): { validRows: ParsedRow[], errors: Array<{row: number, errors: string[]}> } {
    const validRows: ParsedRow[] = [];
    const errors: Array<{row: number, errors: string[]}> = [];

    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      const rowNumber = index + 1;

      // Verificar campos obrigatórios
      requiredFields.forEach(field => {
        if (!row[field] || String(row[field]).trim() === '') {
          rowErrors.push(`Campo obrigatório '${field}' está vazio`);
        }
      });

      // Verificar dados inválidos
      if (row.name && String(row.name).trim().length > 255) {
        rowErrors.push('Nome do produto muito longo (máximo 255 caracteres)');
      }

      if (row.sku && String(row.sku).trim().length > 100) {
        rowErrors.push('SKU muito longo (máximo 100 caracteres)');
      }

      if (row.price !== undefined && row.price !== '') {
        const price = parseFloat(String(row.price));
        if (isNaN(price) || price < 0) {
          rowErrors.push('Preço deve ser um número positivo');
        }
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, errors: rowErrors });
      } else {
        validRows.push(row);
      }
    });

    return { validRows, errors };
  }

  static transformData(data: ParsedRow[], mapping: Record<string, string>): ParsedRow[] {
    return data.map(row => {
      const transformedRow: ParsedRow = {};

      Object.entries(mapping).forEach(([productField, csvColumn]) => {
        if (row[csvColumn] !== undefined) {
          let value = row[csvColumn];

          // Converter tipos de dados
          if (productField === 'price' || productField === 'originalPrice' || productField === 'costPrice') {
            value = parseFloat(String(value)) || undefined;
          } else if (productField === 'featured' || productField === 'active') {
            value = Boolean(value);
          } else if (productField === 'tags' && typeof value === 'string') {
            value = value.split(',').map((tag: string) => tag.trim()).filter(Boolean);
          } else {
            value = String(value).trim() || undefined;
          }

          transformedRow[productField] = value;
        }
      });

      return transformedRow;
    });
  }
}

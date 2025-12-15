import { PRODUCT_FIELDS, type ProductField } from "../services/importService";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

/**
 * Converts a JSON object array to a CSV string.
 * @param jsonData Array of objects to convert
 * @param delimiter Delimiter character (default: ,)
 * @returns CSv string
 */
export const jsonToCsv = (jsonData: any[], delimiter: string = ","): string => {
  if (!jsonData || jsonData.length === 0) return "";

  const headers = Object.keys(jsonData[0]);
  const csvRows = [headers.join(delimiter)];

  for (const row of jsonData) {
    const values = headers.map((header) => {
      const val = row[header];
      const stringVal = val === null || val === undefined ? "" : String(val);
      // Escape quotes and wrap in quotes if necessary
      const escaped = stringVal.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(delimiter));
  }

  return csvRows.join("\n");
};

/**
 * Parses a JSON file and returns a CSV File object.
 * @param file JSON File to parse
 * @returns Promise resolving to a CSV File
 */
export const convertJsonFileToCsv = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);

        if (!Array.isArray(jsonData)) {
          throw new Error(
            "O arquivo JSON deve conter uma lista (array) de produtos."
          );
        }

        if (jsonData.length === 0) {
          throw new Error("O arquivo JSON está vazio.");
        }

        const csvContent = jsonToCsv(jsonData);
        const csvBlob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const csvFile = new File(
          [csvBlob],
          file.name.replace(/\.json$/i, ".csv"),
          {
            type: "text/csv",
            lastModified: Date.now(),
          }
        );

        resolve(csvFile);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsText(file);
  });
};

/**
 * Generates sample data based on available product fields
 */
const getSampleData = () => {
  return [
    {
      name: "Smartphone X Pro",
      description: "Smartphone de última geração com câmera 8K",
      price: 2999.9,
      originalPrice: 3499.9,
      costPrice: 1800.0,
      sku: "SM-X-PRO-128",
      category: "Eletrônicos",
      subcategory: "Smartphones",
      brand: "TechBrand",
      status: "active",
      weight: 0.18,
      length: 15,
      width: 7.5,
      height: 0.8,
      tags: "smartphone,5g,android",
      featured: true,
      active: true,
      image: "https://example.com/image1.jpg",
      stock: 50,
      minStock: 5,
      barcode: "7891234567890",
      model: "Pro 2024",
      color: "Preto",
      size: "128GB",
      material: "Alumínio",
      stockLocation: "A-12-3",
    },
    {
      name: "Camiseta Algodão Premium",
      description: "Camiseta 100% algodão, super confortável",
      price: 89.9,
      originalPrice: 119.9,
      costPrice: 25.0,
      sku: "TSH-COT-BLK-M",
      category: "Roupas",
      subcategory: "Camisetas",
      brand: "FashionWear",
      status: "active",
      weight: 0.2,
      length: 30,
      width: 25,
      height: 2,
      tags: "moda,verão,básico",
      featured: false,
      active: true,
      image: "",
      stock: 100,
      minStock: 10,
      barcode: "7891234567891",
      model: "Basic Fit",
      color: "Preto",
      size: "M",
      material: "Algodão",
      stockLocation: "B-05-1",
    },
  ];
};

/**
 * Generates and downloads a sample file for product import.
 * @param format 'csv' | 'xlsx' | 'json'
 */
export const downloadSampleFile = (format: "csv" | "xlsx" | "json") => {
  const data = getSampleData();
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `shelfai_import_template_${dateStr}`;

  if (format === "json") {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, `${filename}.json`);
  } else if (format === "csv") {
    // Generate CSV using our helper (or XLSX utils if preferred for robustness)
    const ws = XLSX.utils.json_to_sheet(data);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${filename}.csv`);
  } else {
    // Excel
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo Importação");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
};

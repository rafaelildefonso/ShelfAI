import type { Product } from "../types/productType";
import { productTemplates } from "../data/productTemplates";

/**
 * Encontra o melhor template correspondente baseado nos dados do produto
 */
function findBestMatchingTemplate(
  templateData: Record<string, any>,
  categoryName?: string
) {
  if (!templateData || Object.keys(templateData).length === 0) return null;

  const templateScores = productTemplates.map((t) => {
    const matchingFields = t.fields.filter(
      (field) => templateData[field.id] !== undefined
    );

    // Bônus se a categoria bater
    const categoryMatchBonus =
      categoryName && t.category === categoryName ? 100 : 0;

    return {
      template: t,
      score: matchingFields.length + categoryMatchBonus,
      rawScore: matchingFields.length,
    };
  });

  // Ordenar por score (maior primeiro) e pegar o melhor
  // Filtramos apenas se tiver pelo menos um campo correspondente (rawScore > 0)
  // OU se a categoria bater exatamente (categoryMatchBonus > 0)
  const bestMatch = templateScores
    .filter((t) => t.rawScore > 0 || t.score >= 100)
    .sort((a, b) => b.score - a.score)[0];

  return bestMatch?.template || null;
}

/**
 * Calcula o status de um produto baseado nos campos obrigatórios
 */
export function calculateProductStatus(
  product: Product
): "complete" | "incomplete" {
  // Campos básicos obrigatórios
  const hasRequiredBasicFields =
    product.name?.trim() &&
    product.sku?.trim() &&
    product.price &&
    product.price > 0 &&
    product.categoryId;

  // Se não tem campos básicos, é incompleto
  if (!hasRequiredBasicFields) {
    return "incomplete";
  }

  // Se tem templateData, verificar se os campos obrigatórios estão preenchidos
  if (product.templateData && Object.keys(product.templateData).length > 0) {
    const template = findBestMatchingTemplate(
      product.templateData,
      product.category?.name
    );

    if (template) {
      // Verificar se todos os campos obrigatórios do template estão preenchidos
      const requiredFields = template.fields.filter((f) => f.required);
      const allRequiredFieldsFilled = requiredFields.every((field) => {
        const value = product.templateData?.[field.id];
        return value !== undefined && value !== null && value !== "";
      });

      return allRequiredFieldsFilled ? "complete" : "incomplete";
    }
  }

  // Se não tem template mas tem campos básicos, é completo
  return "complete";
}

/**
 * Retorna um produto com o status recalculado
 */
export function getProductWithCorrectStatus(product: Product): Product {
  return {
    ...product,
    status: calculateProductStatus(product),
  };
}

/**
 * Retorna a lista de campos obrigatórios que estão faltando
 */
export function getMissingFields(product: Product): string[] {
  const missingFields: string[] = [];

  // Campos básicos
  if (!product.name?.trim()) missingFields.push("Nome do Produto");
  if (!product.sku?.trim()) missingFields.push("SKU");
  if (!product.price || product.price <= 0) missingFields.push("Preço");
  if (!product.categoryId) missingFields.push("Categoria");

  // Campos do template
  if (product.templateData && Object.keys(product.templateData).length > 0) {
    const template = findBestMatchingTemplate(
      product.templateData,
      product.category?.name
    );

    if (template) {
      template.fields.forEach((field) => {
        if (field.required) {
          const value = product.templateData?.[field.id];
          if (value === undefined || value === null || value === "") {
            missingFields.push(field.label);
          }
        }
      });
    }
  }

  return missingFields;
}

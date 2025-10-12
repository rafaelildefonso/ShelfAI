import { Request, Response, NextFunction } from 'express';
import { stringify } from 'csv-stringify';
import prisma from '../prisma/client';


type ExportFormat = 'csv' | 'excel' | 'shopify' | 'mercadolivre' | 'shopee' | 'amazon' | 'aliexpress';

interface ExportConfig {
  format: ExportFormat;
  fileName: string;
  mimeType: string;
  getHeaders: () => Array<{ key: string; header: string }>;
  transformData: (products: any[]) => any[];
}

const exportConfigs: Record<ExportFormat, Omit<ExportConfig, 'format'>> = {
  csv: {
    fileName: 'produtos_exportados.csv',
    mimeType: 'text/csv',
    getHeaders: () => [
      { key: 'name', header: 'Nome' },
      { key: 'description', header: 'Descrição' },
      { key: 'price', header: 'Preço' },
      { key: 'sku', header: 'SKU' },
      { key: 'status', header: 'Status' },
      { key: 'category', header: 'Categoria' },
      { key: 'tags', header: 'Tags' },
      { key: 'featured', header: 'Destaque' },
      { key: 'active', header: 'Ativo' },
    ],
    transformData: (products) => products.map(p => ({
      ...p,
      featured: p.featured ? 'Sim' : 'Não',
      active: p.active ? 'Sim' : 'Não',
      tags: Array.isArray(p.tags) ? p.tags.join(',') : p.tags || ''
    }))
  },
  excel: {
    fileName: 'produtos_exportados.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    getHeaders: () => [
      { key: 'name', header: 'Nome do Produto' },
      { key: 'description', header: 'Descrição' },
      { key: 'price', header: 'Preço' },
      { key: 'originalPrice', header: 'Preço Original' },
      { key: 'sku', header: 'SKU' },
      { key: 'barcode', header: 'Código de Barras' },
      { key: 'category', header: 'Categoria' },
      { key: 'brand', header: 'Marca' },
      { key: 'quantity', header: 'Quantidade' },
      { key: 'weight', header: 'Peso (kg)' },
      { key: 'status', header: 'Status' },
    ],
    transformData: (products) => products.map(p => ({
      ...p,
      price: p.price ? `R$ ${p.price.toFixed(2).replace('.', ',')}` : '',
      originalPrice: p.originalPrice ? `R$ ${p.originalPrice.toFixed(2).replace('.', ',')}` : '',
      weight: p.weight ? `${p.weight} kg` : '',
      status: p.status === 'complete' ? 'Completo' : 'Incompleto'
    }))
  },
  shopify: {
    fileName: 'produtos_shopify.csv',
    mimeType: 'text/csv',
    getHeaders: () => [
      { key: 'Handle', header: 'Handle' },
      { key: 'Title', header: 'Title' },
      { key: 'Body (HTML)', header: 'Body (HTML)' },
      { key: 'Vendor', header: 'Vendor' },
      { key: 'Product Category', header: 'Product Category' },
      { key: 'Type', header: 'Type' },
      { key: 'Tags', header: 'Tags' },
      { key: 'Published', header: 'Published' },
      { key: 'Option1 Name', header: 'Option1 Name' },
      { key: 'Option1 Value', header: 'Option1 Value' },
      { key: 'Variant SKU', header: 'Variant SKU' },
      { key: 'Variant Grams', header: 'Variant Grams' },
      { key: 'Variant Inventory Tracker', header: 'Variant Inventory Tracker' },
      { key: 'Variant Inventory Qty', header: 'Variant Inventory Qty' },
      { key: 'Variant Inventory Policy', header: 'Variant Inventory Policy' },
      { key: 'Variant Fulfillment Service', header: 'Variant Fulfillment Service' },
      { key: 'Variant Price', header: 'Variant Price' },
      { key: 'Variant Compare At Price', header: 'Variant Compare At Price' },
      { key: 'Variant Requires Shipping', header: 'Variant Requires Shipping' },
      { key: 'Variant Taxable', header: 'Variant Taxable' },
      { key: 'Variant Barcode', header: 'Variant Barcode' },
    ],
    transformData: (products) => products.map(p => ({
      'Handle': p.sku?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || '',
      'Title': p.name,
      'Body (HTML)': p.description || '',
      'Vendor': p.brand || '',
      'Product Category': p.category || '',
      'Type': p.category || 'Geral',
      'Tags': Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
      'Published': p.active ? 'true' : 'false',
      'Option1 Name': 'Title',
      'Option1 Value': 'Default Title',
      'Variant SKU': p.sku || '',
      'Variant Grams': p.weight ? (p.weight * 1000).toString() : '0',
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Qty': p.quantity || 0,
      'Variant Inventory Policy': 'deny',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': p.price ? p.price.toString() : '0.00',
      'Variant Compare At Price': p.originalPrice ? p.originalPrice.toString() : '',
      'Variant Requires Shipping': 'true',
      'Variant Taxable': 'true',
      'Variant Barcode': p.barcode || ''
    }))
  },
  mercadolivre: {
    fileName: 'produtos_mercadolivre.csv',
    mimeType: 'text/csv',
    getHeaders: () => [
      { key: 'Tipo de anúncio', header: 'Tipo de anúncio' },
      { key: 'Título', header: 'Título' },
      { key: 'Categoria', header: 'Categoria' },
      { key: 'Preço', header: 'Preço' },
      { key: 'Preço promocional', header: 'Preço promocional' },
      { key: 'Quantidade', header: 'Quantidade' },
      { key: 'Código', header: 'Código' },
      { key: 'Condição', header: 'Condição' },
      { key: 'Descrição', header: 'Descrição' },
      { key: 'Link para vídeo do YouTube', header: 'Link para vídeo do YouTube' },
      { key: 'Tags', header: 'Tags' },
      { key: 'Tipo de envio', header: 'Tipo de envio' },
      { key: 'Peso (kg)', header: 'Peso (kg)' },
      { key: 'Comprimento (cm)', header: 'Comprimento (cm)' },
      { key: 'Largura (cm)', header: 'Largura (cm)' },
      { key: 'Altura (cm)', header: 'Altura (cm)' },
    ],
    transformData: (products) => products.map(p => ({
      'Tipo de anúncio': 'Clássico',
      'Título': p.name,
      'Categoria': p.category || '',
      'Preço': p.price?.toString() || '0',
      'Preço promocional': p.originalPrice?.toString() || '',
      'Quantidade': p.quantity?.toString() || '1',
      'Código': p.sku || '',
      'Condição': 'Novo',
      'Descrição': p.description || '',
      'Link para vídeo do YouTube': '',
      'Tags': Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
      'Tipo de envio': 'Mercado Envios',
      'Peso (kg)': p.weight?.toString() || '0.5',
      'Comprimento (cm)': p.length?.toString() || '20',
      'Largura (cm)': p.width?.toString() || '15',
      'Altura (cm)': p.height?.toString() || '10'
    }))
  },
  shopee: {
    fileName: 'produtos_shopee.csv',
    mimeType: 'text/csv',
    getHeaders: () => [
      { key: 'product_name', header: 'Product Name' },
      { key: 'description', header: 'Description' },
      { key: 'category_id', header: 'Category ID' },
      { key: 'brand', header: 'Brand' },
      { key: 'price', header: 'Price' },
      { key: 'stock', header: 'Stock' },
      { key: 'sku', header: 'SKU' },
      { key: 'item_condition', header: 'Item Condition' },
      { key: 'weight', header: 'Weight (kg)' },
      { key: 'length', header: 'Length (cm)' },
      { key: 'width', header: 'Width (cm)' },
      { key: 'height', header: 'Height (cm)' },
      { key: 'days_to_ship', header: 'Days to Ship' },
      { key: 'wholesale', header: 'Wholesale' },
      { key: 'variation_sku', header: 'Variation SKU' },
      { key: 'variation_name', header: 'Variation Name' },
      { key: 'variation_price', header: 'Variation Price' },
      { key: 'variation_stock', header: 'Variation Stock' },
    ],
    transformData: (products) => products.map(p => ({
      'product_name': p.name,
      'description': p.description || '',
      'category_id': '', // Preencher com ID da categoria no Shopee
      'brand': p.brand || '',
      'price': p.price?.toString() || '0',
      'stock': p.quantity?.toString() || '0',
      'sku': p.sku || '',
      'item_condition': 'NEW',
      'weight': p.weight?.toString() || '0.5',
      'length': p.length?.toString() || '20',
      'width': p.width?.toString() || '15',
      'height': p.height?.toString() || '10',
      'days_to_ship': '3',
      'wholesale': '',
      'variation_sku': '',
      'variation_name': '',
      'variation_price': '',
      'variation_stock': ''
    }))
  },
  amazon: {
    fileName: 'produtos_amazon.txt',
    mimeType: 'text/plain',
    getHeaders: () => [
      { key: 'sku', header: 'sku' },
      { key: 'price', header: 'price' },
      { key: 'quantity', header: 'quantity' },
      { key: 'product-id', header: 'product-id' },
      { key: 'product-id-type', header: 'product-id-type' },
      { key: 'condition-type', header: 'condition-type' },
      { key: 'condition-note', header: 'condition-note' },
      { key: 'ASIN-hint', header: 'ASIN-hint' },
      { key: 'title', header: 'title' },
      { key: 'product-tax-code', header: 'product-tax-code' },
      { key: 'brand', header: 'brand' },
      { key: 'manufacturer', header: 'manufacturer' },
      { key: 'description', header: 'description' },
      { key: 'bullet_point1', header: 'bullet_point1' },
      { key: 'bullet_point2', header: 'bullet_point2' },
      { key: 'bullet_point3', header: 'bullet_point3' },
      { key: 'bullet_point4', header: 'bullet_point4' },
      { key: 'bullet_point5', header: 'bullet_point5' },
    ],
    transformData: (products) => products.map(p => ({
      'sku': p.sku || `SKU-${Math.random().toString(36).substr(2, 9)}`,
      'price': p.price?.toString() || '0',
      'quantity': p.quantity?.toString() || '0',
      'product-id': p.sku || '',
      'product-id-type': '4', // 4 = Não especificado
      'condition-type': 'New',
      'condition-note': 'Novo',
      'ASIN-hint': '',
      'title': p.name,
      'product-tax-code': 'A_GEN_NOTAX',
      'brand': p.brand || 'Marca do Produto',
      'manufacturer': p.brand || 'Fabricante do Produto',
      'description': p.description || '',
      'bullet_point1': '',
      'bullet_point2': '',
      'bullet_point3': '',
      'bullet_point4': '',
      'bullet_point5': ''
    }))
  },
  aliexpress: {
    fileName: 'produtos_aliexpress.csv',
    mimeType: 'text/csv',
    getHeaders: () => [
      { key: 'product_id', header: 'Product ID' },
      { key: 'product_name', header: 'Product Name' },
      { key: 'category_id', header: 'Category ID' },
      { key: 'product_price', header: 'Product Price' },
      { key: 'sale_price', header: 'Sale Price' },
      { key: 'product_weight', header: 'Product Weight (kg)' },
      { key: 'package_length', header: 'Package Length (cm)' },
      { key: 'package_width', header: 'Package Width (cm)' },
      { key: 'package_height', header: 'Package Height (cm)' },
      { key: 'package_weight', header: 'Package Weight (kg)' },
      { key: 'product_stock', header: 'Product Stock' },
      { key: 'product_description', header: 'Product Description' },
      { key: 'product_images', header: 'Product Images' },
      { key: 'product_variations', header: 'Product Variations' },
      { key: 'shipping_template', header: 'Shipping Template' },
      { key: 'product_status', header: 'Product Status' },
    ],
    transformData: (products) => products.map(p => ({
      'product_id': p.sku || `ALX-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      'product_name': p.name,
      'category_id': '', // Preencher com ID da categoria no AliExpress
      'product_price': p.originalPrice?.toString() || p.price ? (Number(p.price) * 1.2).toFixed(2) : '0',
      'sale_price': p.price?.toString() || '0',
      'product_weight': p.weight?.toString() || '0.5',
      'package_length': p.length?.toString() || '20',
      'package_width': p.width?.toString() || '15',
      'package_height': p.height?.toString() || '10',
      'package_weight': p.weight ? (Number(p.weight) * 1.1).toFixed(2) : '0.55',
      'product_stock': p.quantity?.toString() || '0',
      'product_description': p.description || '',
      'product_images': '',
      'product_variations': '',
      'shipping_template': 'Padrão',
      'product_status': p.active ? 'onSelling' : 'offline'
    }))
  }
};

export const exportController = {
  async exportProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { format = 'csv' } = req.query;
      const exportFormat = (format as string).toLowerCase() as ExportFormat;

      // Verificar se o formato é suportado
      if (!exportConfigs[exportFormat]) {
        return res.status(400).json({ 
          error: 'Formato de exportação não suportado',
          formats: Object.keys(exportConfigs)
        });
      }

      const config = {
        format: exportFormat,
        ...exportConfigs[exportFormat]
      };

      // Buscar produtos do banco de dados com os relacionamentos necessários
      const products = await prisma.product.findMany({
        include: { 
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      // Transformar os dados conforme o formato de exportação
      const transformedData = config.transformData(products);
      const headers = config.getHeaders();

      // Gerar o conteúdo do arquivo
      const fileContent = await new Promise<string>((resolve, reject) => {
        stringify(transformedData, {
          header: true,
          columns: headers,
          delimiter: ',',
          quoted: true,
          quoted_string: true,
        }, (err, output) => {
          if (err) {
            reject(err);
          } else {
            resolve(output);
          }
        });
      });

      // Configurar cabeçalhos da resposta
      res.setHeader('Content-Type', config.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename=${config.fileName}`);
      
      // Enviar o conteúdo do arquivo
      res.send(fileContent);

    } catch (err) {
      console.error('Erro ao exportar produtos:', err);
      next(err);
    }
  },

  // Rota para listar formatos de exportação disponíveis
  async getExportFormats(_req: Request, res: Response) {
    const formats = Object.entries(exportConfigs).map(([id, config]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      mimeType: config.mimeType,
      fileName: config.fileName
    }));

    res.json({ formats });
  }
};

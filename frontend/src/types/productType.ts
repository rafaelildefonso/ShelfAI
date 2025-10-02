export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  status: "complete" | "incomplete";
  image?: string;
  images?: string[];
  stock: number;
  minStock: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags: string[];
  rating?: number;
  reviewCount?: number;
  views: number;
  sales: number;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  active: boolean;
  templateData?: { [key: string]: any };
  // Novos campos para a página de detalhes
  model?: string;
  color?: string;
  size?: string;
  material?: string;
  stockLocation?: string;
  costPrice?: number;
  origin?: "manual" | "import";
  createdBy?: string;
  lastEditedBy?: string;
  marketplaceIntegrations?: { [key: string]: any }; // Ex: { shopee: { id: '123' }, mercadoLivre: { id: '456' } }
  internalNotes?: string;
};
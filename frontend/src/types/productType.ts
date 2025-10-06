export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  category?: Category;
  subcategory?: string;
  brand?: string;
  sku: string;
  status: "complete" | "incomplete";
  image?: string;
  images: string[];
  stock: number;
  minStock: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  tags: string[];
  rating?: number;
  reviewCount: number;
  views: number;
  sales: number;
  featured: boolean;
  active: boolean;
  model?: string;
  color?: string;
  size?: string;
  material?: string;
  stockLocation?: string;
  costPrice?: number;
  origin?: "manual" | "import";
  createdBy?: string;
  lastEditedBy?: string;
  marketplaceIntegrations?: any; // JSON
  internalNotes?: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  templateData?: { [key: string]: any };
}
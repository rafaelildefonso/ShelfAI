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
  description?: string;
  price?: number;
  originalPrice?: number;
  costPrice?: number;
  categoryId?: string;
  category?: Category;
  subcategory?: string;
  stock?: number;
  minStock?: number;
  brand?: string;
  sku?: string;
  status: "complete" | "incomplete";
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  tags: string[];
  featured: boolean;
  active: boolean;
  image?: string;
  images: string[];
  model?: string;
  color?: string;
  size?: string;
  material?: string;
  stockLocation?: string;
  origin?: string;
  createdBy?: string;
  lastEditedBy?: string;
  marketplaceIntegrations?: any; // JSON
  internalNotes?: string;
  rating?: number;
  reviewCount: number;
  views: number;
  sales: number;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  templateData?: { [key: string]: any };
}
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CurrencyInput from "react-currency-input-field";
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import "./../App.css";
import { getProductById } from "../services/productService";
import type { Category } from "../services/categoryService";
import { useCategories } from "../context/CategoryContext";
import { useProducts } from "../context/ProductContext";
import type { Product } from "../types/productType";
import CustomSelect from "../components/CustomSelect";

// Maximum allowed image size (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Utility function to compress images
const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
  // Check file size before processing
  if (file.size > MAX_IMAGE_SIZE) {
    return Promise.reject(new Error('Tamanho da imagem excede o limite de 5MB'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with specified quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  fields: TemplateField[];
}

interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "checkbox" | "file";
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [selectedTemplate, setSelectedTemplate] =
    useState<ProductTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(!isEditing);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { addProduct, editProduct } = useProducts();

  function handleAdd(product: Product) {
    addProduct(product);
  }
  function handleEdit(id: string, editedProduct: Product) {
    editProduct(id, editedProduct);
  }

  interface ProductFormData {
    id?: string;
    name: string;
    description: string;
    price: string;
    originalPrice?: string;
    costPrice?: string;
    categoryId: string;
    subcategory?: string;
    brand?: string;
    sku: string;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    tags: string[];
    images: string[];
    image?: string; // Adicionado campo image
    featured: boolean;
    active: boolean;
    status?: string; // Adicionado campo status
    model?: string;
    color?: string;
    size?: string;
    material?: string;
    stockLocation?: string;
    origin?: "manual" | "import";
    internalNotes?: string;
    templateData?: Record<string, any>;
    // Campos adicionais para compatibilidade
    reviewCount?: number;
    views?: number;
    sales?: number;
    rating?: number;
  }

  const [product, setProduct] = useState<ProductFormData>({
    // Identificação
    id: id || "",
    name: "",
    description: "",
    sku: "",
    
    // Preços
    price: "0",
    originalPrice: "0",
    costPrice: "0",
    
    // Categorização
    categoryId: "",
    subcategory: "",
    brand: "",
    tags: [],
    
    // Dimensões
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    
    // Mídia
    images: [],
    image: "",
    
    // Status e visibilidade
    featured: false,
    active: true,
    status: 'draft',
    
    // Dados adicionais
    model: "",
    color: "",
    size: "",
    material: "",
    stockLocation: "",
    origin: undefined,
    internalNotes: "",
    
    // Dados do template
    templateData: {},
    
    // Métricas
    reviewCount: 0,
    views: 0,
    sales: 0,
    rating: 0,
  });

  const { categories, addCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await addCategory({ 
        name: newCategoryName,
        isDefault: true
      });

      // Limpar o campo
      setNewCategoryName("");

      // Selecionar a nova categoria
      setProduct((prev) => ({
        ...prev,
        categoryId: newCategory.id,
      }));
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      // Se já existir uma categoria com o mesmo nome, apenas selecione-a
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === newCategoryName.toLowerCase()
      );
      
      if (existingCategory) {
        setProduct(prev => ({
          ...prev,
          categoryId: existingCategory.id
        }));
      }
    }
  };

  const [templateData, setTemplateData] = useState<{ [key: string]: any }>({});
  const LIMITS = {
    name: 100,
    description: 600,
    brand: 60,
    subcategory: 60,
    sku: 50,
    stockLocation: 100,
    tags: 200,
  } as const;

  const mainImageInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);

  const productTemplates: ProductTemplate[] = [
    {
      id: "clothing",
      name: "Roupas",
      category: "Vestuário",
      description: "Camisetas, calças, vestidos, blusas e acessórios de moda",
      icon: "fa-solid fa-shirt",
      fields: [
        {
          id: "size",
          name: "size",
          label: "Tamanho",
          type: "select",
          required: true,
          options: ["PP", "P", "M", "G", "GG", "XG", "XXG"],
        },
        {
          id: "color",
          name: "color",
          label: "Cor",
          type: "text",
          required: true,
          placeholder: "Ex: Azul, Vermelho, Preto",
        },
        {
          id: "material",
          name: "material",
          label: "Material",
          type: "text",
          required: true,
          placeholder: "Ex: 100% Algodão, Poliéster",
        },
        {
          id: "gender",
          name: "gender",
          label: "Gênero",
          type: "select",
          required: true,
          options: ["Masculino", "Feminino", "Unissex", "Infantil"],
        },
        {
          id: "season",
          name: "season",
          label: "Temporada",
          type: "select",
          required: false,
          options: ["Verão", "Inverno", "Primavera", "Outono", "Todas"],
        },
        {
          id: "care_instructions",
          name: "care_instructions",
          label: "Instruções de Cuidado",
          type: "textarea",
          required: false,
          placeholder: "Ex: Lavar à mão, Não usar alvejante",
        },
      ],
    },
    {
      id: "shoes",
      name: "Calçados",
      category: "Calçados",
      description: "Tênis, sapatos, sandálias e botas",
      icon: "fa-solid fa-shoe-prints",
      fields: [
        {
          id: "size",
          name: "size",
          label: "Numeração",
          type: "select",
          required: true,
          options: [
            "33",
            "34",
            "35",
            "36",
            "37",
            "38",
            "39",
            "40",
            "41",
            "42",
            "43",
            "44",
            "45",
            "46",
          ],
        },
        {
          id: "color",
          name: "color",
          label: "Cor",
          type: "text",
          required: true,
          placeholder: "Ex: Preto, Branco, Azul",
        },
        {
          id: "material",
          name: "material",
          label: "Material",
          type: "text",
          required: true,
          placeholder: "Ex: Couro, Tecido, Borracha",
        },
        {
          id: "heel_height",
          name: "heel_height",
          label: "Altura do Salto (cm)",
          type: "number",
          required: false,
          validation: { min: 0, max: 20 },
        },
        {
          id: "sole_type",
          name: "sole_type",
          label: "Tipo de Sola",
          type: "select",
          required: false,
          options: ["Borracha", "Couro", "EVA", "TPU", "Outros"],
        },
        {
          id: "closure_type",
          name: "closure_type",
          label: "Tipo de Fechamento",
          type: "select",
          required: false,
          options: ["Cadarço", "Velcro", "Zíper", "Elástico", "Sem fechamento"],
        },
      ],
    },
    {
      id: "electronics",
      name: "Eletrônicos",
      category: "Tecnologia",
      description: "Smartphones, notebooks, tablets e acessórios",
      icon: "fa-solid fa-laptop",
      fields: [
        {
          id: "brand",
          name: "brand",
          label: "Marca",
          type: "text",
          required: true,
          placeholder: "Ex: Samsung, Apple, LG",
        },
        {
          id: "model",
          name: "model",
          label: "Modelo",
          type: "text",
          required: true,
          placeholder: "Ex: Galaxy S23, iPhone 14",
        },
        {
          id: "color",
          name: "color",
          label: "Cor",
          type: "text",
          required: true,
          placeholder: "Ex: Preto, Branco, Azul",
        },
        {
          id: "storage",
          name: "storage",
          label: "Armazenamento",
          type: "select",
          required: false,
          options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
        },
        {
          id: "screen_size",
          name: "screen_size",
          label: "Tamanho da Tela (polegadas)",
          type: "number",
          required: false,
          validation: { min: 1, max: 100 },
        },
        {
          id: "warranty",
          name: "warranty",
          label: "Garantia (meses)",
          type: "number",
          required: false,
          validation: { min: 0, max: 60 },
        },
        {
          id: "operating_system",
          name: "operating_system",
          label: "Sistema Operacional",
          type: "text",
          required: false,
          placeholder: "Ex: Android, iOS, Windows",
        },
      ],
    },
    {
      id: "home",
      name: "Casa e Decoração",
      category: "Casa",
      description: "Móveis, decoração, utensílios domésticos",
      icon: "fa-solid fa-home",
      fields: [
        {
          id: "material",
          name: "material",
          label: "Material",
          type: "text",
          required: true,
          placeholder: "Ex: Madeira, Vidro, Metal, Plástico",
        },
        {
          id: "color",
          name: "color",
          label: "Cor",
          type: "text",
          required: true,
          placeholder: "Ex: Branco, Marrom, Preto",
        },
        {
          id: "dimensions",
          name: "dimensions",
          label: "Dimensões (L x A x P cm)",
          type: "text",
          required: false,
          placeholder: "Ex: 100 x 50 x 30",
        },
        {
          id: "weight",
          name: "weight",
          label: "Peso (kg)",
          type: "number",
          required: false,
          validation: { min: 0, max: 1000 },
        },
        {
          id: "assembly_required",
          name: "assembly_required",
          label: "Requer Montagem",
          type: "checkbox",
          required: false,
        },
        {
          id: "room_type",
          name: "room_type",
          label: "Tipo de Ambiente",
          type: "select",
          required: false,
          options: [
            "Sala",
            "Quarto",
            "Cozinha",
            "Banheiro",
            "Escritório",
            "Varanda",
            "Outros",
          ],
        },
      ],
    },
    {
      id: "sports",
      name: "Esportes",
      category: "Esportes",
      description: "Equipamentos esportivos, roupas de academia",
      icon: "fa-solid fa-dumbbell",
      fields: [
        {
          id: "sport_type",
          name: "sport_type",
          label: "Tipo de Esporte",
          type: "select",
          required: true,
          options: [
            "Futebol",
            "Basquete",
            "Tênis",
            "Corrida",
            "Musculação",
            "Yoga",
            "Natação",
            "Ciclismo",
            "Outros",
          ],
        },
        {
          id: "size",
          name: "size",
          label: "Tamanho",
          type: "select",
          required: false,
          options: ["P", "M", "G", "GG", "XG"],
        },
        {
          id: "color",
          name: "color",
          label: "Cor",
          type: "text",
          required: true,
          placeholder: "Ex: Preto, Azul, Vermelho",
        },
        {
          id: "material",
          name: "material",
          label: "Material",
          type: "text",
          required: false,
          placeholder: "Ex: Poliéster, Algodão, Neoprene",
        },
        {
          id: "gender",
          name: "gender",
          label: "Gênero",
          type: "select",
          required: false,
          options: ["Masculino", "Feminino", "Unissex"],
        },
        {
          id: "age_group",
          name: "age_group",
          label: "Faixa Etária",
          type: "select",
          required: false,
          options: ["Infantil", "Juvenil", "Adulto", "Sênior"],
        },
      ],
    },
    {
      id: "beauty",
      name: "Beleza e Cuidados",
      category: "Beleza",
      description: "Cosméticos, produtos de higiene, perfumes",
      icon: "fa-solid fa-spa",
      fields: [
        {
          id: "product_type",
          name: "product_type",
          label: "Tipo de Produto",
          type: "select",
          required: true,
          options: [
            "Maquiagem",
            "Skincare",
            "Cabelo",
            "Perfume",
            "Higiêne",
            "Outros",
          ],
        },
        {
          id: "skin_type",
          name: "skin_type",
          label: "Tipo de Pele",
          type: "select",
          required: false,
          options: ["Oleosa", "Seca", "Mista", "Sensível", "Normal", "Todas"],
        },
        {
          id: "volume",
          name: "volume",
          label: "Volume/Peso",
          type: "text",
          required: false,
          placeholder: "Ex: 50ml, 100g, 250ml",
        },
        {
          id: "color",
          name: "color",
          label: "Cor/Tom",
          type: "text",
          required: false,
          placeholder: "Ex: Rosa, Bege, Transparente",
        },
        {
          id: "fragrance",
          name: "fragrance",
          label: "Fragrância",
          type: "text",
          required: false,
          placeholder: "Ex: Floral, Cítrico, Amadeirado",
        },
        {
          id: "cruelty_free",
          name: "cruelty_free",
          label: "Cruelty Free",
          type: "checkbox",
          required: false,
        },
      ],
    },
  ];

  useEffect(() => {
    // As categorias já são carregadas pelo CategoryContext
    // Carregar produto se estiver editando
    if (isEditing && id) {
      const loadProduct = async () => {
        try {
          const editingProduct = await getProductById(id);
          
          // Extract and format product data with proper defaults
          const productData: ProductFormData = {
            // Basic info
            id: id || "",
            name: editingProduct.name || "",
            description: editingProduct.description || "",
            price: editingProduct.price?.toString() || "0",
            originalPrice: editingProduct.originalPrice?.toString() || "0",
            costPrice: editingProduct.costPrice?.toString() || "0",
            categoryId: editingProduct.category?.id || "",
            subcategory: editingProduct.subcategory || "",
            brand: editingProduct.brand || "",
            sku: editingProduct.sku || "",
            
            // Arrays and objects
            tags: editingProduct.tags || [],
            images: editingProduct.images || [],
            templateData: editingProduct.templateData || {},
            
            // Product details
            model: editingProduct.model || "",
            color: editingProduct.color || "",
            size: editingProduct.size || "",
            material: editingProduct.material || "",
            stockLocation: editingProduct.stockLocation || "",
            origin: editingProduct.origin as "manual" | "import" | undefined,
            internalNotes: editingProduct.internalNotes || "",
            
            // Measurements
            weight: editingProduct.weight || 0,
            length: editingProduct.length || 0,
            width: editingProduct.width || 0,
            height: editingProduct.height || 0,
            
            // Stats and metadata
            featured: editingProduct.featured || false,
            active: editingProduct.active !== undefined ? editingProduct.active : true,
            reviewCount: editingProduct.reviewCount || 0,
            views: editingProduct.views || 0,
            sales: editingProduct.sales || 0,
            rating: editingProduct.rating || 0
          };
          
          setProduct(productData);
          setTemplateData(editingProduct.templateData || {});

          const template = productTemplates.find(
            (t) => t.category === editingProduct.category?.name
          );
          if (template) {
            setSelectedTemplate(template);
            setShowTemplateSelector(false);
          }
        } catch (error) {
          console.error("Erro ao carregar produto:", error);
        }
      };
      loadProduct();
    }
  }, [id, isEditing]);

  const handleTemplateSelect = (template: ProductTemplate) => {
    setSelectedTemplate(template);

    // Encontrar a categoria correspondente
    const selectedCategory = categories.find(
      (cat: Category) => cat.name === template.category
    );

    if (selectedCategory) {
      setProduct((prev: ProductFormData) => ({
        ...prev,
        categoryId: selectedCategory.id,
      }));
    }

    setShowTemplateSelector(false);
    setTemplateData({});
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | 
    { target: { name: string; value: string | number | boolean | string[] } } | 
    { name: string; value: string | number | boolean | string[] }
  ) => {
    let name: string;
    let value: any;

    // Handle both direct value objects and React events
    if ('target' in e) {
      name = e.target.name;
      value = e.target.value;
    } else {
      name = e.name;
      value = e.value;
    }

    setProduct((prev: ProductFormData) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleTemplateFieldChange = (fieldId: string, value: any) => {
    setTemplateData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setProduct((prev: ProductFormData) => ({
      ...prev,
      tags,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!product.name.trim()) {
      newErrors.name = "Nome do produto é obrigatório";
    }

    // Validar preço - converter corretamente o formato brasileiro
    if (!product.price || product.price.trim() === "") {
      newErrors.price = "Preço é obrigatório";
    } else {
      const priceValue = parseFloat(
        product.price.replace(/\./g, "").replace(",", ".")
      );
      if (isNaN(priceValue) || priceValue <= 0) {
        newErrors.price = "Preço deve ser um valor positivo";
      }
    }

    if (!product.sku.trim()) {
      newErrors.sku = "SKU é obrigatório";
    }

    // Validar campos obrigatórios do template
    if (selectedTemplate) {
      selectedTemplate.fields.forEach((field) => {
        if (
          field.required &&
          (!templateData[field.id] || templateData[field.id] === "")
        ) {
          newErrors[`template_${field.id}`] = `${field.label} é obrigatório`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const prepareProductData = (formData: ProductFormData) => {
      // Convert currency values to numbers
      const priceValue = parseFloat(
        formData.price.replace(".", "").replace(",", ".")
      );
      const originalPriceValue = formData.originalPrice
        ? parseFloat(formData.originalPrice.replace(".", "").replace(",", "."))
        : undefined;
      const costPriceValue = formData.costPrice
        ? parseFloat(formData.costPrice.replace(".", "").replace(",", "."))
        : undefined;

      // If categoryId is a string (not a UUID), it's a default category name
      const categoryData = formData.categoryId && 
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(formData.categoryId)
          ? { categoryId: formData.categoryId }
          : { categoryId: formData.categoryId };

      return {
        ...formData,
        ...categoryData,
        price: priceValue,
        originalPrice: originalPriceValue,
        costPrice: costPriceValue,
        templateData: formData.templateData || {},
        images: formData.images || [],
        // Ensure numeric values are properly converted
        weight: formData.weight ? Number(formData.weight) : undefined,
        length: formData.length ? Number(formData.length) : undefined,
        width: formData.width ? Number(formData.width) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        // Set default values if not provided
        status: formData.status || 'draft',
        reviewCount: formData.reviewCount || 0,
        views: formData.views || 0,
        sales: formData.sales || 0,
        rating: formData.rating || 0,
        active: formData.active !== undefined ? formData.active : true,
        featured: formData.featured || false,
      };
    };

    try {
      if (isEditing && id) {
        await handleEdit(id, prepareProductData(product) as Product);
      } else {
        await handleAdd(prepareProductData(product) as Product);
      }
      navigate("/products");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      // Adicionar tratamento de erro para o usuário
    } finally {
      setIsLoading(false);
    }
  };

  const renderTemplateField = (field: TemplateField) => {
    const value = templateData[field.id] || "";
    const error = errors[`template_${field.id}`];
    const tplTextLimit = 100;
    const tplTextareaLimit = 400;

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className="form-group">
            <label htmlFor={field.id} className="form-label">
              {field.label}{" "}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="text"
              id={field.id}
              value={value}
              onChange={(e) =>
                handleTemplateFieldChange(field.id, e.target.value)
              }
              className={`form-input ${error ? "error" : ""}`}
              placeholder={field.placeholder}
              maxLength={tplTextLimit}
            />
            <div className={`char-counter ${String(value).length >= tplTextLimit ? "warning" : ""}`}>
              {String(value).length} / {tplTextLimit}
            </div>
            {error && <span className="error-text">{error}</span>}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="form-group">
            <label htmlFor={field.id} className="form-label">
              {field.label}{" "}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="number"
              id={field.id}
              value={value}
              onChange={(e) =>
                handleTemplateFieldChange(
                  field.id,
                  parseFloat(e.target.value) || 0
                )
              }
              className={`form-input ${error ? "error" : ""}`}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {error && <span className="error-text">{error}</span>}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="form-group">
            <label htmlFor={field.id} className="form-label">
              {field.label}{" "}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              id={field.id}
              value={value}
              onChange={(e) =>
                handleTemplateFieldChange(field.id, e.target.value)
              }
              className={`form-input ${error ? "error" : ""}`}
            >
              <option value="">Selecione...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <span className="error-text">{error}</span>}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="form-group">
            <label htmlFor={field.id} className="form-label">
              {field.label}{" "}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              id={field.id}
              value={value}
              onChange={(e) =>
                handleTemplateFieldChange(field.id, e.target.value)
              }
              className={`form-input ${error ? "error" : ""}`}
              placeholder={field.placeholder}
              rows={3}
              maxLength={tplTextareaLimit}
            />
            <div className={`char-counter ${String(value).length >= tplTextareaLimit ? "warning" : ""}`}>
              {String(value).length} / {tplTextareaLimit}
            </div>
            {error && <span className="error-text">{error}</span>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  handleTemplateFieldChange(field.id, e.target.checked)
                }
              />
              <span className="checkmark"></span>
              {field.label}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  if (showTemplateSelector) {
    return (
      <div>
        <Header />
        <SideBarMenu pageName="products" />
        <main className="app-main">
          <div className="product-form-container">
            <div className="form-header">
              <Link to="/products" className="back-btn">
                <i className="fa-solid fa-arrow-left"></i>
                Voltar
              </Link>
              <h1>Escolha um Template de Produto</h1>
              <p>
                Selecione o template que melhor se adequa ao seu produto para
                preenchimento automático dos campos
              </p>
            </div>

            <div className="templates-grid">
              {productTemplates.map((template) => (
                <div
                  key={template.id}
                  className="template-card"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="template-icon">
                    <i className={template.icon}></i>
                  </div>
                  <h3 className="template-name">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                  <div className="template-fields-count">
                    <i className="fa-solid fa-list"></i>
                    <span>{template.fields.length} campos específicos</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="template-actions">
              <button
                className="btn btn-outline"
                onClick={() => navigate("/products")}
              >
                Cancelar
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowTemplateSelector(false);
                }}
              >
                <i className="fa-solid fa-plus"></i>
                Criar sem Template
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleCurrencyChange = (value: string | undefined, field: string) => {
    // Remover caracteres não numéricos exceto vírgula e ponto
    const numericValue = value ? value.replace(/[^\d,.-]/g, "") : "";

    setProduct((prev) => ({
      ...prev,
      [field]: numericValue,
    }));

    // Limpar erro se existir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const readFilesAsDataUrls = (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    );
  };

  const handleDropMain = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(false);
    
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    
    // Only process the first file for main image
    const file = files[0];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, solte um arquivo de imagem válido');
      return;
    }
    
    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      alert('A imagem é muito grande. O tamanho máximo permitido é 5MB');
      return;
    }
    
    try {
      const compressedImage = await compressImage(file);
      setProduct((prev: ProductFormData) => ({ 
        ...prev, 
        image: compressedImage 
      }));
    } catch (error) {
      console.error('Error processing dropped image:', error);
      
      // Fallback to original if compression fails but size is acceptable
      if (file.size <= MAX_IMAGE_SIZE) {
        try {
          const [img] = await readFilesAsDataUrls([file]);
          setProduct((prev: ProductFormData) => ({ 
            ...prev, 
            image: img 
          }));
        } catch (readError) {
          console.error('Error reading file:', readError);
          alert('Erro ao processar a imagem. Por favor, tente novamente.');
        }
      } else {
        alert(error instanceof Error ? error.message : 'Erro ao processar a imagem');
      }
    }
  };

  const handleDropGallery = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGallery(false);
    
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    
    // Filter out non-image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      alert('Apenas arquivos de imagem são permitidos');
      return;
    }
    
    // Filter out oversized files
    const validFiles = imageFiles.filter(file => file.size <= MAX_IMAGE_SIZE);
    const oversizedFiles = imageFiles.filter(file => file.size > MAX_IMAGE_SIZE);
    
    if (oversizedFiles.length > 0) {
      alert(`${oversizedFiles.length} imagem(ns) excede(m) o tamanho máximo de 5MB e foram ignoradas`);
    }
    
    if (validFiles.length === 0) return;
    
    try {
      // Process valid images with compression
      const compressedImages = await Promise.all(
        validFiles.map(file => 
          compressImage(file).catch(error => {
            console.error('Error compressing image:', error);
            // Fallback to original if compression fails but size is acceptable
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = () => reject(error);
              reader.readAsDataURL(file);
            });
          })
        )
      );
      
      // Filter out any failed images
      const validImages = compressedImages.filter((img): img is string => img !== undefined);
      
      if (validImages.length > 0) {
        setProduct((prev: ProductFormData) => ({
          ...prev,
          images: [...(prev.images || []), ...validImages],
        }));
      }
    } catch (error) {
      console.error('Error processing dropped images:', error);
      
      // Fallback to original images if compression fails
      try {
        const originalImages = await readFilesAsDataUrls(validFiles);
        setProduct((prev: ProductFormData) => ({
          ...prev,
          images: [...(prev.images || []), ...originalImages],
        }));
      } catch (readError) {
        console.error('Error reading files:', readError);
        alert('Erro ao processar as imagens. Por favor, tente novamente.');
      }
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      alert('A imagem é muito grande. O tamanho máximo permitido é 5MB');
      return;
    }

    try {
      // Compress the image before setting it
      const compressedImage = await compressImage(file);
      setProduct((prev: ProductFormData) => ({
        ...prev,
        image: compressedImage,
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      alert(error instanceof Error ? error.message : 'Erro ao processar a imagem');
      
      // Fallback to original if compression fails but size is acceptable
      if (file.size <= MAX_IMAGE_SIZE) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProduct((prev: ProductFormData) => ({
            ...prev,
            image: reader.result as string,
          }));
        };
        reader.onerror = () => {
          alert('Erro ao ler o arquivo da imagem');
        };
        reader.readAsDataURL(file);
      }
    } finally {
      // Reset the input to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  // Handler para upload de múltiplas imagens
  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter out non-image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      alert('Apenas arquivos de imagem são permitidos');
      return;
    }

    // Check each file size
    const oversizedFiles = imageFiles.filter(file => file.size > MAX_IMAGE_SIZE);
    if (oversizedFiles.length > 0) {
      alert(`Algumas imagens excedem o tamanho máximo de 5MB`);
      return;
    }

    try {
      // Process images in parallel with compression
      const compressedImages = await Promise.all(
        imageFiles.map(file => 
          compressImage(file).catch(error => {
            console.error('Error compressing image:', error);
            // Fallback to original if compression fails but size is acceptable
            if (file.size <= MAX_IMAGE_SIZE) {
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error('Falha ao ler a imagem'));
                reader.readAsDataURL(file);
              });
            }
            return null;
          })
        )
      );
      
      // Filter out any null values from failed compressions
      const validImages = compressedImages.filter((img): img is string => img !== null);
      
      if (validImages.length > 0) {
        setProduct((prev: ProductFormData) => ({
          ...prev,
          images: [...(prev.images || []), ...validImages],
        }));
      }
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Ocorreu um erro ao processar as imagens');
    } finally {
      // Reset the input to allow selecting the same files again if needed
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  return (
    <div className="app-container">
      <Header />
      <SideBarMenu pageName="products" />
      <main className="app-main">
        <div className="product-form-container">
          <div className="form-header">
            <button className="back-btn" onClick={() => navigate("/products")}>
              <i className="fa-solid fa-arrow-left"></i>
              Voltar
            </button>
            <h1>{isEditing ? "Editar Produto" : "Adicionar Produto"}</h1>
            {selectedTemplate && (
              <div className="selected-template">
                <i className={selectedTemplate.icon}></i>
                <span>Template: {selectedTemplate.name}</span>
                <button
                  className="change-template-btn"
                  onClick={() => setShowTemplateSelector(true)}
                >
                  Alterar
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-sections">
              {/* Imagens */}
              <div className="form-section">
                <div className="section-header">
                  <h2>
                    <i className="fa-solid fa-image"></i>
                    Imagens
                  </h2>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Imagem Principal</label>
                    <div
                      className={`drop-area ${isDraggingMain ? "dragging" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingMain(true);
                      }}
                      onDragLeave={() => setIsDraggingMain(false)}
                      onDrop={handleDropMain}
                      onClick={() => mainImageInputRef.current?.click()}
                    >
                      <div className="drop-area-content">
                        <i className="fa-regular fa-image"></i>
                        <span>Arraste e solte ou clique para selecionar</span>
                        <small>PNG, JPG até 5MB</small>
                      </div>
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                    {product.image && (
                      <div className="image-preview">
                        <img src={product.image} alt="Imagem principal" />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Imagens Adicionais</label>
                    <div
                      className={`drop-area ${isDraggingGallery ? "dragging" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingGallery(true);
                      }}
                      onDragLeave={() => setIsDraggingGallery(false)}
                      onDrop={handleDropGallery}
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <div className="drop-area-content">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>Arraste e solte múltiplas imagens</span>
                        <small>PNG, JPG até 5MB</small>
                      </div>
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesUpload}
                        style={{ display: "none" }}
                      />
                    </div>
                    <div className="gallery-preview">
                      {product.images &&
                        product.images.map((img, idx) => (
                          <div className="thumb" key={idx}>
                            <img src={img} alt={`Imagem ${idx + 1}`} />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Básicas */}
              <div className="form-section">
                <div className="section-header">
                  <h2>
                    <i className="fa-solid fa-info-circle"></i>
                    Informações Básicas
                  </h2>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Nome do Produto <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={product.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? "error" : ""}`}
                      placeholder="Ex: Camiseta Premium Algodão"
                      maxLength={LIMITS.name}
                    />
                    <div className={`char-counter ${product.name.length >= LIMITS.name ? "warning" : ""}`}>
                      {product.name.length} / {LIMITS.name}
                    </div>
                    {errors.name && (
                      <span className="error-text">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="sku" className="form-label">
                      SKU <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={product.sku}
                      onChange={handleInputChange}
                      className={`form-input ${errors.sku ? "error" : ""}`}
                      placeholder="Ex: CAMP-001"
                      maxLength={LIMITS.sku}
                    />
                    <div className={`char-counter ${product.sku.length >= LIMITS.sku ? "warning" : ""}`}>
                      {product.sku.length} / {LIMITS.sku}
                    </div>
                    {errors.sku && (
                      <span className="error-text">{errors.sku}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Descrição
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={product.description}
                    onChange={handleInputChange}
                    className={`form-input ${
                      errors.description ? "error" : ""
                    }`}
                    placeholder="Descreva o produto em detalhes..."
                    rows={4}
                    maxLength={LIMITS.description}
                  />
                  <div className={`char-counter ${product.description.length >= LIMITS.description ? "warning" : ""}`}>
                    {product.description.length} / {LIMITS.description}
                  </div>
                  {errors.description && (
                    <span className="error-text">{errors.description}</span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="brand" className="form-label">
                      Marca
                    </label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={product.brand}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ex: Nike, Adidas, Apple"
                      maxLength={LIMITS.brand}
                    />
                    <div className={`char-counter ${product.brand && product.brand.length >= LIMITS.brand ? "warning" : ""}`}>
                      {(product.brand || "").length} / {LIMITS.brand}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subcategory" className="form-label">
                      Subcategoria
                    </label>
                    <input
                      type="text"
                      id="subcategory"
                      name="subcategory"
                      value={product.subcategory}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ex: Camisetas, Tênis, Smartphones"
                      maxLength={LIMITS.subcategory}
                    />
                    <div className={`char-counter ${product.subcategory && product.subcategory.length >= LIMITS.subcategory ? "warning" : ""}`}>
                      {(product.subcategory || "").length} / {LIMITS.subcategory}
                    </div>
                  </div>
                </div>
              </div>

              {/* Categoria */}
              <div className="form-section">
                <div className="section-header">
                  <h2>
                    <i className="fa-solid fa-tags"></i>
                    Categoria
                  </h2>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="categoryId" className="form-label">
                      Categoria <span className="required">*</span>
                    </label>
                    <CustomSelect
                      value={product.categoryId}
                      onChange={(value) => {
                        setProduct(prev => ({
                          ...prev,
                          categoryId: value
                        }));
                        
                        // Clear error if exists
                        if (errors.categoryId) {
                          setErrors(prev => ({
                            ...prev,
                            categoryId: ''
                          }));
                        }
                      }}
                      placeholder="Selecione uma categoria"
                      searchPlaceholder="Pesquisar categorias..."
                      showSearch={true}
                      maxHeight="300px"
                      options={(() => {
                        // Separate default and user categories
                        const defaultCategories = categories
                          .filter(cat => cat.isDefault)
                          .map(cat => ({
                            value: cat.id,
                            label: cat.name,
                            group: 'Categorias Padrão',
                            isDefault: true
                          }));

                        const userCategories = categories
                          .filter(cat => !cat.isDefault)
                          .map(cat => ({
                            value: cat.id,
                            label: cat.name,
                            group: 'Minhas Categorias',
                            isDefault: false
                          }));

                        // Show user categories first, then default categories
                        return [
                          ...userCategories,
                          ...defaultCategories
                        ];
                      })()}
                    />
                    {errors.categoryId && (
                      <span className="error-text">{errors.categoryId}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="newCategory" className="form-label">
                      Nova Categoria
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="newCategory"
                        placeholder="Digite o nome da nova categoria"
                        className="form-input"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        maxLength={60}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos do Template */}
              {selectedTemplate && (
                <div className="form-section">
                  <div className="section-header">
                    <h2>
                      <i className={selectedTemplate.icon}></i>
                      Informações Específicas - {selectedTemplate.name}
                    </h2>
                  </div>
                  <div className="template-fields">
                    {selectedTemplate.fields.map((field) =>
                      renderTemplateField(field)
                    )}
                  </div>
                </div>
              )}

              {/* Preços e Estoque */}
              <div className="form-section">
                <div className="section-header">
                  <h2>
                    <i className="fa-solid fa-dollar-sign"></i>
                    Preços e Estoque
                  </h2>
                </div>
                <div className="form-row">
                  {/* Preço de Venda */}
                  <div className="form-group">
                    <label htmlFor="price" className="form-label">
                      Preço de Venda <span className="required">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-prefix">R$</span>
                      <CurrencyInput
                        id="price"
                        name="price"
                        value={product.price}
                        onValueChange={(value) =>
                          handleCurrencyChange(value, "price")
                        }
                        allowDecimals={true}
                        decimalSeparator=","
                        groupSeparator="."
                        decimalsLimit={2}
                        className={`form-input ${errors.price ? "error" : ""}`}
                        placeholder="0,00"
                      />
                    </div>
                    {errors.price && (
                      <span className="error-text">{errors.price}</span>
                    )}
                  </div>

                  {/* Preço Original */}
                  <div className="form-group">
                    <label htmlFor="originalPrice" className="form-label">
                      Preço Original
                    </label>
                    <div className="input-group">
                      <span className="input-prefix">R$</span>
                      <CurrencyInput
                        id="originalPrice"
                        name="originalPrice"
                        value={product.originalPrice}
                        onValueChange={(value) =>
                          handleCurrencyChange(value, "originalPrice")
                        }
                        allowDecimals={true}
                        decimalSeparator=","
                        groupSeparator="."
                        decimalsLimit={2}
                        className="form-input"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  {/* Preço de Custo */}
                  <div className="form-group">
                    <label htmlFor="costPrice" className="form-label">
                      Preço de Custo
                    </label>
                    <div className="input-group">
                      <span className="input-prefix">R$</span>
                      <CurrencyInput
                        id="costPrice"
                        name="costPrice"
                        value={product.costPrice || 0}
                        onValueChange={(value) =>
                          handleCurrencyChange(value, "costPrice")
                        }
                        allowDecimals={true}
                        decimalSeparator=","
                        groupSeparator="."
                        decimalsLimit={2}
                        className="form-input"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  {/* Localização do Estoque */}
                  <div className="form-group">
                    <label htmlFor="stockLocation" className="form-label">
                      Localização do Estoque
                    </label>
                    <input
                      type="text"
                      id="stockLocation"
                      name="stockLocation"
                      value={product.stockLocation || ""}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ex: Depósito A, Prateleira 5"
                      maxLength={LIMITS.stockLocation}
                    />
                    <div className={`char-counter ${product.stockLocation && (product.stockLocation as string).length >= LIMITS.stockLocation ? "warning" : ""}`}>
                      {(product.stockLocation || "").length} / {LIMITS.stockLocation}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensões e Peso */}
              <div className="form-section">
                <div className="section-header">
                  <h2>
                    <i className="fa-solid fa-ruler"></i>
                    Dimensões e Peso
                  </h2>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="weight" className="form-label">
                      Peso (kg)
                    </label>
                    <div className="input-group">
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={product.weight}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="0,00"
                        step="0.01"
                        min="0"
                      />
                      <span className="input-suffix">kg</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dimensões (cm)</label>
                    <div className="dimensions-inputs">
                      <input
                        type="number"
                        placeholder="L"
                        value={product.length || ""}
                        onChange={(e) =>
                          setProduct((prev) => ({
                            ...prev,
                            length: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        className="form-input"
                        min="0"
                        step="0.01"
                      />
                      <span>×</span>
                      <input
                        type="number"
                        placeholder="A"
                        value={product.width || ""}
                        onChange={(e) =>
                          setProduct((prev) => ({
                            ...prev,
                            width: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        className="form-input"
                        min="0"
                        step="0.01"
                      />
                      <span>×</span>
                      <input
                        type="number"
                        placeholder="P"
                        value={product.height || ""}
                        onChange={(e) =>
                          setProduct((prev) => ({
                            ...prev,
                            height: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          }))
                        }
                        className="form-input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags e Configurações */}
              <div className="form-section">
                <div className="section-header">
                  <h2>
                    <i className="fa-solid fa-tags"></i>
                    Tags e Configurações
                  </h2>
                </div>
                <div className="form-group">
                  <label htmlFor="tags" className="form-label">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={product.tags.join(", ")}
                    onChange={handleTagsChange}
                    className="form-input"
                    placeholder="Ex: algodão, premium, confortável (separadas por vírgula)"
                    maxLength={LIMITS.tags}
                  />
                  <div className="form-help">
                    Separe as tags por vírgula. Ex: algodão, premium,
                    confortável
                  </div>
                  <div className={`char-counter ${product.tags.join(", ").length >= LIMITS.tags ? "warning" : ""}`}>
                    {product.tags.join(", ").length} / {LIMITS.tags}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={product.featured}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Produto em Destaque
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="active"
                        checked={product.active}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Produto Ativo
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate("/products")}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Salvando...
                  </>
                ) : isEditing ? (
                  "Atualizar Produto"
                ) : (
                  "Criar Produto"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProductFormPage;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CurrencyInput from 'react-currency-input-field';
import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import "./../App.css";
import { getProductById, getCategories } from "../services/productService";
import { useProducts } from "../context/ProductContext";
import type { Product } from "../types/productType";

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
    price: number;
    originalPrice?: number;
    categoryId: string;
    subcategory?: string;
    brand?: string;
    sku: string;
    stock: number;
    minStock: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    tags: string[];
    images: string[];
    image?: string; // Adicionado campo image
    featured: boolean;
    active: boolean;
    model?: string;
    color?: string;
    size?: string;
    material?: string;
    stockLocation?: string;
    costPrice?: number;
    origin?: 'manual' | 'import';
    internalNotes?: string;
    templateData?: Record<string, any>;
    // Campos adicionais para compatibilidade
    reviewCount?: number;
    views?: number;
    sales?: number;
    rating?: number;
  }

  const [product, setProduct] = useState<ProductFormData>({
    id,
    name: "",
    description: "",
    price: 0,
    originalPrice: undefined,
    categoryId: "",
    subcategory: "",
    brand: "",
    sku: "",
    stock: 0,
    minStock: 0,
    tags: [],
    images: [],
    featured: false,
    active: true,
    templateData: {},
  });

  interface Category {
    id: string;
    name: string;
    description?: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);

  const [templateData, setTemplateData] = useState<{ [key: string]: any }>({});

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
    // Carregar categorias
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        // Transform the string array into Category objects
        const categories = response.data.map((name: string, index: number) => ({
          id: `cat-${index}`,  // Generate an ID if not provided
          name: name
        }));
        setCategories(categories);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };

    loadCategories();
    // Carregar produto se estiver editando
    if (isEditing && id) {
      const loadProduct = async () => {
        try {
          const editingProduct = await getProductById(id);
          const productData: ProductFormData = {
            ...editingProduct,
            categoryId: editingProduct.category?.id || "",
            images: editingProduct.images || [],
            templateData: editingProduct.templateData || {},
            // Garantir que todos os campos obrigatórios estejam presentes
            name: editingProduct.name || "",
            description: editingProduct.description || "",
            price: editingProduct.price || 0,
            sku: editingProduct.sku || "",
            stock: editingProduct.stock || 0,
            minStock: editingProduct.minStock || 0,
            tags: editingProduct.tags || [],
            featured: editingProduct.featured || false,
            active: editingProduct.active !== undefined ? editingProduct.active : true,
            // Inicializar campos opcionais
            originalPrice: editingProduct.originalPrice,
            subcategory: editingProduct.subcategory,
            brand: editingProduct.brand,
            weight: editingProduct.weight,
            length: editingProduct.length,
            width: editingProduct.width,
            height: editingProduct.height,
            model: editingProduct.model,
            color: editingProduct.color,
            size: editingProduct.size,
            material: editingProduct.material,
            stockLocation: editingProduct.stockLocation,
            costPrice: editingProduct.costPrice,
            origin: editingProduct.origin as 'manual' | 'import' | undefined,
            internalNotes: editingProduct.internalNotes,
            // Campos de compatibilidade
            reviewCount: editingProduct.reviewCount,
            views: editingProduct.views,
            sales: editingProduct.sales,
            rating: editingProduct.rating,
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
    const selectedCategory = categories.find(cat => cat.name === template.category);
    
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setProduct((prev: ProductFormData) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "number") {
      setProduct((prev: ProductFormData) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setProduct((prev: ProductFormData) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
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

    if (product.price <= 0) {
      newErrors.price = "Preço deve ser maior que zero";
    }

    if (!product.categoryId) {
      newErrors.categoryId = "Categoria é obrigatória";
    }

    if (!product.sku.trim()) {
      newErrors.sku = "SKU é obrigatório";
    }

    if (product.stock < 0) {
      newErrors.stock = "Estoque não pode ser negativo";
    }

    if (product.minStock < 0) {
      newErrors.minStock = "Estoque mínimo não pode ser negativo";
    }

    // Validar campos obrigatórios do template
    if (selectedTemplate) {
      selectedTemplate.fields.forEach((field) => {
        if (field.required && !templateData[field.id]) {
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

    // Preparar os dados do produto para envio
    const productData = {
      ...product,
      templateData,
      images: product.images || [],
      reviewCount: product.reviewCount || 0,
      views: product.views || 0,
      sales: product.sales || 0,
      rating: product.rating,
      status: "complete" as const,
      // Garantir que as dimensões sejam números
      length: product.length ? Number(product.length) : undefined,
      width: product.width ? Number(product.width) : undefined,
      height: product.height ? Number(product.height) : undefined,
    };

    try {
      if (isEditing && id) {
        // Atualizar produto existente
        await new Promise((resolve) => setTimeout(resolve, 2000));
        handleEdit(id, productData as unknown as Product);
        console.log("Produto atualizado:", productData);
      } else {
        // Criar novo produto
        const newProductData = {
          ...productData,
          createdAt: new Date(),
        };
        handleAdd(newProductData as unknown as Product);
        console.log("Novo produto criado:", newProductData);
      }

      // Redirecionar para a lista de produtos
      navigate("/products");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      // Aqui você pode adicionar tratamento de erro mais específico
      // Por exemplo, mostrar uma mensagem de erro para o usuário
    } finally {
      setIsLoading(false);
    }
  };

  const renderTemplateField = (field: TemplateField) => {
    const value = templateData[field.id] || "";
    const error = errors[`template_${field.id}`];

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
            />
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
            />
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
              <button
                className="back-btn"
                onClick={() => navigate("/products")}
              >
                <i className="fa-solid fa-arrow-left"></i>
                Voltar
              </button>
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
    setProduct(prev => ({
      ...prev,
      [field]: value || '0'
    }));
  };

  // Handler para upload de imagem principal
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct((prev: ProductFormData) => ({ 
          ...prev, 
          image: reader.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler para upload de múltiplas imagens
  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            })
        )
      ).then((imgs) => setProduct((prev: ProductFormData) => ({ ...prev, images: imgs })));
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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                    />
                    {product.image && (
                      <img
                        src={product.image}
                        alt="Imagem principal"
                        style={{ maxWidth: 120, marginTop: 8 }}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Imagens Adicionais</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesUpload}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        marginTop: 8,
                      }}
                    >
                      {product.images &&
                        product.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Imagem ${idx + 1}`}
                            style={{ maxWidth: 80 }}
                          />
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
                    />
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
                    />
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
                  />
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
                    />
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
                    />
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
                    <p>
                      Campos específicos para produtos de{" "}
                      {selectedTemplate.name.toLowerCase()}
                    </p>
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
                        onValueChange={(value) => handleCurrencyChange(value, "price")}
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
                        onValueChange={(value) => handleCurrencyChange(value, "originalPrice")}
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
                        onValueChange={(value) => handleCurrencyChange(value, "costPrice")}
                        allowDecimals={true}
                        decimalSeparator=","
                        groupSeparator="."
                        decimalsLimit={2}
                        className="form-input"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  {/* Estoque */}
                  <div className="form-group">
                    <label htmlFor="stock" className="form-label">
                      Estoque <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={product.stock}
                      onChange={handleInputChange}
                      className={`form-input ${errors.stock ? "error" : ""}`}
                      min="0"
                    />
                    {errors.stock && (
                      <span className="error-text">{errors.stock}</span>
                    )}
                  </div>

                  {/* Estoque Mínimo */}
                  <div className="form-group">
                    <label htmlFor="minStock" className="form-label">
                      Estoque Mínimo
                    </label>
                    <input
                      type="number"
                      id="minStock"
                      name="minStock"
                      value={product.minStock}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                    />
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
                    />
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
                        value={product.length || ''}
                        onChange={(e) =>
                          setProduct((prev) => ({
                            ...prev,
                            length: e.target.value ? parseFloat(e.target.value) : undefined,
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
                        value={product.width || ''}
                        onChange={(e) =>
                          setProduct((prev) => ({
                            ...prev,
                            width: e.target.value ? parseFloat(e.target.value) : undefined,
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
                        value={product.height || ''}
                        onChange={(e) =>
                          setProduct((prev) => ({
                            ...prev,
                            height: e.target.value ? parseFloat(e.target.value) : undefined,
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
                  />
                  <div className="form-help">
                    Separe as tags por vírgula. Ex: algodão, premium,
                    confortável
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

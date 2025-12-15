import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CurrencyInput from "react-currency-input-field";
import { toast } from "react-toastify";

import SideBarMenu from "../components/SideBarMenu";
import Header from "../components/Header";
import ImageGallery from "../components/ImageGallery";
import "./../App.css";
import { getProductById, analyzeProduct } from "../services/productService";
import type { Category } from "../services/categoryService";
import { uploadImage } from "../services/fileService";
import imageCompression from "browser-image-compression";
import { useCategories } from "../context/CategoryContext";
import { useProducts } from "../context/ProductContext";
import type { Product } from "../types/productType";
import CustomSelect from "../components/CustomSelect";
import {
  productTemplates as sharedProductTemplates,
  type ProductTemplate,
  type TemplateField,
} from "../data/productTemplates";

// Maximum allowed image size (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Utility function to compress images
// Removed local compressImage in favor of browser-image-compression

const ProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [selectedTemplate, setSelectedTemplate] =
    useState<ProductTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(!isEditing);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    stock: string;
    minStock: string;
    barcode?: string;
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
    barcode: "",

    // Preços
    price: "0",
    originalPrice: "0",
    costPrice: "0",
    stock: "0",
    minStock: "5",

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
    status: "draft",

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
        isDefault: true,
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
      const existingCategory = categories.find(
        (cat) => cat.name.toLowerCase() === newCategoryName.toLowerCase()
      );

      if (existingCategory) {
        setProduct((prev) => ({
          ...prev,
          categoryId: existingCategory.id,
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

  const productTemplates = sharedProductTemplates;

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
            stock: editingProduct.stock?.toString() || "0",
            minStock: editingProduct.minStock?.toString() || "5",
            barcode: editingProduct.barcode || "",
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
            active:
              editingProduct.active !== undefined
                ? editingProduct.active
                : true,
            reviewCount: editingProduct.reviewCount || 0,
            views: editingProduct.views || 0,
            sales: editingProduct.sales || 0,
            rating: editingProduct.rating || 0,
          };

          setProduct(productData);
          setTemplateData(editingProduct.templateData || {});

          // Tentar encontrar o template baseado nos campos presentes em templateData
          if (
            editingProduct.templateData &&
            Object.keys(editingProduct.templateData).length > 0
          ) {
            // Contar quantos campos de cada template batem com os dados salvos
            const templateScores = productTemplates.map((t) => {
              const matchingFields = t.fields.filter(
                (field) => editingProduct.templateData?.[field.id] !== undefined
              );
              return {
                template: t,
                score: matchingFields.length,
                matchingFields,
              };
            });

            // Ordenar por score (maior primeiro) e pegar o melhor
            const bestMatch = templateScores
              .filter((t) => t.score > 0)
              .sort((a, b) => b.score - a.score)[0];

            if (bestMatch) {
              setSelectedTemplate(bestMatch.template);
              setShowTemplateSelector(false);
            } else {
              console.log("NO TEMPLATE FOUND!");
            }
          } else {
            console.log("No template data available");
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
    e:
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      | {
          target: { name: string; value: string | number | boolean | string[] };
        }
      | { name: string; value: string | number | boolean | string[] }
  ) => {
    let name: string;
    let value: any;

    // Handle both direct value objects and React events
    if ("target" in e) {
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
      const categoryData =
        formData.categoryId &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          formData.categoryId
        )
          ? { categoryId: formData.categoryId }
          : { categoryId: formData.categoryId };

      // Calcular o status baseado nos campos obrigatórios
      const calculateStatus = (): "complete" | "incomplete" => {
        // Campos básicos obrigatórios
        const hasRequiredBasicFields =
          formData.name?.trim() &&
          formData.sku?.trim() &&
          priceValue > 0 &&
          formData.categoryId;

        // Se não tem campos básicos, é incompleto
        if (!hasRequiredBasicFields) {
          return "incomplete";
        }

        // Se tem template selecionado, verificar campos obrigatórios do template
        if (selectedTemplate) {
          const requiredFields = selectedTemplate.fields.filter(
            (f) => f.required
          );
          const allRequiredFieldsFilled = requiredFields.every((field) => {
            const value = templateData[field.id];
            return value !== undefined && value !== null && value !== "";
          });

          return allRequiredFieldsFilled ? "complete" : "incomplete";
        }

        // Se não tem template mas tem campos básicos, é completo
        return "complete";
      };

      // Process template data to ensure numbers are sent as numbers (flots/doubles)
      const processedTemplateData = { ...templateData };
      if (selectedTemplate) {
        selectedTemplate.fields.forEach((field) => {
          if (
            field.type === "number" &&
            processedTemplateData[field.id] !== undefined &&
            processedTemplateData[field.id] !== ""
          ) {
            const stringVal = String(processedTemplateData[field.id]).replace(
              ",",
              "."
            );
            const numVal = parseFloat(stringVal);
            if (!isNaN(numVal)) {
              processedTemplateData[field.id] = numVal;
            }
          }
        });
      }

      return {
        ...formData,
        ...categoryData,
        price: priceValue,
        originalPrice: originalPriceValue,
        costPrice: costPriceValue,
        stock: formData.stock ? parseInt(formData.stock) : 0,
        minStock: formData.minStock ? parseInt(formData.minStock) : 5,
        barcode: formData.barcode,
        templateData: processedTemplateData, // Use processed data
        images: formData.images || [],
        // Ensure numeric values are properly converted
        weight: formData.weight ? Number(formData.weight) : undefined,
        length: formData.length ? Number(formData.length) : undefined,
        width: formData.width ? Number(formData.width) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        // Calculate status based on required fields
        status: calculateStatus(),
        reviewCount: formData.reviewCount || 0,
        views: formData.views || 0,
        sales: formData.sales || 0,
        rating: formData.rating || 0,
        active: formData.active !== undefined ? formData.active : true,
        featured: formData.featured || false,
        image:
          formData.images && formData.images.length > 0
            ? formData.images[0]
            : "",
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
            <div
              className={`char-counter ${
                String(value).length >= tplTextLimit ? "warning" : ""
              }`}
            >
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
                handleTemplateFieldChange(field.id, e.target.value)
              }
              className={`form-input ${error ? "error" : ""}`}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              step={field.validation?.step || "any"}
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
              className={`form-input cursor-pointer ${error ? "error" : ""}`}
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
            <div
              className={`char-counter ${
                String(value).length >= tplTextareaLimit ? "warning" : ""
              }`}
            >
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

  const handleGalleryReorder = (newOrder: string[]) => {
    setProduct((prev) => ({ ...prev, images: newOrder }));
  };

  const handleGalleryRemove = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleGalleryAdd = async (files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {
      toast.warning(
        "Apenas arquivos de imagem são permitidos e foram filtrados."
      );
    }

    const processableFiles = validFiles.filter(
      (file) => file.size <= MAX_IMAGE_SIZE
    );
    if (processableFiles.length !== validFiles.length) {
      toast.warning("Algumas imagens excederam 5MB e foram ignoradas.");
    }

    if (processableFiles.length === 0) return;

    const MAX_IMAGES = 5;

    if (
      product.images.length >= MAX_IMAGES ||
      product.images.length + processableFiles.length > MAX_IMAGES
    ) {
      toast.warning(
        `Você pode adicionar no máximo ${MAX_IMAGES} imagens por produto.`
      );
      return;
    }

    try {
      const processedImages = await Promise.all(
        processableFiles.map(async (file) => {
          try {
            // Compress image
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);

            // Upload to Cloudinary via backend
            const url = await uploadImage(compressedFile);
            return url;
          } catch (e) {
            console.error("Upload/Compression failed", e);
            toast.error(`Erro ao enviar imagem: ${file.name}`);
            return null;
          }
        })
      );

      // Filter out failed uploads (nulls)
      const successUrls = processedImages.filter(
        (url) => url !== null
      ) as string[];

      setProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...successUrls],
      }));

      if (successUrls.length > 0) {
        toast.success(`${successUrls.length} imagens adicionadas com sucesso!`);
      }
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error("Erro ao processar imagens.");
    }
  };

  const handleAutoFill = async () => {
    if (product.images.length === 0) {
      toast.warning("Adicione pelo menos uma imagem para usar a IA.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Use the first image for analysis
      const mainImage = product.images[0];

      // Construct template context if a template is selected
      let templateContext = "";
      if (selectedTemplate) {
        templateContext = `Template Selecionado: ${selectedTemplate.name}\n`;
        templateContext += `Campos esperados:\n`;
        selectedTemplate.fields.forEach((field) => {
          templateContext += `- ID: ${field.id}, Label: ${field.label}, Tipo: ${field.type}`;
          if (field.options) {
            templateContext += `, Opções: [${field.options.join(", ")}]`;
          }
          templateContext += "\n";
        });
      }

      const analysis = await analyzeProduct({
        imageBase64: mainImage,
        nameInput: product.name,
        additionalText: product.description,
        templateContext: templateContext || undefined,
      });

      // Map API response to product state
      setProduct((prev) => ({
        ...prev,
        name: analysis.name || prev.name,
        description: analysis.description || prev.description,
        price: analysis.price
          ? analysis.price.toString().replace(".", ",")
          : prev.price,
        originalPrice: analysis.originalPrice
          ? analysis.originalPrice.toString().replace(".", ",")
          : prev.originalPrice,
        sku: analysis.sku || prev.sku,
        weight: analysis.weight || prev.weight,
        width: analysis.dimensions?.width || prev.width,
        height: analysis.dimensions?.height || prev.height,
        length: analysis.dimensions?.length || prev.length,
        tags: analysis.tags?.length > 0 ? analysis.tags : prev.tags,
        // PRESERVE active and featured status from previous state
        // featured: analysis.featured !== null ? analysis.featured : prev.featured,
        // active: analysis.active !== null ? analysis.active : prev.active,
        brand: analysis.brand || prev.brand,
      }));

      // Update template data if returned
      if (
        analysis.templateData &&
        Object.keys(analysis.templateData).length > 0
      ) {
        setTemplateData((prev) => ({
          ...prev,
          ...analysis.templateData,
        }));
      }

      // Try to match category if provided
      if (analysis.category) {
        // Simple fuzzy match or exact match could be implemented here
        // For now, we rely on the user to select if it doesn't match perfectly or try to find by name
        const foundCategory = categories.find(
          (c) => c.name.toLowerCase() === analysis.category?.toLowerCase()
        );
        if (foundCategory) {
          setProduct((prev) => ({ ...prev, categoryId: foundCategory.id }));
        }
      }

      toast.success("Dados preenchidos com sucesso pela IA! 🤖");
    } catch (error) {
      console.error("Erro na análise de IA:", error);
      toast.error("Erro ao analisar imagem com IA. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-color) flex flex-col">
      <Header />
      <div className="flex flex-1">
        <SideBarMenu pageName="products" />
        <main className="flex-1 p-8 overflow-y-auto app-main">
          <div className="max-w-7xl mx-auto">
            {/* Header com ações */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/products")}
                  className="p-2 hover:bg-(--surface-color) rounded-full transition-colors text-(--text-secondary-color) cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-left text-xl"></i>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-(--text-color)">
                    {isEditing ? "Editar Produto" : "Novo Produto"}
                  </h1>
                  <p className="text-(--text-secondary-color) text-sm mt-1">
                    {isEditing
                      ? "Atualize as informações do seu produto"
                      : "Adicione um novo produto ao seu catálogo"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedTemplate && (
                  <button
                    onClick={() => setShowTemplateSelector(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-(--border-color) rounded-lg hover:bg-(--surface-color) transition-colors text-(--text-secondary-color) cursor-pointer"
                  >
                    <i className={selectedTemplate.icon}></i>
                    <span>Template: {selectedTemplate.name}</span>
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Principal (Esquerda) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Card de Mídia / Galeria */}
                  <div className="bg-(--surface-color) rounded-xl shadow-sm border border-(--border-color) p-6">
                    <h2 className="text-lg font-semibold text-(--text-color) mb-2 flex items-center gap-2">
                      <i className="fa-solid fa-images text-(--accent-color)"></i>
                      Galeria de Imagens
                    </h2>
                    <p className="text-sm text-(--text-secondary-color) mb-6">
                      Adicione imagens do produto. A primeira imagem será a
                      principal. Arraste para reordenar.
                    </p>

                    <ImageGallery
                      images={product.images}
                      onReorder={handleGalleryReorder}
                      onRemove={handleGalleryRemove}
                      onAdd={handleGalleryAdd}
                    />

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAutoFill}
                        disabled={product.images.length === 0 || isAnalyzing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium cursor-pointer ${
                          product.images.length === 0 || isAnalyzing
                            ? "bg-(--bg-color) text-(--text-secondary-color) cursor-not-allowed"
                            : "bg-(--accent-color)/10 text-(--accent-color) hover:bg-(--accent-color)/20"
                        }`}
                      >
                        {isAnalyzing ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                        )}
                        {isAnalyzing ? "Analisando..." : "Preencher com IA"}
                      </button>
                    </div>
                  </div>

                  {/* Card de Informações Básicas */}
                  <div className="bg-(--surface-color) rounded-xl shadow-sm border border-(--border-color) p-6">
                    <h2 className="text-lg font-semibold text-(--text-color) mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-info-circle text-(--accent-color)"></i>
                      Informações Básicas
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-(--text-color) mb-1"
                        >
                          Nome do Produto{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={product.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-2 rounded-lg border bg-(--bg-color) text-(--text-color) focus:ring-2 focus:ring-(--accent-color) focus:border-(--accent-color) transition-colors ${
                            errors.name
                              ? "border-(--error-color) bg-(--error-color)/10"
                              : "border-(--border-color)"
                          }`}
                          placeholder="Ex: Camiseta Premium Algodão"
                          maxLength={LIMITS.name}
                        />
                        <div className="flex justify-end mt-1">
                          <span
                            className={`text-xs ${
                              product.name.length >= LIMITS.name
                                ? "text-red-500"
                                : "text-gray-400"
                            }`}
                          >
                            {product.name.length}/{LIMITS.name}
                          </span>
                        </div>
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="sku"
                            className="block text-sm font-medium text-(--text-color) mb-1"
                          >
                            SKU <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="sku"
                            name="sku"
                            value={product.sku}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 rounded-lg border bg-(--bg-color) text-(--text-color) focus:ring-2 focus:ring-(--accent-color) focus:border-(--accent-color) transition-colors ${
                              errors.sku
                                ? "border-(--error-color) bg-(--error-color)/10"
                                : "border-(--border-color)"
                            }`}
                            placeholder="Ex: CAMP-001"
                            maxLength={LIMITS.sku}
                          />
                          {errors.sku && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.sku}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-(--text-color) mb-1"
                        >
                          Descrição
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          value={product.description}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-color) text-(--text-color) focus:ring-2 focus:ring-(--accent-color) focus:border-(--accent-color) transition-colors"
                          placeholder="Descreva o produto em detalhes..."
                          rows={4}
                          maxLength={LIMITS.description}
                        />
                        <div className="flex justify-end mt-1">
                          <span
                            className={`text-xs ${
                              product.description.length >= LIMITS.description
                                ? "text-red-500"
                                : "text-gray-400"
                            }`}
                          >
                            {product.description.length}/{LIMITS.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campos do Template (se houver) */}
                  {selectedTemplate && (
                    <div className="bg-(--surface-color) rounded-xl shadow-sm border border-(--border-color) p-6">
                      <h2 className="text-lg font-semibold text-(--text-color) mb-6 flex items-center gap-2">
                        <i
                          className={`${selectedTemplate.icon} text-(--accent-color)`}
                        ></i>
                        Especificações Técnicas
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedTemplate.fields.map((field) =>
                          renderTemplateField(field)
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preços */}
                  <div className="bg-(--surface-color) rounded-xl shadow-sm border border-(--border-color) p-6">
                    <h2 className="text-lg font-semibold text-(--text-color) mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-dollar-sign text-(--accent-color)"></i>
                      Precificação
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-(--text-color) mb-1">
                          Preço de Venda{" "}
                          <span className="text-(--error-color)">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-(--text-secondary-color)">
                            R$
                          </span>
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
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border bg-(--bg-color) text-(--text-color) focus:ring-2 focus:ring-(--accent-color) focus:border-(--accent-color) transition-colors ${
                              errors.price
                                ? "border-(--error-color) bg-(--error-color)/10"
                                : "border-(--border-color)"
                            }`}
                            placeholder="0,00"
                          />
                        </div>
                        {errors.price && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.price}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-color) mb-1">
                          Preço Original (De)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-(--text-secondary-color)">
                            R$
                          </span>
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
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-color) text-(--text-color) focus:ring-2 focus:ring-(--accent-color) focus:border-(--accent-color) transition-colors"
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-color) mb-1">
                          Preço de Custo
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-(--text-secondary-color)">
                            R$
                          </span>
                          <CurrencyInput
                            id="costPrice"
                            name="costPrice"
                            value={product.costPrice}
                            onValueChange={(value) =>
                              handleCurrencyChange(value, "costPrice")
                            }
                            allowDecimals={true}
                            decimalSeparator=","
                            groupSeparator="."
                            decimalsLimit={2}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-color) text-(--text-color) focus:ring-2 focus:ring-(--accent-color) focus:border-(--accent-color) transition-colors"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coluna Lateral (Direita) */}
                <div className="space-y-6">
                  {/* Publicação */}
                  <div className="bg-(--surface-color) rounded-xl shadow-sm border border-(--border-color) p-6">
                    <h2 className="text-lg font-semibold text-(--text-color) mb-4">
                      Status & Visibilidade
                    </h2>

                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-3 bg-(--bg-color) rounded-lg cursor-pointer hover:bg-(--border-color)/20 transition-colors">
                        <input
                          type="checkbox"
                          name="active"
                          checked={product.active}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-(--border-color) text-(--accent-color) focus:ring-(--accent-color)"
                        />
                        <div>
                          <span className="block font-medium text-(--text-color)">
                            Produto Ativo
                          </span>
                          <span className="block text-xs text-(--text-secondary-color)">
                            Visível na loja
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-(--bg-color) rounded-lg cursor-pointer hover:bg-(--border-color)/20 transition-colors">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={product.featured}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded border-(--border-color) text-(--accent-color) focus:ring-(--accent-color)"
                        />
                        <div>
                          <span className="block font-medium text-(--text-color)">
                            Destaque
                          </span>
                          <span className="block text-xs text-(--text-secondary-color)">
                            Exibir na home
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Categorização */}
                  <div className="bg-(--surface-color) rounded-xl shadow-sm border border-(--border-color) p-6">
                    <h2 className="text-lg font-semibold text-(--text-color) mb-4">
                      Organização
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-(--text-color) mb-1">
                          Categoria{" "}
                          <span className="text-(--error-color)">*</span>
                        </label>
                        <CustomSelect
                          value={product.categoryId}
                          onChange={(value) => {
                            setProduct((prev) => ({
                              ...prev,
                              categoryId: value,
                            }));
                            if (errors.categoryId)
                              setErrors((prev) => ({
                                ...prev,
                                categoryId: "",
                              }));
                          }}
                          placeholder="Selecione..."
                          searchPlaceholder="Buscar..."
                          showSearch={true}
                          options={(() => {
                            const defaultCategories = categories
                              .filter((cat) => cat.isDefault)
                              .map((cat) => ({
                                value: cat.id,
                                label: cat.name,
                                group: "Padrão",
                                isDefault: true,
                              }));

                            const userCategories = categories
                              .filter((cat) => !cat.isDefault)
                              .map((cat) => ({
                                value: cat.id,
                                label: cat.name,
                                group: "Personalizadas",
                                isDefault: false,
                              }));
                            return [...userCategories, ...defaultCategories];
                          })()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-color) mb-1">
                          Nova Categoria
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-color) text-(--text-color) text-sm"
                            placeholder="Nome..."
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            disabled={!newCategoryName.trim()}
                            className="px-3 py-2 bg-(--bg-color) border border-(--border-color) text-(--text-secondary-color) rounded-lg hover:bg-(--surface-color) disabled:opacity-50 text-sm font-medium cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-color) mb-1">
                          Marca
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={product.brand}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-color) text-(--text-color)"
                          placeholder="Ex: Nike"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dimensões */}
                  <div className="bg-(--surface-color) rounded-xl shadow-sm border border-(--border-color) p-6">
                    <h2 className="text-lg font-semibold text-(--text-color) mb-4">
                      Envio
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-(--text-color) mb-1">
                          Peso (kg)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={product.weight}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 rounded-lg border border-(--border-color) bg-(--bg-color) text-(--text-color)"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-(--text-color) mb-1">
                          Dimensões (cm)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="L"
                            className="px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-color) text-(--text-color) text-center"
                            value={product.width || ""}
                            onChange={(e) =>
                              setProduct((prev) => ({
                                ...prev,
                                width: Number(e.target.value) || undefined,
                              }))
                            }
                          />
                          <input
                            type="number"
                            placeholder="A"
                            className="px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-color) text-(--text-color) text-center"
                            value={product.height || ""}
                            onChange={(e) =>
                              setProduct((prev) => ({
                                ...prev,
                                height: Number(e.target.value) || undefined,
                              }))
                            }
                          />
                          <input
                            type="number"
                            placeholder="P"
                            className="px-3 py-2 rounded-lg border border-(--border-color) bg-(--bg-color) text-(--text-color) text-center"
                            value={product.length || ""}
                            onChange={(e) =>
                              setProduct((prev) => ({
                                ...prev,
                                length: Number(e.target.value) || undefined,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões Finais */}
              <div className="flex justify-end items-center gap-4 py-6 border-t border-(--border-color) mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="px-6 py-2 border border-(--border-color) rounded-lg text-(--text-color) hover:bg-(--bg-color) transition-colors font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2 bg-(--accent-color) text-white rounded-lg hover:bg-(--accent-color-hover) transition-colors font-medium shadow-sm disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                >
                  {isLoading && <i className="fa-solid fa-spinner fa-spin"></i>}
                  {isEditing ? "Salvar Alterações" : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductFormPage;

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface AnalyzeProductInput {
  imageBase64: string;
  nameInput?: string;
  additionalText?: string;
}

export class GeminiService {
  async analyzeProduct({
    imageBase64,
    nameInput,
    additionalText,
  }: AnalyzeProductInput) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
Você é um analisador multimodal profissional de produtos para e-commerce. 
Sua tarefa: analisar a imagem do produto (e, opcionalmente, o nome/atributos fornecidos) e retornar **apenas** um único objeto JSON válido com a estrutura exata abaixo, preenchendo cada campo quando possível. NÃO escreva nada fora do JSON. NÃO explique nada. NÃO inclua campos extras.

INPUTS disponíveis ao chamar você:
- name_input: ${nameInput || "null"}
- additional_text: ${additionalText || "null"}

REQUISITOS GERAIS:
1. Responda **somente** com um objeto JSON (sem texto, sem comentários).
2. Sempre **incluir todas as chaves** do schema abaixo. Para campos que não podem ser determinados com segurança, use \`null\`.
3. Todos os textos devem estar em **Português**.
4. Tipos:
   - strings → entre aspas.
   - numbers → sem aspas (ponto decimal para casas decimais).
   - booleans → \`true\`/\`false\`.
   - arrays → JSON arrays.
   - objetos → JSON objects.
5. Unidades:
   - \`price\` e \`originalPrice\`: reais (BRL), número decimal com **duas casas** (ex.: 199.90).
   - \`weight\`: quilogramas (kg), número com até **3 casas decimais** (ex.: 0.350).
   - \`dimensions\` (length/width/height): centímetros (cm), números com até **2 casas decimais**.
6. **NÃO INVENTE**: se não houver informação suficiente (ex.: SKU visível), colocar \`null\`. Não fature números exatos ou códigos de produto.
7. Se houver múltiplos produtos na imagem ou a imagem estiver ambígua, preencha campos principais com \`null\` e defina \`status: "incomplete"\`.

ESQUEMA OBRIGATÓRIO (retorne exatamente estas chaves — sempre)
{
  "name": string | null,
  "description": string | null,
  "price": number | null,
  "originalPrice": number | null,
  "category": string | null,
  "subcategory": string | null,
  "brand": string | null,
  "sku": string | null,
  "status": "complete" | "incomplete",
  "weight": number | null,
  "dimensions": {
    "length": number | null,
    "width": number | null,
    "height": number | null
  },
  "tags": [ string, ... ],     // lista 0..10, palavras-chave curtas
  "featured": boolean,
  "active": boolean
}

REGRAS DETALHADAS POR CAMPO:
- name:
  - Use \`name_input\` se for fornecido e for claro.
  - Se inferir do visual, gere um nome curto e descritivo em Title Case (ex.: "Camiseta Polo Branca").
  - Se incapaz, \`null\`.

- description:
  - Uma frase curta em português (1–2 sentenças) enfatizando uso e atributos visíveis.
  - Se for inferida, deixar clara e factual (evitar adjetivos exagerados).
  - Se insuficiente, \`null\`.

- price:
  - Estime um preço médio em BRL baseado em produtos semelhantes. Use fontes confiáveis **somente se puder** inferir; caso contrário, \`null\`.
  - Valores positivos; arredonde para 2 casas decimais.
  - Se puder estimar faixa, retorne o valor médio (não retorne texto).

- originalPrice:
  - Preço sugerido de referência (por exemplo, preço anterior ou preço sem desconto). Se não puder estimar, \`null\`.
  - Arredondar para 2 casas.

- category / subcategory:
  - Termos curtos e normalizados (preferência: singular, Title Case: "Eletrônicos", "Calçados").
  - Subcategory mais específica que category se possível.
  - Se incerto, \`null\`.

- brand:
  - Preencher somente se a marca for claramente identificável (logo, etiqueta ou metadados).
  - Caso contrário, \`null\`. **Não adivinhe marcas.**

- sku:
  - Preencher somente se legível na imagem ou fornecido pelo \`name_input\`/metadados.
  - Se não disponível, coloque \`null\`. **NÃO invente SKU.**

- status:
  - Valor **"complete"** se TODOS os campos obrigatórios estiverem preenchidos com valores não-nulos:
    - Obrigatórios para considerarmos "complete": \`name\`, \`description\`, \`price\`, \`category\`, \`sku\`, \`tags\` (tags deve ter pelo menos 1 elemento).
  - Caso contrário, \`"incomplete"\`.

- weight:
  - Em kg. Número com até 3 casas decimais. Se não puder inferir com segurança, \`null\`.

- dimensions:
  - length/width/height em cm. Valores numéricos com até 2 casas decimais. Se desconhecido, \`null\` nos subcampos.

- tags:
  - Lista de 1 a 10 palavras-chave relevantes (minimizar stopwords), todas em minúsculas, sem acentos (opcional), sem duplicatas.
  - Exemplos: ["camiseta", "algodão", "casual"].
  - Se não puder gerar tags, retornar array vazio \`[]\`.

- featured:
  - \`true\` somente se o produto claramente parece ser destaque (ex.: embalagem premium, imagem hero). Caso contrário \`false\`.
  - Preferir \`false\` por padrão.

- active:
  - \`true\` se o produto aparenta estar disponível para venda.
  - \`false\` apenas se houver indicação óbvia de descontinuação (ex.: imagem de produto riscado, "descontinuado" no texto). Se incerto, \`true\`.

REGRAS ADICIONAIS E BOAS PRÁTICAS:
- Sempre priorize **precisão sobre completude**: prefira \`null\` a inventar.
- Não inclua campos não listados; apenas as chaves do esquema.
- Round numbers conforme definido; use ponto decimal.
- Evite linguagem promocional na \`description\`.
- Se você usar informação textual do \`additional_text\`, considere-a como apoio, mas não crie dados contraditórios com a imagem.
- Em caso de contradição entre \`name_input\` e o que a imagem mostra, use \`name_input\` somente se for claramente coerente; senão confie na imagem e deixe o \`name_input\` ignorado (ou combine: use \`name_input\` como base e acrescente atributos visíveis).
- Se a imagem contiver várias perspectivas (múltiplas imagens), priorize a mais clara (ou a \`image_url\` principal).

IMPORTANTE: RETORNE APENAS O OBJETO JSON ACIMA (com as chaves definidas), NADA MAIS, NEM CELULA DE CODIGO (ex json).
`;

      const image = {
        inlineData: {
          data: imageBase64.split(",")[1], // Remove header data:image/jpeg;base64,
          mimeType: imageBase64.substring(
            imageBase64.indexOf(":") + 1,
            imageBase64.indexOf(";")
          ),
        },
      };

      const result = await model.generateContent([prompt, image]);
      const response = await result.response;
      const text = response.text();

      // Limpeza básica para garantir JSON válido
      const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("Error analyzing product with Gemini:", error);
      throw new Error("Failed to analyze product");
    }
  }
}

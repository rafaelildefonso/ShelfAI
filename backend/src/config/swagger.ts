import swaggerJsdoc from 'swagger-jsdoc';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import type { OpenAPIV3 } from 'openapi-types';

// Get package.json version
const packageJsonPath = resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version: string };

// Define the base OpenAPI specification
const openApiDefinition: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'ShelfAI API',
    version: pkg.version,
    description: 'API documentation for ShelfAI',
    contact: {
      name: 'ShelfAI Support',
      email: 'support@shelfai.com'
    }
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000/api',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  paths: {}, // Initialize empty paths, will be populated by swagger-jsdoc
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {}
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

// Define the Swagger options
const swaggerOptions: swaggerJsdoc.Options = {
  definition: openApiDefinition,
  // Path to the API routes and validation schemas
  apis: [
    './src/routes/*.ts',
    './src/validations/*.ts',
    './dist/routes/*.js' // For production builds
  ]
};

// Generate the Swagger specification
export const swaggerSpec = swaggerJsdoc(swaggerOptions) as OpenAPIV3.Document;
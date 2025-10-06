import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { Request } from 'express';

const uploadDir = path.join(process.cwd(), 'uploads');
const publicDir = path.join(process.cwd(), 'public');

// Ensure upload and public directories exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const processAndSaveImage = async (file: Express.Multer.File): Promise<string> => {
  // In a production environment, you would want to process the image here
  // (resize, compress, etc.) using a library like sharp or jimp
  
  // For now, we'll just move the file to the public directory
  const fileName = `product-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
  const filePath = path.join('public', 'images', 'products', fileName);
  
  // Ensure the directory exists
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  
  // Move the file
  await fs.promises.rename(file.path, filePath);
  
  // Return the public URL
  return `/images/products/${fileName}`;
};

interface NodeError extends Error {
  code?: string;
}

export const deleteImage = async (imagePath: string): Promise<void> => {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    await fs.promises.unlink(fullPath);
  } catch (error: unknown) {
    const nodeError = error as NodeError;
    console.error('Error deleting image:', nodeError);
    // Don't throw error if file doesn't exist
    if (nodeError.code !== 'ENOENT') {
      throw nodeError;
    }
  }
};

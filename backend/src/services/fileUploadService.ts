import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { Request } from "express";

const uploadDir = path.join(process.cwd(), "uploads");
const publicDir = path.join(process.cwd(), "public");

import { v2 as cloudinary } from "cloudinary";

// Sanitize CLOUDINARY_URL to remove common copy-paste artifacts (angle brackets)
if (process.env.CLOUDINARY_URL) {
  const originalUrl = process.env.CLOUDINARY_URL;
  const sanitizedUrl = originalUrl.replace(/[<>]/g, "");

  if (originalUrl !== sanitizedUrl) {
    console.warn("Retrying with sanitized CLOUDINARY_URL (removed brackets)");
    process.env.CLOUDINARY_URL = sanitizedUrl;

    // Parse and explicitly configure to ensure it takes effect
    const match = sanitizedUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      cloudinary.config({
        api_key: match[1],
        api_secret: match[2],
        cloud_name: match[3],
        secure: true,
      });
    }
  }
}

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const processAndSaveImage = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "products",
      use_filename: true,
      unique_filename: true,
    });

    // Delete local file after successful upload
    await fs.promises.unlink(file.path);

    return result.secure_url;
  } catch (error) {
    // Attempt to delete local file if upload fails
    try {
      if (fs.existsSync(file.path)) {
        await fs.promises.unlink(file.path);
      }
    } catch (cleanupError) {
      console.error(
        "Error cleaning up local file after upload failure:",
        cleanupError
      );
    }
    throw error;
  }
};

interface NodeError extends Error {
  code?: string;
}

export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public ID from URL
    // URL format example: https://res.cloudinary.com/demo/image/upload/v1234567890/products/sample.jpg
    const regex = /\/([^/]+)\.[^.]+$/; // Matches filename without extension
    // Better regex to capture folder path if needed, but 'products/filename' is standard if we set folder='products'
    // Actually cloudinary public IDs include folders.
    // Example: https://res.cloudinary.com/cloudname/image/upload/v12345/products/filename.jpg
    // Public ID: products/filename

    // We can use a more robust extraction or just parse key parts.
    // Let's assume standard cloudinary URL structure.

    // Split by '/' and find indices
    const parts = imageUrl.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) {
      // Not a standard cloudinary URL, maybe local? ignore or throw?
      // If we still have local images, we might want to check if it is a local path.
      if (imageUrl.startsWith("/images/")) {
        // It is a legacy local image
        const fullPath = path.join(process.cwd(), "public", imageUrl);
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
        }
        return;
      }
      return;
    }

    // parts after 'upload' and version (v12323..)
    // usually structure: .../upload/v<version>/<folder>/<id>.<ext>
    // or .../upload/<folder>/<id>.<ext>

    // Let's rely on cloudinary's method if we store public_id, but we only stored URL.
    // We need to extract public_id from URL.

    // Simplest way for standard URLs:
    // Get substring after last 'upload/' and remove version if present 'v[0-9]+/'

    const pathParts = imageUrl.split("/upload/");
    if (pathParts.length < 2) return;

    let publicIdWithExt = pathParts[1];
    // Remove version prefix if exists (e.g., v123456/)
    publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, "");

    // Remove extension
    const publicId = publicIdWithExt.substring(
      0,
      publicIdWithExt.lastIndexOf(".")
    );

    await cloudinary.uploader.destroy(publicId);
  } catch (error: unknown) {
    console.error("Error deleting image from Cloudinary:", error);
    // Don't throw for deletion errors typically, just log
  }
};

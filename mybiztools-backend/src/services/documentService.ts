// import prisma from '../lib/prisma.js';
// import { v4 as uuidv4 } from 'uuid';
// import fs from 'fs/promises';
// import path from 'path';

// // Storage configuration
// const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// export interface UploadDocumentInput {
//   userId: string;
//   name: string;
//   originalName: string;
//   mimeType: string;
//   size: number;
//   buffer: Buffer;
//   category?: string;
//   tags?: string[];
//   description?: string;
// }

// export interface DocumentResponse {
//   success: boolean;
//   message: string;
//   data?: {
//     document: {
//       id: string;
//       name: string;
//       original_name: string;
//       mime_type: string;
//       size: number;
//       category: string;
//       tags: string[];
//       description: string | null;
//       created_at: Date;
//     };
//   };
//   error?: string;
// }

// export class DocumentService {
//   /**
//    * Initialize upload directory
//    */
//   static async initializeStorage() {
//     try {
//       await fs.mkdir(UPLOAD_DIR, { recursive: true });
//       console.log(`📁 Upload directory ready: ${UPLOAD_DIR}`);
//     } catch (error) {
//       console.error('Failed to initialize storage:', error);
//     }
//   }

//   /**
//    * Upload a document
//    */
//   static async uploadDocument(input: UploadDocumentInput): Promise<DocumentResponse> {
//     try {
//       // Validate file size
//       if (input.size > MAX_FILE_SIZE) {
//         return {
//           success: false,
//           message: 'File size exceeds maximum allowed (10MB)',
//           error: 'FILE_TOO_LARGE',
//         };
//       }

//       // Validate mime type
//       const allowedMimeTypes = [
//         'application/pdf',
//         'image/jpeg',
//         'image/png',
//         'image/gif',
//         'image/webp',
//         'application/msword',
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//         'application/vnd.ms-excel',
//         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         'text/plain',
//         'text/csv',
//       ];

//       if (!allowedMimeTypes.includes(input.mimeType)) {
//         return {
//           success: false,
//           message: 'File type not allowed',
//           error: 'INVALID_FILE_TYPE',
//         };
//       }

//       // Create user-specific directory
//       const userDir = path.join(UPLOAD_DIR, input.userId);
//       await fs.mkdir(userDir, { recursive: true });

//       // Generate unique filename
//       const ext = path.extname(input.originalName);
//       const filename = `${uuidv4()}${ext}`;
//       const storagePath = path.join(userDir, filename);

//       // Save file to disk
//       await fs.writeFile(storagePath, input.buffer);

//       // Save metadata to database
//       const document = await prisma.document.create({
//         data: {
//           user_id: input.userId,
//           name: input.name || input.originalName,
//           original_name: input.originalName,
//           mime_type: input.mimeType,
//           size: BigInt(input.size),
//           storage_path: storagePath,
//           storage_type: 'local',
//           category: input.category || 'other',
//           tags: input.tags || [],
//           description: input.description,
//         },
//       });

//       return {
//         success: true,
//         message: 'Document uploaded successfully',
//         data: {
//           document: {
//             id: document.id,
//             name: document.name,
//             original_name: document.original_name,
//             mime_type: document.mime_type,
//             size: Number(document.size),
//             category: document.category,
//             tags: (document.tags as string[]) || [],
//             description: document.description,
//             created_at: document.created_at,
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Upload document error:', error);
//       return {
//         success: false,
//         message: 'Failed to upload document',
//         error: 'UPLOAD_FAILED',
//       };
//     }
//   }

//   /**
//    * Get user's documents
//    */
//   static async getDocuments(
//     userId: string,
//     options: {
//       page?: number;
//       limit?: number;
//       category?: string;
//       search?: string;
//     } = {}
//   ) {
//     try {
//       const { page = 1, limit = 20, category, search } = options;
//       const skip = (page - 1) * limit;

//       const where: any = { user_id: userId };

//       if (category && category !== 'all') {
//         where.category = category;
//       }

//       if (search) {
//         where.OR = [
//           { name: { contains: search, mode: 'insensitive' } },
//           { original_name: { contains: search, mode: 'insensitive' } },
//           { description: { contains: search, mode: 'insensitive' } },
//         ];
//       }

//       const [documents, total] = await Promise.all([
//         prisma.document.findMany({
//           where,
//           orderBy: { created_at: 'desc' },
//           skip,
//           take: limit,
//           select: {
//             id: true,
//             name: true,
//             original_name: true,
//             mime_type: true,
//             size: true,
//             category: true,
//             tags: true,
//             description: true,
//             download_count: true,
//             created_at: true,
//             updated_at: true,
//           },
//         }),
//         prisma.document.count({ where }),
//       ]);

//       return {
//         success: true,
//         data: {
//           documents: documents.map(d => ({
//             ...d,
//             size: Number(d.size),
//           })),
//           pagination: {
//             current: page,
//             limit,
//             total,
//             pages: Math.ceil(total / limit),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get documents error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve documents',
//         error: 'GET_DOCUMENTS_FAILED',
//       };
//     }
//   }

//   /**
//    * Get document by ID
//    */
//   static async getDocumentById(userId: string, documentId: string) {
//     try {
//       const document = await prisma.document.findFirst({
//         where: {
//           id: documentId,
//           user_id: userId,
//         },
//       });

//       if (!document) {
//         return {
//           success: false,
//           message: 'Document not found',
//           error: 'DOCUMENT_NOT_FOUND',
//         };
//       }

//       return {
//         success: true,
//         data: {
//           document: {
//             ...document,
//             size: Number(document.size),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Get document error:', error);
//       return {
//         success: false,
//         message: 'Failed to retrieve document',
//         error: 'GET_DOCUMENT_FAILED',
//       };
//     }
//   }

//   /**
//    * Download document (get file buffer)
//    */
//   static async downloadDocument(userId: string, documentId: string) {
//     try {
//       const document = await prisma.document.findFirst({
//         where: {
//           id: documentId,
//           user_id: userId,
//         },
//       });

//       if (!document) {
//         return {
//           success: false,
//           message: 'Document not found',
//           error: 'DOCUMENT_NOT_FOUND',
//         };
//       }

//       // Read file from storage
//       const buffer = await fs.readFile(document.storage_path);

//       // Update download count
//       await prisma.document.update({
//         where: { id: documentId },
//         data: {
//           download_count: { increment: 1 },
//           last_accessed_at: new Date(),
//         },
//       });

//       return {
//         success: true,
//         data: {
//           buffer,
//           filename: document.original_name,
//           mimeType: document.mime_type,
//         },
//       };
//     } catch (error) {
//       console.error('Download document error:', error);
//       return {
//         success: false,
//         message: 'Failed to download document',
//         error: 'DOWNLOAD_FAILED',
//       };
//     }
//   }

//   /**
//    * Update document metadata
//    */
//   static async updateDocument(
//     userId: string,
//     documentId: string,
//     updates: {
//       name?: string;
//       category?: string;
//       tags?: string[];
//       description?: string;
//     }
//   ) {
//     try {
//       const document = await prisma.document.findFirst({
//         where: {
//           id: documentId,
//           user_id: userId,
//         },
//       });

//       if (!document) {
//         return {
//           success: false,
//           message: 'Document not found',
//           error: 'DOCUMENT_NOT_FOUND',
//         };
//       }

//       const updatedDocument = await prisma.document.update({
//         where: { id: documentId },
//         data: {
//           name: updates.name,
//           category: updates.category,
//           tags: updates.tags,
//           description: updates.description,
//         },
//       });

//       return {
//         success: true,
//         message: 'Document updated successfully',
//         data: {
//           document: {
//             ...updatedDocument,
//             size: Number(updatedDocument.size),
//           },
//         },
//       };
//     } catch (error) {
//       console.error('Update document error:', error);
//       return {
//         success: false,
//         message: 'Failed to update document',
//         error: 'UPDATE_FAILED',
//       };
//     }
//   }

//   /**
//    * Delete document
//    */
//   static async deleteDocument(userId: string, documentId: string) {
//     try {
//       const document = await prisma.document.findFirst({
//         where: {
//           id: documentId,
//           user_id: userId,
//         },
//       });

//       if (!document) {
//         return {
//           success: false,
//           message: 'Document not found',
//           error: 'DOCUMENT_NOT_FOUND',
//         };
//       }

//       // Delete file from storage
//       try {
//         await fs.unlink(document.storage_path);
//       } catch (fileError) {
//         console.warn('Failed to delete file from storage:', fileError);
//       }

//       // Delete from database
//       await prisma.document.delete({
//         where: { id: documentId },
//       });

//       return {
//         success: true,
//         message: 'Document deleted successfully',
//       };
//     } catch (error) {
//       console.error('Delete document error:', error);
//       return {
//         success: false,
//         message: 'Failed to delete document',
//         error: 'DELETE_FAILED',
//       };
//     }
//   }

//   /**
//    * Get storage usage for a user
//    */
//   static async getStorageUsage(userId: string) {
//     try {
//       const result = await prisma.document.aggregate({
//         where: { user_id: userId },
//         _sum: { size: true },
//         _count: true,
//       });

//       const totalSize = Number(result._sum.size || 0);
//       const documentCount = result._count;

//       // Define storage limits by plan (in bytes)
//       const storageLimits: { [key: string]: number } = {
//         free: 100 * 1024 * 1024, // 100MB
//         pro: 5 * 1024 * 1024 * 1024, // 5GB
//         enterprise: 50 * 1024 * 1024 * 1024, // 50GB
//       };

//       // Get user's plan
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         select: { current_plan: true },
//       });

//       const plan = user?.current_plan || 'free';
//       const limit = storageLimits[plan] || storageLimits.free;
//       const usagePercentage = (totalSize / limit) * 100;

//       return {
//         success: true,
//         data: {
//           used: totalSize,
//           limit,
//           usagePercentage: Math.round(usagePercentage * 100) / 100,
//           documentCount,
//           plan,
//         },
//       };
//     } catch (error) {
//       console.error('Get storage usage error:', error);
//       return {
//         success: false,
//         message: 'Failed to get storage usage',
//         error: 'GET_USAGE_FAILED',
//       };
//     }
//   }
// }

// export default DocumentService;


import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// DOCUMENT SERVICE
// ============================================================================

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

const STORAGE_LIMITS: Record<string, number> = {
  free:       100 * 1024 * 1024,           // 100MB
  pro:        5 * 1024 * 1024 * 1024,      // 5GB
  enterprise: 50 * 1024 * 1024 * 1024,     // 50GB
};

export interface UploadDocumentInput {
  userId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  category?: string;
  tags?: string[];
  description?: string;
}

const formatDocument = (d: any) => ({
  id: d.id,
  name: d.name,
  originalName: d.originalName,
  mimeType: d.mimeType,
  size: Number(d.size),
  category: d.category,
  tags: d.tags ?? [],
  description: d.description,
  downloadCount: d.downloadCount,
  createdAt: d.createdAt?.toISOString() ?? null,
  updatedAt: d.updatedAt?.toISOString() ?? null,
});

export class DocumentService {
  // --------------------------------------------------------------------------
  // INITIALIZE STORAGE
  // --------------------------------------------------------------------------

  static async initializeStorage(): Promise<void> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log(`📁 Upload directory ready: ${UPLOAD_DIR}`);
  }

  // --------------------------------------------------------------------------
  // UPLOAD DOCUMENT
  // --------------------------------------------------------------------------

  static async uploadDocument(input: UploadDocumentInput): Promise<ServiceResponse> {
    if (input.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: 'File size exceeds maximum allowed (10MB)',
        error: 'FILE_TOO_LARGE',
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
      return {
        success: false,
        message: 'File type not allowed',
        error: 'INVALID_FILE_TYPE',
      };
    }

    const userDir = path.join(UPLOAD_DIR, input.userId);
    await fs.mkdir(userDir, { recursive: true });

    const ext = path.extname(input.originalName);
    const filename = `${uuidv4()}${ext}`;
    const storagePath = path.join(userDir, filename);

    await fs.writeFile(storagePath, input.buffer);

    const document = await prisma.document.create({
      data: {
        userId: input.userId,
        name: input.name || input.originalName,
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: BigInt(input.size),
        storagePath,
        storageType: 'local',
        category: input.category ?? 'other',
        tags: input.tags ?? [],
        description: input.description,
      },
    });

    return {
      success: true,
      message: 'Document uploaded successfully',
      data: { document: formatDocument(document) },
    };
  }

  // --------------------------------------------------------------------------
  // GET DOCUMENTS
  // --------------------------------------------------------------------------

  static async getDocuments(
    userId: string,
    options: { page?: number; limit?: number; category?: string; search?: string } = {}
  ): Promise<ServiceResponse> {
    const { page = 1, limit = 20, category, search } = options;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (category && category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { name:         { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { description:  { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          originalName: true,
          mimeType: true,
          size: true,
          category: true,
          tags: true,
          description: true,
          downloadCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.document.count({ where }),
    ]);

    return {
      success: true,
      message: 'Documents retrieved successfully',
      data: {
        documents: (documents as any[]).map(formatDocument),
        pagination: {
          current: page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET DOCUMENT BY ID
  // --------------------------------------------------------------------------

  static async getDocumentById(userId: string, documentId: string): Promise<ServiceResponse> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      return { success: false, message: 'Document not found', error: 'DOCUMENT_NOT_FOUND' };
    }

    return {
      success: true,
      message: 'Document retrieved successfully',
      data: { document: formatDocument(document) },
    };
  }

  // --------------------------------------------------------------------------
  // DOWNLOAD DOCUMENT
  // --------------------------------------------------------------------------

  static async downloadDocument(
    userId: string,
    documentId: string
  ): Promise<ServiceResponse<{ buffer: Buffer; filename: string; mimeType: string }>> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    }) as any;

    if (!document) {
      return { success: false, message: 'Document not found', error: 'DOCUMENT_NOT_FOUND' };
    }

    const buffer = await fs.readFile(document.storagePath);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        downloadCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Document ready for download',
      data: {
        buffer,
        filename: document.originalName,
        mimeType: document.mimeType,
      },
    };
  }

  // --------------------------------------------------------------------------
  // UPDATE DOCUMENT
  // --------------------------------------------------------------------------

  static async updateDocument(
    userId: string,
    documentId: string,
    updates: { name?: string; category?: string; tags?: string[]; description?: string }
  ): Promise<ServiceResponse> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    });

    if (!document) {
      return { success: false, message: 'Document not found', error: 'DOCUMENT_NOT_FOUND' };
    }

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        name: updates.name,
        category: updates.category,
        tags: updates.tags,
        description: updates.description,
      },
    });

    return {
      success: true,
      message: 'Document updated successfully',
      data: { document: formatDocument(updatedDocument) },
    };
  }

  // --------------------------------------------------------------------------
  // DELETE DOCUMENT
  // --------------------------------------------------------------------------

  static async deleteDocument(userId: string, documentId: string): Promise<ServiceResponse> {
    const document = await prisma.document.findFirst({
      where: { id: documentId, userId },
    }) as any;

    if (!document) {
      return { success: false, message: 'Document not found', error: 'DOCUMENT_NOT_FOUND' };
    }

    // Best-effort file deletion — don't fail if file is already gone
    try {
      await fs.unlink(document.storagePath);
    } catch {
      console.warn(`[DocumentService] File not found on disk: ${document.storagePath}`);
    }

    await prisma.document.delete({ where: { id: documentId } });
    return { success: true, message: 'Document deleted successfully' };
  }

  // --------------------------------------------------------------------------
  // GET STORAGE USAGE
  // --------------------------------------------------------------------------

  static async getStorageUsage(userId: string): Promise<ServiceResponse> {
    const [result, user] = await Promise.all([
      prisma.document.aggregate({
        where: { userId },
        _sum: { size: true },
        _count: true,
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { currentPlan: true },
      }),
    ]);

    const totalSize = Number(result._sum.size ?? 0);
    const plan = user?.currentPlan ?? 'free';
    const limit = STORAGE_LIMITS[plan] ?? STORAGE_LIMITS.free;

    return {
      success: true,
      message: 'Storage usage retrieved successfully',
      data: {
        used: totalSize,
        limit,
        usagePercentage: Math.round((totalSize / limit) * 10000) / 100,
        documentCount: result._count,
        plan,
      },
    };
  }
}

export default DocumentService;
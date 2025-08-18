import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Get upload directory from environment variable or use default
const getUploadDir = () => {
  if (process.env.UPLOAD_DIR) {
    return process.env.UPLOAD_DIR;
  }
  return path.join(process.cwd(), 'public', 'uploads');
};

// Get max file size from environment variable or use default (10MB)
const getMaxFileSize = () => {
  const envSize = process.env.MAX_FILE_SIZE;
  if (envSize) {
    const size = parseInt(envSize);
    return isNaN(size) ? 10 * 1024 * 1024 : size;
  }
  return 10 * 1024 * 1024; // 10MB default
};



// Helper function to get the correct public URL for a file
const getPublicFileUrl = (filename) => {
  // Return the URL that will be accessible from the browser
  // Use the new file serving API instead of direct public folder access
  return `/api/files/${filename}`;
};

export async function POST(req) {
  try {
    // For Next.js 15, we need to handle the request differently
    // Parse the form data manually since multer doesn't work directly with Next.js 15
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type ${file.type} not allowed` },
        { status: 400 }
      );
    }
    
    // Get upload directory
    const uploadDir = getUploadDir();
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.name);
    const filename = uniqueSuffix + ext;
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Check file size
    const maxSize = getMaxFileSize();
    if (buffer.length > maxSize) {
      return NextResponse.json(
        { success: false, error: `File size ${(buffer.length / 1024 / 1024).toFixed(2)}MB exceeds limit of ${(maxSize / 1024 / 1024).toFixed(2)}MB` },
        { status: 400 }
      );
    }
    
    // Save file
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    // Get the public URL for the file
    const publicUrl = getPublicFileUrl(filename);
    
    console.log('File uploaded successfully:', {
      originalName: file.name,
      filename: filename,
      size: buffer.length,
      mimetype: file.type,
      path: filePath,
      publicUrl: publicUrl
    });

    // Return success response with the correct public URL
    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      filename: filename,
      originalName: file.name,
      size: buffer.length,
      type: file.type,
      path: filePath
    });

  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Upload endpoint - use POST to upload files' });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

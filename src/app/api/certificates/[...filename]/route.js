import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request, { params }) {
  try {
    // Unwrap params for Next.js 15 compatibility
    const unwrappedParams = await params;
    const { filename } = unwrappedParams;
    
    // Handle catch-all route - filename is an array, join it
    const filenameString = Array.isArray(filename) ? filename.join('/') : filename;
    
    console.log(`Certificate request for: ${filenameString}`);
    console.log(`Current working directory: ${process.cwd()}`);
    
    // Construct the file path - prioritize VPS path since we know it exists
    const vpsPath = path.join('/var/www/arkaba', 'public', 'certificates', filenameString);
    const filePath = path.join(process.cwd(), 'public', 'certificates', filenameString);
    const altPath = path.join('/root/arkaba', 'public', 'certificates', filenameString);
    
    console.log(`VPS path: ${vpsPath}`);
    console.log(`Current working directory path: ${filePath}`);
    console.log(`Alternative path: ${altPath}`);
    
    // Check if file exists - prioritize VPS path since we know it exists
    let actualFilePath = vpsPath;
    if (fs.existsSync(vpsPath)) {
      console.log(`✅ File found at VPS path: ${vpsPath}`);
    } else if (fs.existsSync(filePath)) {
      actualFilePath = filePath;
      console.log(`✅ File found at current working directory path: ${filePath}`);
    } else if (fs.existsSync(altPath)) {
      actualFilePath = altPath;
      console.log(`✅ File found at alternative path: ${altPath}`);
    } else {
      console.error(`Certificate file not found at any path`);
      
      // List available certificates for debugging
      try {
        const certDir = path.join(process.cwd(), 'public', 'certificates');
        if (fs.existsSync(certDir)) {
          const files = fs.readdirSync(certDir);
          console.log(`Available certificates in primary dir: ${files.join(', ')}`);
        } else {
          console.log('Primary certificates directory does not exist');
        }
        
        // Try alternative directories
        const vpsCertDir = path.join('/var/www/arkaba', 'public', 'certificates');
        if (fs.existsSync(vpsCertDir)) {
          const files = fs.readdirSync(vpsCertDir);
          console.log(`Available certificates in VPS dir: ${files.join(', ')}`);
        }
        
        const altCertDir = path.join('/root/arkaba', 'public', 'certificates');
        if (fs.existsSync(altCertDir)) {
          const files = fs.readdirSync(altCertDir);
          console.log(`Available certificates in alt dir: ${files.join(', ')}`);
        }
      } catch (listError) {
        console.log('Could not list certificates directories:', listError.message);
      }
      
      return NextResponse.json({ 
        error: 'Certificate not found',
        requestedFile: filenameString,
        message: 'The requested certificate file does not exist on the server'
      }, { status: 404 });
    }
    
    console.log(`Certificate file found, serving: ${filenameString} from: ${actualFilePath}`);
    
    // Read the file
    let fileContent;
    try {
      fileContent = fs.readFileSync(actualFilePath, 'utf8');
      console.log(`File read successfully, size: ${Buffer.byteLength(fileContent)} bytes`);
    } catch (readError) {
      console.error(`Error reading file ${actualFilePath}:`, readError);
      return NextResponse.json({ 
        error: 'File read error',
        message: 'Could not read the certificate file'
      }, { status: 500 });
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filenameString).toLowerCase();
    let contentType = 'text/html'; // Default for HTML files
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    }
    
    console.log(`Serving file with content type: ${contentType}`);
    
    // Return the file with appropriate headers
    try {
      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(fileContent).toString(),
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (responseError) {
      console.error('Error creating response:', responseError);
      return NextResponse.json({ 
        error: 'Response creation error',
        message: 'Could not create the response'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error serving certificate:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

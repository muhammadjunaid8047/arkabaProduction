import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request, { params }) {
  try {
    const { filename } = params;
    
    // Remove .html extension if present and add .pdf
    const baseFilename = filename.replace('.html', '');
    const pdfFilename = `${baseFilename}.pdf`;
    
    console.log(`PDF Certificate request for: ${filename}`);
    console.log(`PDF filename: ${pdfFilename}`);
    
    // Construct the file paths
    const htmlFilePath = path.join(process.cwd(), 'public', 'certificates', filename);
    
    console.log(`HTML file path: ${htmlFilePath}`);
    
    // Check if HTML file exists
    if (!fs.existsSync(htmlFilePath)) {
      console.error(`HTML certificate file not found: ${htmlFilePath}`);
      return NextResponse.json({ 
        error: 'Certificate not found',
        message: 'The requested certificate file does not exist on the server'
      }, { status: 404 });
    }
    
    // Read the HTML content
    const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');
    
    // Create a modified HTML that includes PDF generation script
    const pdfReadyHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - PDF Download</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .download-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
        }
        .download-btn:hover { background: #0056b3; }
        .certificate-container { margin-top: 60px; }
    </style>
</head>
<body>
    <button class="download-btn" onclick="downloadPDF()">Download PDF</button>
    <div class="certificate-container">
        ${htmlContent.replace('<html>', '').replace('</html>', '').replace('<head>', '').replace('</head>', '').replace('<body>', '').replace('</body>', '')}
    </div>
    
    <script>
        function downloadPDF() {
            const element = document.querySelector('.certificate-container');
            const opt = {
                margin: 0,
                filename: '${pdfFilename}',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'landscape'
                }
            };
            
            html2pdf().set(opt).from(element).save();
        }
        
        // Auto-download after 1 second
        setTimeout(() => {
            downloadPDF();
        }, 1000);
    </script>
</body>
</html>`;
    
    // Return the PDF-ready HTML
    return new NextResponse(pdfReadyHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
      },
    });
    
  } catch (error) {
    console.error('Error serving PDF certificate:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 });
  }
}

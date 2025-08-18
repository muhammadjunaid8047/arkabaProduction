import puppeteer from "puppeteer";
import path from "path";
import { writeFile } from "fs/promises";

export async function generateCertificatePDF({ name, program, grade }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // HTML template for the certificate
  const certificateHTML = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 60px;
            text-align: center;
            background: #f9f9f9;
          }
          .certificate {
            border: 10px solid #0d6efd;
            padding: 40px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
          }
          h1 { font-size: 3rem; color: #0d6efd; }
          h2 { margin-top: 30px; font-size: 2rem; }
          p { font-size: 1.2rem; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>Certificate of Completion</h1>
          <h2>${name}</h2>
          <p>has successfully completed</p>
          <h2>${program}</h2>
          <p>with a grade of</p>
          <h2>${grade}</h2>
        </div>
      </body>
    </html>
  `;

  await page.setContent(certificateHTML, { waitUntil: "networkidle0" });

  const fileName = `${name}-${program}-${Date.now()}.pdf`.replace(/\\s+/g, "_");
  const filePath = path.join(process.cwd(), "public/certificates", fileName);

  await page.pdf({ path: filePath, format: "A4", printBackground: true });
  await browser.close();

  return `/api/certificates/${fileName}`;
}

import { NextResponse } from "next/server";

import { auth } from "@/app/api/auth/[...nextauth]/route";

import { connect } from "@/lib/mongodb/mongoose";

import Course from "@/lib/models/course";

import QuizResponse from "@/lib/models/quizResponse";

import { promises as fs } from "fs";

import path from "path";



export async function POST(req) {

  try {

    // Get user session to identify the user

    const session = await auth();

    

    const {

      courseId,

      answers,

      userId,

      studentName = "Anonymous User",

    } = await req.json();



    console.log("Quiz submission data:", {

      courseId,

      userId,

      studentName,

      userEmail: session?.user?.email,

    });



    if (!userId || !courseId || !answers) {

      return NextResponse.json(

        { error: "Missing required fields" },

        { status: 400 }

      );

    }



    await connect();

    const course = await Course.findById(courseId);

    if (!course) {

      return NextResponse.json({ error: "Course not found" }, { status: 404 });

    }



    const currentDate = new Date();

    if (course.expirationDate && course.expirationDate < currentDate) {

      return NextResponse.json(

        { error: "Course has expired" },

        { status: 410 }

      );

    }



    let score = 0;

    course.quiz.forEach((question, index) => {

      if (

        question.correctAnswer.trim().toLowerCase() ===

        answers[index]?.trim().toLowerCase()

      ) {

        score++;

      }

    });



    const passThreshold = 0.7;

    const passed = score / course.quiz.length >= passThreshold;



    let certificateUrl = null;
    if (passed) {
      try {
        // Always generate a new certificate with current information
        const timestamp = Date.now();
        const fileName = `certificate_${userId}_${courseId}_${timestamp}.html`;
        const filePath = path.join(
          process.cwd(),
          "public",
          "certificates",
          fileName
        );

        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Create HTML certificate with current information
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Continuing Education Certificate - ${course.title}</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: #333;
            min-height: 100vh;
        }
        .certificate {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 3px solid #1e40af;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
        }
        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            position: relative;
        }
        .main-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .provider-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            font-size: 18px;
            color: #374151;
        }
        .section {
            margin-bottom: 25px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #3b82f6;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
            background: #1e40af;
            color: white;
            padding: 12px;
            border-radius: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .field-row {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }
        .field {
            flex: 1;
        }
        .field-label {
            font-weight: bold;
            margin-bottom: 8px;
            display: block;
            color: #1e40af;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .field-value {
            border: 2px solid #e5e7eb;
            padding: 12px;
            background: white;
            min-height: 24px;
            border-radius: 6px;
            font-size: 16px;
            color: #374151;
        }
        .single-field {
            margin-bottom: 15px;
        }
        .signature-section {
            margin-top: 30px;
            border-top: 2px solid #d1d5db;
            padding-top: 20px;
        }
        .signature-row {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }
        .signature-field {
            flex: 2;
        }
        .date-field {
            flex: 1;
        }
        .score-section {
            margin-top: 30px;
            text-align: center;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #0ea5e9;
        }
        .score-text {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #0c4a6e;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .status-passed {
            background: #dcfce7;
            color: #166534;
            border: 2px solid #22c55e;
        }
        .status-failed {
            background: #fef2f2;
            color: #991b1b;
            border: 2px solid #ef4444;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            color: rgba(59, 130, 246, 0.1);
            font-weight: bold;
            pointer-events: none;
            z-index: 1;
        }
        .content {
            position: relative;
            z-index: 2;
        }
        .certificate-id {
            position: absolute;
            bottom: 10px;
            right: 20px;
            font-size: 10px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="watermark">CEU</div>
        <div class="content">
            <div class="header">
                <div class="main-title">Continuing Education Certificate</div>
                <div class="provider-info">
                    <div>Arkansas Association of Behavior Analysis</div>
                    <div>🎓</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Participant Information</div>
                <div class="field-row">
                    <div class="field">
                        <label class="field-label">Participant Name</label>
                        <div class="field-value">${studentName}</div>
                    </div>
                    <div class="field">
                        <label class="field-label">User Email</label>
                        <div class="field-value">${session?.user?.email || 'N/A'}</div>
                    </div>
                </div>
                <div class="field-row">
                    <div class="field">
                        <label class="field-label">BACB Certification Number</label>
                        <div class="field-value">${course.bacbNumber || 'N/A'}</div>
                    </div>
                    <div class="field">
                        <label class="field-label">Completion Date</label>
                        <div class="field-value">${new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Course Information</div>
                <div class="single-field">
                    <label class="field-label">Course Title</label>
                    <div class="field-value">${course.title}</div>
                </div>
                <div class="field-row">
                    <div class="field">
                        <label class="field-label">Content Type</label>
                        <div class="field-value">${course.contentType || 'Online Course'}</div>
                    </div>
                    <div class="field">
                        <label class="field-label">Duration</label>
                        <div class="field-value">Self-paced</div>
                    </div>
                </div>
                <div class="field-row">
                    <div class="field">
                        <label class="field-label">Total CEUs</label>
                        <div class="field-value">${course.totalCEUs || '0'}</div>
                    </div>
                    <div class="field">
                        <label class="field-label">Ethics CEUs</label>
                        <div class="field-value">${course.ethicsCEUs || '0'}</div>
                    </div>
                    <div class="field">
                        <label class="field-label">Supervision CEUs</label>
                        <div class="field-value">${course.supervisionCEUs || '0'}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Instructor & Coordinator Information</div>
                <div class="field-row">
                    <div class="field">
                        <label class="field-label">Instructor Name</label>
                        <div class="field-value">${course.instructorName || 'N/A'}</div>
                    </div>
                    <div class="field">
                        <label class="field-label">ACE Coordinator</label>
                        <div class="field-value">${course.coordinatorName || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">ACE Provider Information</div>
                <div class="field-row">
                    <div class="field">
                        <label class="field-label">Provider Name</label>
                        <div class="field-value">Arkansas Association of Behavior Analysis</div>
                    </div>
                    <div class="field">
                        <label class="field-label">Provider Number</label>
                        <div class="field-value">${course.providerNumber || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <div class="signature-section">
                <div class="signature-row">
                    <div class="signature-field">
                        <label class="field-label">ACE Provider Signature</label>
                        <div class="field-value">_________________________</div>
                    </div>
                    <div class="date-field">
                        <label class="field-label">Date</label>
                        <div class="field-value">${new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</div>
                    </div>
                </div>
            </div>

            <div class="score-section">
                <div class="score-text">
                    <strong>Quiz Score: ${score}/${course.quiz.length} (${Math.round((score / course.quiz.length) * 100)}%)</strong>
                </div>
                <div class="status-badge status-passed">
                    ✅ PASSED
                </div>
                <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
                    This certificate confirms successful completion of the course requirements.
                </p>
            </div>
            
            <div class="certificate-id">
                Certificate ID: ${userId}_${courseId}_${timestamp}
            </div>
        </div>
    </div>
</body>
</html>`;



        await fs.writeFile(filePath, htmlContent, "utf8");

        certificateUrl = `/api/certificates/${fileName}`;

        // Clean up old certificates for this user and course (optional)
        try {
          const oldCertificates = await fs.readdir(path.join(process.cwd(), "public", "certificates"));
          const oldCertPattern = new RegExp(`certificate_${userId}_${courseId}_\\d+\\.html`);
          
          for (const oldCert of oldCertificates) {
            if (oldCertPattern.test(oldCert) && oldCert !== fileName) {
              const oldCertPath = path.join(process.cwd(), "public", "certificates", oldCert);
              await fs.unlink(oldCertPath);
              console.log(`Cleaned up old certificate: ${oldCert}`);
            }
          }
        } catch (cleanupError) {
          console.log("Certificate cleanup failed (non-critical):", cleanupError);
        }

      } catch (certError) {

        console.error("Error generating certificate:", certError);

        // Continue without certificate if generation fails

        certificateUrl = null;

      }

    }



    // Check if there's an existing response for this user and course
    let existingResponse = await QuizResponse.findOne({ 
      userId, 
      courseId,
      studentEmail: session?.user?.email || null 
    });

    let response;
    if (existingResponse) {
      // Update existing response with new score and certificate
      existingResponse.score = score;
      existingResponse.total = course.quiz.length;
      existingResponse.passed = passed;
      existingResponse.certificateUrl = certificateUrl;
      existingResponse.certificateUpdatedAt = new Date();
      existingResponse.updatedAt = new Date();
      response = await existingResponse.save();
    } else {
      // Create new response
      response = await QuizResponse.create({
        userId,
        studentEmail: session?.user?.email || null, // Include user's email if logged in
        studentName,
        courseId,
        courseTitle: course.title,
        score,
        total: course.quiz.length,
        passed,
        certificateUrl,
        certificateUpdatedAt: new Date(),
      });
    }



    return NextResponse.json({

      message: "Quiz submitted",

      score,

      passed,

      certificateUrl,

    });

  } catch (error) {

    console.error(error);

    return NextResponse.json({ error: error.message }, { status: 500 });

  }

}



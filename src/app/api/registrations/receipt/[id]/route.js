import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Registration from "@/lib/models/registration";

export async function GET(request, { params }) {
  try {
    await connect();
    
    // Unwrap params for Next.js 15 compatibility
    const unwrappedParams = await params;
    
    const registration = await Registration.findById(unwrappedParams.id)
      .populate({
        path: 'eventRegistrationId',
        populate: {
          path: 'eventId',
          select: 'title date location'
        }
      });
    
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Generate receipt HTML
    const receiptHtml = generateReceiptHTML(registration);
    
    // Convert HTML to PDF (you can use libraries like puppeteer or jsPDF)
    // For now, we'll return HTML that can be printed or saved as PDF
    
    return new NextResponse(receiptHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="receipt-${registration._id}.html"`
      }
    });
    
  } catch (error) {
    console.error("Error generating receipt:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}

function generateReceiptHTML(registration) {
  const eventTitle = registration.eventRegistrationId?.eventId?.title || 'Event Registration';
  const eventDate = registration.eventRegistrationId?.eventId?.date ? 
    new Date(registration.eventRegistrationId.eventId.date).toLocaleDateString() : 'TBD';
  const eventLocation = registration.eventRegistrationId?.eventId?.location || 'TBD';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Registration Receipt</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .receipt {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
        }
        .receipt-title {
            font-size: 20px;
            color: #374151;
            margin-bottom: 5px;
        }
        .receipt-date {
            color: #6b7280;
            font-size: 14px;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 15px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
        }
        .info-label {
            font-weight: 500;
            color: #6b7280;
        }
        .info-value {
            color: #374151;
            text-align: right;
        }
        .amount {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
        }
        .status.completed {
            background-color: #dcfce7;
            color: #166534;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        .print-button {
            background-color: #dc2626;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            margin: 20px auto;
            display: block;
        }
        .print-button:hover {
            background-color: #b91c1c;
        }
        @media print {
            .print-button {
                display: none;
            }
            body {
                background-color: white;
            }
            .receipt {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="logo">ArkABA</div>
            <div class="receipt-title">Event Registration Receipt</div>
            <div class="receipt-date">Generated: ${new Date().toLocaleDateString()}</div>
        </div>
        
        <div class="section">
            <div class="section-title">Event Details</div>
            <div class="info-row">
                <span class="info-label">Event:</span>
                <span class="info-value">${eventTitle}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${eventDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${eventLocation}</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Registration Details</div>
            <div class="info-row">
                <span class="info-label">Registration ID:</span>
                <span class="info-value">${registration._id}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Registration Date:</span>
                <span class="info-value">${new Date(registration.registeredAt).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value">
                    <span class="status ${registration.paymentStatus}">${registration.paymentStatus === 'completed' ? 'Confirmed' : 'Failed'}</span>
                </span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Attendee Information</div>
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${registration.firstName} ${registration.lastName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${registration.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${registration.phone || 'Not provided'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Role:</span>
                <span class="info-value">${registration.membershipRole ? 
                  (registration.membershipRole === 'nonMember' ? 'Non-Member' : `${registration.membershipRole} Member`) :
                  (registration.userRole === 'nonMember' ? 'Non-Member' : `${registration.userRole} Member`)
                }</span>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="info-row">
                <span class="info-label">Amount Paid:</span>
                <span class="info-value amount">$${registration.amountPaid}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Payment Status:</span>
                <span class="info-value">
                    <span class="status ${registration.paymentStatus}">${registration.paymentStatus === 'completed' ? 'Paid' : 'Failed'}</span>
                </span>
            </div>
            ${registration.paymentIntentId ? `
            <div class="info-row">
                <span class="info-label">Payment ID:</span>
                <span class="info-value">${registration.paymentIntentId}</span>
            </div>
            ` : ''}
        </div>
        
        <button class="print-button" onclick="window.print()">Print Receipt</button>
        
        <div class="footer">
            <p>Thank you for registering with ArkABA!</p>
            <p>This receipt serves as proof of your registration and payment.</p>
            <p>For questions, please contact us at support@arkaba.org</p>
        </div>
    </div>
</body>
</html>
  `;
}

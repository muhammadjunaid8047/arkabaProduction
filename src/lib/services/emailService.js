import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEventRegistrationConfirmation = async (registration) => {
  try {
    // Import models at function level to avoid circular dependency issues
    const { connect } = await import("@/lib/mongodb/mongoose");
    const EventRegistration = (await import("@/lib/models/eventRegistration")).default;
    const Event = (await import("@/lib/models/event")).default;
    
    await connect();
    
    // Populate the registration with event data
    const populatedRegistration = await registration.populate([
      {
        path: 'eventRegistrationId',
        populate: {
          path: 'eventId',
          select: 'title date location'
        }
      }
    ]);
    
    // Get event data from populated registration or fetch directly if not available
    let eventTitle = 'Event Registration';
    let eventDate = 'TBD';
    let eventLocation = 'TBD';
    
    if (populatedRegistration.eventRegistrationId) {
      eventTitle = populatedRegistration.eventRegistrationId.title || 'Event Registration';
      
      if (populatedRegistration.eventRegistrationId.eventId) {
        const eventData = populatedRegistration.eventRegistrationId.eventId;
        eventDate = eventData.date ? new Date(eventData.date).toLocaleDateString() : 'TBD';
        eventLocation = eventData.location || 'TBD';
      }
    }
    
    // If population failed, try to fetch the data directly
    if (eventDate === 'TBD' || eventLocation === 'TBD') {
      try {
        const eventRegistration = await EventRegistration.findById(registration.eventRegistrationId)
          .populate('eventId', 'title date location');
        
        if (eventRegistration) {
          eventTitle = eventRegistration.title || eventTitle;
          
          if (eventRegistration.eventId) {
            eventDate = eventRegistration.eventId.date ? 
              new Date(eventRegistration.eventId.date).toLocaleDateString() : eventDate;
            eventLocation = eventRegistration.eventId.location || eventLocation;
          }
        }
      } catch (fetchError) {
        console.error("Error fetching event data for email:", fetchError);
      }
    }
    
    const subject = `Event Registration Confirmation - ${eventTitle}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Registration Confirmation</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  background-color: #dc2626;
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
              }
              .content {
                  background-color: #f9fafb;
                  padding: 30px;
                  border: 1px solid #e5e7eb;
              }
              .footer {
                  background-color: #f3f4f6;
                  padding: 20px;
                  text-align: center;
                  border-radius: 0 0 10px 10px;
                  border: 1px solid #e5e7eb;
                  border-top: none;
              }
              .success-icon {
                  font-size: 48px;
                  margin-bottom: 20px;
              }
              .event-details {
                  background-color: white;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #dc2626;
              }
              .registration-details {
                  background-color: white;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #10b981;
              }
              .payment-info {
                  background-color: white;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #3b82f6;
              }
              .amount {
                  font-size: 24px;
                  font-weight: bold;
                  color: #dc2626;
              }
              .status-badge {
                  display: inline-block;
                  background-color: #dcfce7;
                  color: #166534;
                  padding: 4px 12px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: 500;
              }
              .cta-button {
                  display: inline-block;
                  background-color: #dc2626;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 6px;
                  margin: 20px 0;
                  font-weight: 500;
              }
              .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin: 15px 0;
              }
              .info-item {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                  border-bottom: 1px solid #e5e7eb;
              }
              .info-label {
                  font-weight: 500;
                  color: #6b7280;
              }
              .info-value {
                  color: #374151;
              }
              @media (max-width: 600px) {
                  .info-grid {
                      grid-template-columns: 1fr;
                  }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="success-icon">✅</div>
              <h1>Registration Confirmed!</h1>
              <p>Thank you for registering with ArkABA</p>
          </div>
          
          <div class="content">
              <h2>Event Details</h2>
              <div class="event-details">
                  <h3 style="margin-top: 0; color: #dc2626;">${eventTitle}</h3>
                  <div class="info-grid">
                      <div class="info-item">
                          <span class="info-label">Date:</span>
                          <span class="info-value">${eventDate}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Location:</span>
                          <span class="info-value">${eventLocation}</span>
                      </div>
                  </div>
              </div>
              
              <h2>Registration Details</h2>
              <div class="registration-details">
                  <div class="info-grid">
                      <div class="info-item">
                          <span class="info-label">Registration ID:</span>
                          <span class="info-value" style="font-family: monospace;">${registration._id}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Registration Date:</span>
                          <span class="info-value">${new Date(registration.registeredAt).toLocaleDateString()}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Status:</span>
                          <span class="info-value">
                              <span class="status-badge">Confirmed</span>
                          </span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Attendee:</span>
                          <span class="info-value">${registration.firstName} ${registration.lastName}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Email:</span>
                          <span class="info-value">${registration.email}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Role:</span>
                          <span class="info-value">${registration.membershipRole ? 
                  (registration.membershipRole === 'nonMember' ? 'Non-Member' : `${registration.membershipRole} Member`) :
                  (registration.userRole === 'nonMember' ? 'Non-Member' : `${registration.userRole} Member`)
                }</span>
                      </div>
                  </div>
              </div>
              
              <h2>Payment Information</h2>
              <div class="payment-info">
                  <div class="info-grid">
                      <div class="info-item">
                          <span class="info-label">Amount Paid:</span>
                          <span class="info-value amount">$${registration.amountPaid}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Payment Status:</span>
                          <span class="info-value">
                              <span class="status-badge">Paid</span>
                          </span>
                      </div>
                  </div>
                  ${registration.paymentIntentId ? `
                  <div class="info-item">
                      <span class="info-label">Payment ID:</span>
                      <span class="info-value" style="font-family: monospace;">${registration.paymentIntentId}</span>
                  </div>
                  ` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://emergitechdev.in/'}/api/registrations/receipt/${registration._id}" 
                     class="cta-button">
                      Download Receipt
                  </a>
              </div>
              
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #1e40af;">Important Information</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                      <li>Please save this confirmation for your records</li>
                      <li>Bring this confirmation or receipt to the event</li>
                      <li>For questions, contact us at support@arkaba.org</li>
                  </ul>
              </div>
          </div>
          
          <div class="footer">
              <p style="margin: 0; color: #6b7280;">
                  <strong>ArkABA</strong><br>
                  Thank you for your registration!<br>
                  We look forward to seeing you at the event.
              </p>
          </div>
      </body>
      </html>
    `;
    
    const text = `
Event Registration Confirmation - ${eventTitle}

Dear ${registration.firstName} ${registration.lastName},

Thank you for registering for ${eventTitle}! Your registration has been confirmed.

EVENT DETAILS:
- Event: ${eventTitle}
- Date: ${eventDate}
- Location: ${eventLocation}

REGISTRATION DETAILS:
- Registration ID: ${registration._id}
- Registration Date: ${new Date(registration.registeredAt).toLocaleDateString()}
- Status: Confirmed
- Attendee: ${registration.firstName} ${registration.lastName}
- Email: ${registration.email}
- Role: ${registration.membershipRole ? 
                  (registration.membershipRole === 'nonMember' ? 'Non-Member' : `${registration.membershipRole} Member`) :
                  (registration.userRole === 'nonMember' ? 'Non-Member' : `${registration.userRole} Member`)
                }

PAYMENT INFORMATION:
- Amount Paid: $${registration.amountPaid}
- Payment Status: Paid
${registration.paymentIntentId ? `- Payment ID: ${registration.paymentIntentId}` : ''}

IMPORTANT:
- Please save this confirmation for your records
- Bring this confirmation or receipt to the event
- For questions, contact us at support@arkaba.org

Download your receipt: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://emergitechdev.in/'}/api/registrations/receipt/${registration._id}

Thank you for choosing ArkABA!

Best regards,
The ArkABA Team
    `;
    
    await transporter.sendMail({
      from: `"ArkABA Events" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: subject,
      html: html,
      text: text,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending registration confirmation email:", error);
    return { success: false, error: error.message };
  }
};

export const sendEventRegistrationReminder = async (registration) => {
  try {
    // Import models at function level to avoid circular dependency issues
    const { connect } = await import("@/lib/mongodb/mongoose");
    const EventRegistration = (await import("@/lib/models/eventRegistration")).default;
    
    await connect();
    
    // Populate the registration with event data
    const populatedRegistration = await registration.populate([
      {
        path: 'eventRegistrationId',
        populate: {
          path: 'eventId',
          select: 'title date location'
        }
      }
    ]);
    
    // Get event data from populated registration or fetch directly if not available
    let eventTitle = 'Event Registration';
    let eventDate = 'TBD';
    let eventLocation = 'TBD';
    
    if (populatedRegistration.eventRegistrationId) {
      eventTitle = populatedRegistration.eventRegistrationId.title || 'Event Registration';
      
      if (populatedRegistration.eventRegistrationId.eventId) {
        const eventData = populatedRegistration.eventRegistrationId.eventId;
        eventDate = eventData.date ? new Date(eventData.date).toLocaleDateString() : 'TBD';
        eventLocation = eventData.location || 'TBD';
      }
    }
    
    // If population failed, try to fetch the data directly
    if (eventDate === 'TBD' || eventLocation === 'TBD') {
      try {
        const eventRegistration = await EventRegistration.findById(registration.eventRegistrationId)
          .populate('eventId', 'title date location');
        
        if (eventRegistration) {
          eventTitle = eventRegistration.title || eventTitle;
          
          if (eventRegistration.eventId) {
            eventDate = eventRegistration.eventId.date ? 
              new Date(eventRegistration.eventId.date).toLocaleDateString() : eventDate;
            eventLocation = eventRegistration.eventId.location || eventLocation;
          }
        }
      } catch (fetchError) {
        console.error("Error fetching event data for reminder email:", fetchError);
      }
    }
    
    const subject = `Event Reminder - ${eventTitle} - Tomorrow!`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Reminder</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  background-color: #f59e0b;
                  color: white;
                  padding: 30px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
              }
              .content {
                  background-color: #f9fafb;
                  padding: 30px;
                  border: 1px solid #e5e7eb;
              }
              .footer {
                  background-color: #f3f4f6;
                  padding: 20px;
                  text-align: center;
                  border-radius: 0 0 10px 10px;
                  border: 1px solid #e5e7eb;
                  border-top: none;
              }
              .reminder-icon {
                  font-size: 48px;
                  margin-bottom: 20px;
              }
              .event-details {
                  background-color: white;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  border-left: 4px solid #f59e0b;
              }
              .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin: 15px 0;
              }
              .info-item {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                  border-bottom: 1px solid #e5e7eb;
              }
              .info-label {
                  font-weight: 500;
                  color: #6b7280;
              }
              .info-value {
                  color: #374151;
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="reminder-icon">📅</div>
              <h1>Event Tomorrow!</h1>
              <p>Don't forget your upcoming event</p>
          </div>
          
          <div class="content">
              <h2>Event Reminder</h2>
              <div class="event-details">
                  <h3 style="margin-top: 0; color: #f59e0b;">${eventTitle}</h3>
                  <div class="info-grid">
                      <div class="info-item">
                          <span class="info-label">Date:</span>
                          <span class="info-value">${eventDate}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Location:</span>
                          <span class="info-value">${eventLocation}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Attendee:</span>
                          <span class="info-value">${registration.firstName} ${registration.lastName}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Registration ID:</span>
                          <span class="info-value" style="font-family: monospace;">${registration._id}</span>
                      </div>
                  </div>
              </div>
              
              <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #92400e;">Reminder</h3>
                  <p style="margin: 0; color: #92400e;">
                      This event is happening tomorrow! Please make sure to:
                  </p>
                  <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
                      <li>Bring your confirmation or receipt</li>
                      <li>Arrive on time</li>
                      <li>Have your registration ID ready if needed</li>
                  </ul>
              </div>
          </div>
          
          <div class="footer">
              <p style="margin: 0; color: #6b7280;">
                  <strong>ArkABA</strong><br>
                  We look forward to seeing you at the event!<br>
                  For questions, contact us at support@arkaba.org
              </p>
          </div>
      </body>
      </html>
    `;
    
    const text = `
Event Reminder - ${eventTitle} - Tomorrow!

Dear ${registration.firstName} ${registration.lastName},

This is a friendly reminder that your event is happening tomorrow!

EVENT DETAILS:
- Event: ${eventTitle}
- Date: ${eventDate}
- Location: ${eventLocation}
- Attendee: ${registration.firstName} ${registration.lastName}
- Registration ID: ${registration._id}

REMINDER:
This event is happening tomorrow! Please make sure to:
- Bring your confirmation or receipt
- Arrive on time
- Have your registration ID ready if needed

We look forward to seeing you at the event!

For questions, contact us at support@arkaba.org

Best regards,
The ArkABA Team
    `;
    
    await transporter.sendMail({
      from: `"ArkABA Events" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: subject,
      html: html,
      text: text,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending event reminder email:", error);
    return { success: false, error: error.message };
  }
};

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
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://arkaba.org/'}/api/registrations/receipt/${registration._id}" 
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

Download your receipt: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://arkaba.org/'}/api/registrations/receipt/${registration._id}

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

// Contact Form Email Functions
export const sendContactFormEmails = async (contactData) => {
  try {
    const { firstName, lastName, email, message, isArkansasSupervisor } = contactData;
    
    // Send confirmation email to user
    const userEmailResult = await sendContactConfirmationToUser({
      firstName,
      lastName,
      email
    });
    
    // Send notification email to admin
    const adminEmailResult = await sendContactNotificationToAdmin({
      firstName,
      lastName,
      email,
      message,
      isArkansasSupervisor
    });
    
    return {
      success: userEmailResult.success && adminEmailResult.success,
      userEmail: userEmailResult,
      adminEmail: adminEmailResult
    };
  } catch (error) {
    console.error("Error sending contact form emails:", error);
    return { success: false, error: error.message };
  }
};

export const sendContactConfirmationToUser = async ({ firstName, lastName, email }) => {
  try {
    const subject = "Thank you for contacting ArkABA";
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">Thank You for Contacting Us!</h1>
          <p style="color: #666; font-size: 16px;">We've received your message and will get back to you shortly.</p>
        </div>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
          <p style="margin: 10px 0; color: #374151;">Thank you for reaching out to ArkABA. We have successfully received your contact form submission.</p>
          <p style="margin: 10px 0; color: #374151;">Our team will review your message and respond to you within 1-2 business days.</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e40af; margin-top: 0;">What happens next?</h3>
          <ul style="color: #374151; margin: 10px 0;">
            <li>Our team will review your inquiry</li>
            <li>We'll respond to your message within 1-2 business days</li>
            <li>If urgent, please call us directly</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666;">If you have any urgent questions, please don't hesitate to contact us directly.</p>
          <p style="color: #666; font-size: 14px;">Email: support@arkaba.org</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">Best regards,<br>The ArkABA Team</p>
        </div>
      </div>
    `;

    const text = `
Thank you for contacting ArkABA!

Hello ${firstName} ${lastName},

Thank you for reaching out to ArkABA. We have successfully received your contact form submission.

Our team will review your message and respond to you within 1-2 business days.

What happens next?
- Our team will review your inquiry
- We'll respond to your message within 1-2 business days
- If urgent, please call us directly

If you have any urgent questions, please don't hesitate to contact us directly.
Email: support@arkaba.org

Best regards,
The ArkABA Team
    `;
    
    await transporter.sendMail({
      from: `"ArkABA Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
      text: text,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending contact confirmation email:", error);
    return { success: false, error: error.message };
  }
};

export const sendContactNotificationToAdmin = async ({ firstName, lastName, email, message, isArkansasSupervisor }) => {
  try {
    const subject = `New Contact Form Submission from ${firstName} ${lastName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">New Contact Form Submission</h1>
          <p style="color: #666; font-size: 16px;">You have received a new message through the contact form.</p>
        </div>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-top: 0;">Contact Details</h2>
          <p style="margin: 10px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0;"><strong>Arkansas Supervisor:</strong> ${isArkansasSupervisor ? 'Yes' : 'No'}</p>
          <p style="margin: 10px 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #374151; margin-top: 0;">Message:</h3>
          <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">Please respond to this inquiry within 1-2 business days.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">ArkABA Contact Form System</p>
        </div>
      </div>
    `;

    const text = `
NEW CONTACT FORM SUBMISSION

Contact Details:
Name: ${firstName} ${lastName}
Email: ${email}
Arkansas Supervisor: ${isArkansasSupervisor ? 'Yes' : 'No'}
Submitted: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

Message:
${message}

Please respond to this inquiry within 1-2 business days.

ArkABA Contact Form System
    `;
    
    // Send to admin email - you'll need to define this in your environment variables
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    await transporter.sendMail({
      from: `"ArkABA Contact Form" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: subject,
      html: html,
      text: text,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending contact admin notification email:", error);
    return { success: false, error: error.message };
  }
};

// Get Involved Form Email Functions
export const sendGetInvolvedFormEmails = async (getInvolvedData) => {
  try {
    const { firstName, lastName, email, joinCommittee, planEvents, offerCEU, supportAdvocacy, otherInterest } = getInvolvedData;
    
    // Send confirmation email to user
    const userEmailResult = await sendGetInvolvedConfirmationToUser({
      firstName,
      lastName,
      email
    });
    
    // Send notification email to admin
    const adminEmailResult = await sendGetInvolvedNotificationToAdmin({
      firstName,
      lastName,
      email,
      joinCommittee,
      planEvents,
      offerCEU,
      supportAdvocacy,
      otherInterest
    });
    
    return {
      success: userEmailResult.success && adminEmailResult.success,
      userEmail: userEmailResult,
      adminEmail: adminEmailResult
    };
  } catch (error) {
    console.error("Error sending get involved form emails:", error);
    return { success: false, error: error.message };
  }
};

export const sendGetInvolvedConfirmationToUser = async ({ firstName, lastName, email }) => {
  try {
    const subject = "Thank you for your interest in getting involved with ArkABA!";
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">Thank You for Your Interest!</h1>
          <p style="color: #666; font-size: 16px;">We're excited about your willingness to get involved with ArkABA.</p>
        </div>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-top: 0;">Hello ${firstName} ${lastName},</h2>
          <p style="margin: 10px 0; color: #374151;">Thank you for submitting your "Get Involved" form. We greatly appreciate your willingness to contribute to our organization.</p>
          <p style="margin: 10px 0; color: #374151;">Our volunteer coordinator will review your interests and reach out to you with opportunities that match your availability and skills.</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e40af; margin-top: 0;">What happens next?</h3>
          <ul style="color: #374151; margin: 10px 0;">
            <li>Our volunteer coordinator will review your submission</li>
            <li>We'll match your interests with available opportunities</li>
            <li>You'll hear from us within 3-5 business days</li>
            <li>We'll provide details about volunteer opportunities that fit your interests</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666;">Thank you for your commitment to advancing our profession!</p>
          <p style="color: #666; font-size: 14px;">Email: support@arkaba.org</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">Best regards,<br>The ArkABA Team</p>
        </div>
      </div>
    `;

    const text = `
Thank you for your interest in getting involved with ArkABA!

Hello ${firstName} ${lastName},

Thank you for submitting your "Get Involved" form. We greatly appreciate your willingness to contribute to our organization.

Our volunteer coordinator will review your interests and reach out to you with opportunities that match your availability and skills.

What happens next?
- Our volunteer coordinator will review your submission
- We'll match your interests with available opportunities
- You'll hear from us within 3-5 business days
- We'll provide details about volunteer opportunities that fit your interests

Thank you for your commitment to advancing our profession!

Email: support@arkaba.org

Best regards,
The ArkABA Team
    `;
    
    await transporter.sendMail({
      from: `"ArkABA Volunteer Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
      text: text,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending get involved confirmation email:", error);
    return { success: false, error: error.message };
  }
};

export const sendGetInvolvedNotificationToAdmin = async ({ firstName, lastName, email, joinCommittee, planEvents, offerCEU, supportAdvocacy, otherInterest }) => {
  try {
    const subject = `New Get Involved Submission from ${firstName} ${lastName}`;
    
    // Create interests list
    const interests = [];
    if (joinCommittee) interests.push('Join a Committee');
    if (planEvents) interests.push('Plan Events');
    if (offerCEU) interests.push('Offer CEU Training');
    if (supportAdvocacy) interests.push('Support Advocacy');
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">New Get Involved Submission</h1>
          <p style="color: #666; font-size: 16px;">Someone wants to volunteer with ArkABA!</p>
        </div>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-top: 0;">Volunteer Details</h2>
          <p style="margin: 10px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0;"><strong>Submitted:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1e40af; margin-top: 0;">Areas of Interest:</h3>
          ${interests.length > 0 ? `
            <ul style="color: #374151; margin: 10px 0;">
              ${interests.map(interest => `<li>${interest}</li>`).join('')}
            </ul>
          ` : '<p style="color: #6b7280;">No specific areas selected</p>'}
        </div>
        
        ${otherInterest ? `
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">Other Interests:</h3>
            <p style="color: #374151; line-height: 1.6;">${otherInterest}</p>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">Please follow up with this volunteer within 3-5 business days.</p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">ArkABA Get Involved Form System</p>
        </div>
      </div>
    `;

    const text = `
NEW GET INVOLVED SUBMISSION

Volunteer Details:
Name: ${firstName} ${lastName}
Email: ${email}
Submitted: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

Areas of Interest:
${interests.length > 0 ? interests.map(interest => `- ${interest}`).join('\n') : '- No specific areas selected'}

${otherInterest ? `
Other Interests:
${otherInterest}
` : ''}

Please follow up with this volunteer within 3-5 business days.

ArkABA Get Involved Form System
    `;
    
    // Send to admin email - you'll need to define this in your environment variables
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    await transporter.sendMail({
      from: `"ArkABA Get Involved Form" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: subject,
      html: html,
      text: text,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending get involved admin notification email:", error);
    return { success: false, error: error.message };
  }
};
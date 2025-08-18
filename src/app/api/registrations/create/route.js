import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Registration from "@/lib/models/registration";
import EventRegistration from "@/lib/models/eventRegistration";
import { Member } from "@/lib/models/member.model";
import stripe from 'stripe';
import { sendEventRegistrationConfirmation } from "@/lib/services/emailService";

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    await connect();
    const body = await request.json();
    
    const { 
      eventRegistrationId,
      userId,
      userRole,
      firstName,
      lastName,
      email,
      phone,
      customFieldResponses,
      createPaymentIntent = false
    } = body;

    // Validate event registration exists and is active
    const eventRegistration = await EventRegistration.findById(eventRegistrationId)
      .populate('eventId');
    
    if (!eventRegistration || !eventRegistration.isActive) {
      return NextResponse.json(
        { error: "Event registration not found or not active" },
        { status: 404 }
      );
    }

    // Check if registration is still open
    const now = new Date();
    if (eventRegistration.registrationDeadline < now) {
      return NextResponse.json(
        { error: "Registration has closed" },
        { status: 410 }
      );
    }

    // Check if event is full
    if (eventRegistration.maxAttendees && 
        eventRegistration.currentAttendees >= eventRegistration.maxAttendees) {
      return NextResponse.json(
        { error: "Event is full" },
        { status: 410 }
      );
    }

    // Get the appropriate pricing
    // Map membership roles to event pricing roles
    const getEventPricingRole = (membershipRole) => {
      const roleMapping = {
        'studentbt': 'student',  // Map studentbt membership to student event pricing
        'full': 'full',
        'affiliate': 'affiliate',
        'nonMember': 'nonMember'
      };
      return roleMapping[membershipRole] || 'nonMember';
    };

    const eventPricingRole = getEventPricingRole(userRole);
    console.log('Role mapping:', { 
      originalRole: userRole, 
      mappedRole: eventPricingRole, 
      availablePricing: Object.keys(eventRegistration.pricing) 
    });
    
    const amountPaid = eventRegistration.pricing[eventPricingRole];
    if (!amountPaid && amountPaid !== 0) {
      return NextResponse.json(
        { error: `Invalid user role for pricing. Role: ${userRole}, Mapped to: ${eventPricingRole}` },
        { status: 400 }
      );
    }

    // Create the registration record
    const registration = new Registration({
      eventRegistrationId,
      eventId: eventRegistration.eventId._id,
      userId: userId || null,
      userRole: eventPricingRole, // Use the mapped role for event pricing
      membershipRole: userRole, // Store the original membership role for display purposes
      firstName,
      lastName,
      email,
      phone: phone || "",
      amountPaid,
      customFieldResponses: customFieldResponses || [],
      paymentStatus: 'completed' // Auto-complete since payment is included
    });

    // If payment is required (amount > 0), create payment intent
    if (amountPaid > 0 && createPaymentIntent) {
      try {
        const paymentIntent = await stripeClient.paymentIntents.create({
          amount: Math.round(amountPaid * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            type: 'event_registration',
            eventId: eventRegistration.eventId._id.toString(),
            eventRegistrationId: eventRegistrationId,
            userRole: eventPricingRole, // Use the mapped role for consistency
            email
          }
        });

        registration.paymentIntentId = paymentIntent.id;
        registration.paymentStatus = 'completed'; // Auto-complete since payment is successful

        await registration.save();

        // Send confirmation email
        try {
          await sendEventRegistrationConfirmation(registration);
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
          // Don't fail the registration if email fails
        }

        return NextResponse.json({
          success: true,
          registration,
          paymentIntent: {
            id: paymentIntent.id,
            client_secret: paymentIntent.client_secret
          }
        });

      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        return NextResponse.json(
          { error: "Failed to create payment intent" },
          { status: 500 }
        );
      }
    } else {
      // Free registration or just creating registration record
      registration.paymentStatus = amountPaid > 0 ? 'pending' : 'completed';
      await registration.save();

      // Update attendee count if registration is approved
      if (registration.registrationStatus === 'approved') {
        await EventRegistration.findByIdAndUpdate(eventRegistrationId, {
          $inc: { currentAttendees: 1 }
        });
      }

      // Send confirmation email
      try {
        await sendEventRegistrationConfirmation(registration);
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the registration if email fails
      }

      return NextResponse.json({
        success: true,
        registration
      });
    }

  } catch (error) {
    console.error("Error creating registration:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}

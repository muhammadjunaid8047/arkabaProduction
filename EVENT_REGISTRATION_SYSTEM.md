# Event Registration System

## Overview
Dynamic event registration system with role-based pricing and payment processing integration.

## Features

### 1. Dynamic Registration Pages
- Custom registration pages for each event
- Role-based pricing (Student, Full, Affiliate, Non-Member)
- Automatic user role detection when signed in
- Stripe payment integration for paid events
- Custom registration fields
- Registration deadline enforcement
- Attendee limits

### 2. Dashboard Management
- **Location**: `/dashboard/event-registrations`
- Create, edit, and delete registration pages
- Set pricing for all user roles
- Configure custom fields
- Manage registration settings
- View registration statistics

### 3. Smart Pricing Display
- **Signed-in users**: See their member pricing automatically
- **Non-members**: See non-member pricing with prompt to sign in
- **Pricing tiers**:
  - Student Members: Default $10
  - Full Members: Default $50  
  - Affiliate Members: Default $30
  - Non-Members: Default $100

### 4. Event Integration
- Events automatically show "Register Now" buttons when registration is enabled
- Home page slider updates to show registration links
- Events page displays registration status

## Usage

### For Administrators

1. **Create Event Registration**:
   - Go to Dashboard → Event Registrations
   - Click "Create Registration"
   - Select an event
   - Set pricing for each user role
   - Configure registration settings
   - Add custom fields if needed

2. **Manage Registrations**:
   - View all active registrations
   - Edit pricing and settings
   - Monitor attendee counts
   - Delete registrations (disables registration for event)

### For Users

1. **View Events**:
   - Visit `/events` to see all upcoming events
   - Events with registration show "Register Now" button
   - Events without registration show "Learn More" button

2. **Register for Events**:
   - Click "Register Now" on any event
   - Sign in for member pricing (optional for non-members)
   - Fill out registration form
   - Complete payment if required
   - Receive confirmation

3. **Pricing Benefits**:
   - Sign in to see personalized member pricing
   - Non-members see higher pricing with sign-in prompt
   - Free events show $0 pricing

## Database Models

### EventRegistration
```javascript
{
  eventId: ObjectId,           // Links to Event
  title: String,               // Registration page title
  description: String,         // Registration description
  pricing: {
    student: Number,           // Student member price
    full: Number,             // Full member price
    affiliate: Number,        // Affiliate member price
    nonMember: Number         // Non-member price
  },
  registrationDeadline: Date,  // When registration closes
  maxAttendees: Number,        // Attendee limit (null = unlimited)
  currentAttendees: Number,    // Current registrant count
  requiresApproval: Boolean,   // Manual approval required
  customFields: Array,         // Additional form fields
  isActive: Boolean           // Registration enabled/disabled
}
```

### Registration
```javascript
{
  eventRegistrationId: ObjectId, // Links to EventRegistration
  eventId: ObjectId,            // Links to Event
  userId: ObjectId,             // Links to Member (null for non-members)
  userRole: String,             // 'student', 'full', 'affiliate', 'nonMember'
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  amountPaid: Number,           // Amount charged
  paymentStatus: String,        // 'pending', 'completed', 'failed', 'refunded'
  paymentIntentId: String,      // Stripe payment intent ID
  registrationStatus: String,   // 'pending', 'approved', 'declined', 'cancelled'
  customFieldResponses: Array,  // Responses to custom fields
  registeredAt: Date,
  approvedAt: Date
}
```

## API Endpoints

### Admin Routes
- `POST /api/admin/event-registrations/create` - Create registration page
- `GET /api/admin/event-registrations/list` - List all registrations
- `GET /api/admin/event-registrations/[id]` - Get specific registration
- `PUT /api/admin/event-registrations/[id]` - Update registration
- `DELETE /api/admin/event-registrations/[id]` - Delete registration

### Public Routes
- `GET /api/event-registrations/[id]` - Get registration page data
- `POST /api/registrations/create` - Submit registration

## Integration Points

1. **Events System**: Automatically links registration pages to events
2. **User Authentication**: Detects user role for pricing
3. **Stripe Payments**: Processes payments for paid events
4. **Email System**: Ready for confirmation emails (template support)
5. **Dashboard**: Full admin interface for management

## Pricing Logic

```javascript
// User sees pricing based on their role
const userRole = session?.user?.role || "nonMember";
const price = eventRegistration.pricing[userRole];

// Non-members see prompt to sign in for better pricing
if (!session) {
  // Show "Sign in for member pricing" notice
}
```

## Registration Flow

1. User clicks "Register Now" on event
2. System loads registration page with event details
3. If not signed in, shows non-member pricing + sign-in prompt
4. If signed in, shows member pricing based on role
5. User fills out registration form
6. For paid events: Stripe payment processing
7. For free events: Immediate confirmation
8. Registration record created with appropriate status
9. Attendee count updated

## Security Features

- Registration deadline enforcement
- Attendee limit enforcement
- Payment verification via Stripe
- User role verification
- Input validation on all forms
- CSRF protection via Next.js

## Future Enhancements

- Email confirmations
- Registration analytics
- Bulk registration management
- Waitlist functionality
- Discount codes
- Group registrations

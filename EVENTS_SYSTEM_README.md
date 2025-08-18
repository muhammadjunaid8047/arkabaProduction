# Events System Implementation

## Overview
This implementation provides a comprehensive events management system for the ARKABA website with dynamic home banner integration.

## Features

### 1. Event Management (Admin Dashboard)
- **Location**: `/dashboard/event-management`
- **Features**:
  - Create, edit, and delete events
  - Upload background images via URL
  - Set event dates and locations
  - Mark events as banner events (appear in home slider)
  - Activate/deactivate events
  - Visual event cards with preview

### 2. Public Events Page
- **Location**: `/events`
- **Features**:
  - Display all upcoming events
  - Search and filter functionality
  - Responsive grid layout
  - Event details with images, dates, and locations
  - Call-to-action buttons

### 3. Dynamic Home Banner
- **Location**: Home page (`/`)
- **Features**:
  - Automatic integration of banner events
  - Slider functionality with auto-rotation
  - Dynamic content from database
  - Fallback to default slides if no banner events

## Database Schema

### Event Model (`src/lib/models/event.js`)
```javascript
{
  title: String (required),
  description: String (required),
  backgroundImage: String (required),
  date: Date (required),
  location: String (optional),
  isActive: Boolean (default: true),
  isBannerEvent: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Admin Routes
- `POST /api/admin/events/create` - Create new event
- `GET /api/admin/events/list` - List all events (admin view)
- `PUT /api/admin/events/update/[id]` - Update event
- `DELETE /api/admin/events/delete/[id]` - Delete event
- `POST /api/admin/events/seed` - Add sample events (testing)

### Public Routes
- `GET /api/events` - Get events with optional filters:
  - `?bannerOnly=true` - Only banner events
  - `?upcoming=true` - Only future events

## Usage Instructions

### For Administrators

1. **Access Event Management**:
   - Go to `/dashboard/event-management`
   - Use the "Add New Event" button to create events

2. **Creating Banner Events**:
   - Check "Show in Home Banner" when creating/editing events
   - Banner events will automatically appear in the home page slider

3. **Event Fields**:
   - **Title**: Event name
   - **Description**: Event details
   - **Background Image**: URL to event image
   - **Date**: Event date and time
   - **Location**: Event location (optional)
   - **Show in Home Banner**: Toggle for banner display
   - **Active**: Toggle event visibility

### For Users

1. **View Events**:
   - Visit `/events` to see all upcoming events
   - Use search and filter options

2. **Home Banner**:
   - Banner events automatically appear on the home page
   - Slider rotates through banner events and default content

## Testing

### Add Sample Data
To populate the system with sample events, make a POST request to:
```
POST /api/admin/events/seed
```

This will create 4 sample events including banner events for testing.

### Test URLs
- Home page: `/`
- Events page: `/events`
- Admin dashboard: `/dashboard/event-management`

## Technical Implementation

### Key Components
1. **Event Model**: MongoDB schema for event data
2. **Admin Interface**: React-based event management
3. **Public Interface**: Responsive events display
4. **Dynamic Banner**: Home page integration
5. **API Layer**: RESTful endpoints for CRUD operations

### State Management
- Events are fetched from the database on page load
- Banner events are automatically integrated into the home slider
- Real-time updates when events are modified

### Responsive Design
- Mobile-friendly event cards
- Adaptive grid layouts
- Touch-friendly navigation

## Security Considerations
- Admin routes should be protected with authentication
- Input validation on all forms
- Image URL validation for security
- Proper error handling throughout

## Future Enhancements
- Event registration system
- Email notifications for events
- Calendar integration
- Event categories and tags
- Advanced filtering options
- Event analytics and reporting 
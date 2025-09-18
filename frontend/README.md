# CallFlow - Call Management System

A comprehensive call management system built with React + Vite and Tailwind CSS.

## Features

### User Roles
- **HOST**: Main administrator who can create users and admins
- **ADMIN**: Can manage calls and assign workers (if allowed by HOST)
- **USER/WORKER**: Can add calls and complete assigned tasks

### Core Functionality
- **Customer Management**: Auto-fill customer details based on phone/email
- **Call Tracking**: Add, assign, and track customer calls
- **Real-time Updates**: Changes reflect across all users instantly
- **Role-based Permissions**: Different access levels for different roles
- **Task Assignment**: HOST/ADMIN can assign calls to workers
- **Status Tracking**: Track call status from pending to completed

### Call Management
- Add new customer calls with details (name, phone, email, address, problem, category)
- Auto-populate existing customer information
- Assign calls to specific workers
- Track who created, assigned, and completed each call
- Filter calls by status, assignment, and date

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── api/           # API client configuration
├── components/    # Reusable React components
├── pages/         # Page components
├── store/         # Zustand state management
├── App.jsx        # Main app component
└── main.jsx       # App entry point
```

## Key Components

- **Dashboard**: Main interface showing calls overview and management
- **AddCallForm**: Modal form for adding new customer calls
- **CallCard**: Individual call display with actions
- **UserManagement**: Admin interface for managing users
- **Login**: Authentication interface

## State Management

Uses Zustand for state management with persistence:
- **authStore**: User authentication and user management
- **callStore**: Call and customer data management

## API Integration

Configured to work with a backend API at `http://localhost:5000/api`
- Authentication endpoints
- User management endpoints  
- Call management endpoints
- Customer data endpoints

## Styling

Built with Tailwind CSS for responsive, modern UI design.
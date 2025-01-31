# Portal System Documentation

## Overview
The portal system is a secure customer-facing platform that allows customers to access their account information, track orders, view documents, and manage communications with MG Accountants.

## Authentication System

### Customer Authentication Flow
1. Customers log in using their email and passport number
2. Authentication is handled by `customerPortalStore.ts` which:
   - Validates credentials against Firestore database
   - Maintains customer session state
   - Manages loading and error states

### Security Features
- Email is case-insensitive (converted to lowercase)
- Passport numbers are standardized (converted to uppercase)
- Session persistence using browser local storage
- Automatic error handling and user feedback

## Portal Structure

### State Management
The portal uses a centralized state management system with the following stores:

1. `customerPortalStore.ts`
   - Manages customer authentication
   - Stores customer profile data
   - Handles orders, documents, and communications
   - Manages loading and error states

2. `communicationStore.ts`
   - Handles customer-staff messaging
   - Manages communication history

### Components

#### 1. CustomerPortal (`src/pages/CustomerPortal.tsx`)
Main portal component that:
- Handles authentication
- Manages tab navigation
- Renders different views based on authentication state
- Provides account information display

#### 2. Customer Details
- Displays customer profile information
- Shows order history
- Lists available documents
- Manages communications

## Data Model

### Customer Data
```typescript
interface Customer {
    id?: string
    name: string
    firstName?: string
    lastName?: string
    email?: string
    address?: string
    passportNumber?: string
    dateOfBirth?: Date
    companyName?: string
    phone?: string
    // ... additional fields
}
```

### Portal State
```typescript
interface CustomerPortalState {
    customer: Customer | null
    orders: Order[]
    documents: Document[]
    communications: Communication[]
    payments: Payment[]
    loading: boolean
    error: string | null
}
```

## Features

### 1. Order Tracking
- View all orders
- Track order status
- Access order details and history

### 2. Document Management
- View and download important documents
- Access statements and reports
- Secure document storage and retrieval

### 3. Communication System
- Direct messaging with staff
- Communication history
- Notification system for new messages

### 4. Payment Information
- View payment history
- Track outstanding balances
- Access payment documents

## Security Considerations

1. Authentication
   - Secure credential validation
   - Session management
   - Error handling for invalid credentials

2. Data Access
   - Role-based access control
   - Secure data fetching
   - Protected routes

3. Session Management
   - Automatic logout on inactivity
   - Secure session storage
   - Clear error handling

## Technical Implementation

### Firebase Integration
- Uses Firestore for data storage
- Real-time updates for communications
- Secure document storage

### State Management
- Centralized state using stores
- Reactive updates
- Error boundary implementation

### UI/UX Features
- Responsive design
- Dark mode support
- Loading states
- Toast notifications for user feedback

## Error Handling
- Invalid credentials
- Network errors
- Data loading failures
- Session expiration

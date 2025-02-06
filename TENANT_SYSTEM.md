# Tenant Management System Documentation

## Overview
The Tenant Management System is a comprehensive solution for managing tenants, their documents, and related information in the Brobondo System. It consists of several interconnected components that handle different aspects of tenant management.

## Core Components

### 1. Tenant Store (`tenantStore.ts`)
The central state management for tenant data using Zustand.

#### Key Features:
- **Tenant Interface**:
  ```typescript
  interface Tenant {
    id: string;
    name: string;
    email: string;
    phone: string;
    propertyId: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
  }
  ```

#### Operations:
- `initialize()`: Sets up real-time synchronization with Firestore
- `addTenant()`: Creates new tenant records
- `updateTenant()`: Modifies existing tenant information
- `deleteTenant()`: Removes tenant records

### 2. Tenant Document Store (`tenantDocumentStore.ts`)
Manages tenant-related documents and their lifecycle.

#### Document Types:
```typescript
type DocumentType = 'lease' | 'id' | 'passport' | 'proof_of_income' | 'other';
```

#### Key Features:
- Document upload and management
- Real-time document status tracking
- Document expiry management
- File type validation
- Integration with cloud storage

#### Operations:
- `initialize(tenantId)`: Loads documents for a specific tenant
- `uploadDocument()`: Handles document uploads with metadata
- `updateDocument()`: Modifies document information
- `deleteDocument()`: Removes documents

### 3. UI Components

#### TenantDetailsCard (`TenantDetailsCard.tsx`)
Displays and manages tenant information.

Features:
- Quick edit fields for tenant information
- Real-time validation
- Formatted date displays
- Responsive layout

#### TenantDocumentsCard (`TenantDocumentsCard.tsx`)
Manages tenant document display and operations.

Features:
- Document upload interface
- Document type selection
- Expiry date management
- Status indicators
- Delete functionality
- Toast notifications for operations

#### AddTenantModal (`AddTenantModal.tsx`)
Modal interface for adding new tenants.

Features:
- Form validation
- Field sanitization
- Success/error notifications
- Clean form reset after submission

## Data Flow

1. **Adding a New Tenant**:
   ```
   AddTenantModal → tenantStore.addTenant() → Firestore → Real-time update → UI
   ```

2. **Document Management**:
   ```
   TenantDocumentsCard → tenantDocumentStore.uploadDocument() → Cloud Storage → 
   Firestore → Real-time update → UI
   ```

3. **Tenant Information Updates**:
   ```
   TenantDetailsCard → tenantStore.updateTenant() → Firestore → Real-time update → UI
   ```

## Security and Validation

- All operations are protected by Firebase Authentication
- Document uploads have size and type restrictions
- Form inputs have client-side validation
- Real-time data synchronization ensures data consistency

## Best Practices

1. **Document Management**:
   - Always validate file types before upload
   - Set appropriate expiry dates for time-sensitive documents
   - Keep document descriptions clear and concise

2. **Tenant Information**:
   - Validate email and phone formats
   - Maintain consistent naming conventions
   - Regular updates of tenant status

3. **Error Handling**:
   - All operations have proper error handling
   - User-friendly error messages
   - Fallback UI states for loading and error conditions

## Technical Dependencies

- Firebase/Firestore for data storage
- Zustand for state management
- React for UI components
- Headless UI for modal dialogs
- Lucide React for icons
- TypeScript for type safety

## Performance Considerations

- Real-time listeners are properly cleaned up
- Document uploads are optimized
- Lazy loading of components
- Efficient state management with Zustand

## Future Enhancements

1. Batch document operations
2. Advanced search and filtering
3. Document version control
4. Automated document expiry notifications
5. Bulk tenant operations

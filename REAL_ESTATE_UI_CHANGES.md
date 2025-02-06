# Real Estate UI Customization Guide

## 1. Terminology Changes
Keep database fields the same but update UI labels and text:

| Current Term | New Real Estate Term |
|-------------|---------------------|
| Products | Properties |
| Orders | Listings |
| Customers | Clients |
| Price | Asking Price |
| Quantity | Square Footage |
| Categories | Property Types |
| Stock | Available Units |
| Suppliers | Developers/Agents |

## 2. Navigation Changes (Sidebar.tsx)
```tsx
const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Properties', icon: Home, href: '/products' }, // Keep route as /products
  { name: 'Clients', icon: Users, href: '/customers' }, // Keep route as /customers
  { name: 'Create Listing', icon: PlusCircle, href: '/orders' }, // Keep route as /orders
  { name: 'All Listings', icon: ClipboardList, href: '/orders/all' },
  { name: 'Payments', icon: CreditCard, href: '/payments' },
  { name: 'Activities', icon: Activity, href: '/activities' },
];
```

## 3. Form Field Changes

### Property Form (previously Product Form)
```tsx
// Keep field names same in database but update labels
const formFields = [
  { label: 'Property Title', name: 'name' },
  { label: 'Property Type', name: 'category' },
  { label: 'Asking Price', name: 'price' },
  { label: 'Square Footage', name: 'quantity' },
  { label: 'Location', name: 'description' },
  { label: 'Features', name: 'features' },
];

// Update category options
const propertyTypes = [
  'Residential',
  'Commercial',
  'Land',
  'Industrial',
  'Mixed Use'
];
```

### Client Form (previously Customer Form)
```tsx
const clientFields = [
  { label: 'First Name', name: 'firstName' },
  { label: 'Last Name', name: 'lastName' },
  { label: 'Email', name: 'email' },
  { label: 'Phone', name: 'phone' },
  { label: 'Interest', name: 'notes' }, // Buying/Selling/Renting
  { label: 'Budget Range', name: 'creditLimit' },
];
```

## 4. Status Updates
Update status labels in listings (keep values same in DB):

```tsx
const listingStatuses = {
  quotation: 'Draft',
  paid: 'Reserved',
  production: 'Under Contract',
  quality_control: 'Inspection',
  dispatch: 'Final Review',
  installation: 'Closing',
  completed: 'Sold'
};
```

## 5. Dashboard Metrics
Update dashboard card labels:

```tsx
const dashboardMetrics = [
  { label: 'Active Listings', value: totalListings },
  { label: 'Properties Sold', value: completedListings },
  { label: 'New Inquiries', value: newLeads },
  { label: 'Revenue (MTD)', value: formatCurrency(revenue) }
];
```

## 6. Property Card Changes
Update product card to property card display:

```tsx
<div className="property-card">
  <img src={imageUrl} alt={name} className="property-image" />
  <div className="property-details">
    <h3>{name}</h3>
    <div className="property-specs">
      <span>{formatCurrency(price)}</span>
      <span>{quantity} sqft</span>
    </div>
    <p className="property-location">{description}</p>
    <div className="property-status">
      {status === 'in_stock' ? 'Available' : 'Under Contract'}
    </div>
  </div>
</div>
```

## 7. Report Labels
Update report and export headers:

```tsx
const reportColumns = [
  { header: 'Property ID', accessor: 'id' },
  { header: 'Property Title', accessor: 'name' },
  { header: 'Location', accessor: 'description' },
  { header: 'Asking Price', accessor: 'price' },
  { header: 'Square Footage', accessor: 'quantity' },
  { header: 'Status', accessor: 'status' }
];
```

## 8. Icon Updates
Replace product-related icons with real estate icons:
```tsx
// Change from
import { Package, ShoppingCart } from 'lucide-react';
// To
import { Home, Building, Map, Key } from 'lucide-react';
```

## 9. Search Placeholders
Update search placeholder text:
```tsx
<input 
  type="search" 
  placeholder="Search properties by location, type, or features..."
  // ...
/>
```

## Implementation Notes
1. Keep all database field names and routes the same
2. Only update visible UI text and labels
3. No need to modify database queries or backend logic
4. Update any hardcoded text in error messages or notifications
5. Keep all existing functionality but rename user-facing elements

## Testing Checklist
- [ ] Verify all navigation items show correct labels
- [ ] Check all form labels and placeholders
- [ ] Verify status labels in listings
- [ ] Check export column headers
- [ ] Verify dashboard metric labels
- [ ] Test search functionality with new placeholders
- [ ] Check all error messages and notifications
- [ ] Verify property card displays
- [ ] Test report generation with new labels

# MG Accountants Customer Management System - Technical Documentation

## 1. System Architecture

### 1.1 Technology Stack
- Frontend Framework: React with TypeScript
- Build Tool: Vite
- State Management: Zustand
- Backend/Database: Firebase Firestore
- Authentication: Firebase Authentication
- Media Management: Cloudinary
- Messaging Integration: ManyChat
- Styling: Tailwind CSS
- Additional Libraries: 
  - React Router (Navigation)
  - React Hot Toast (Notifications)
  - Lucide React (Icons)
  - Date-fns (Date manipulation)
  - React Hook Form (Form handling)

### 1.2 Project Structure
```
src/
├── App.tsx                 # Main application component
├── main.tsx                # Entry point
├── components/             # Reusable UI components
│   ├── customers/          # Customer-related components
│   ├── expenses/           # Expense tracking components
│   ├── modals/             # Modal dialog components
│   ├── ui/                 # Base UI components
│   └── ...
├── config/                 # Configuration files
├── data/                   # Static data and mock data
├── hooks/                  # Custom React hooks
├── lib/                    # Core library and configuration
│   └── firebase.ts         # Firebase configuration
├── pages/                  # Page components
│   ├── CustomerDetails.tsx
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── ...
├── services/               # External service integrations
│   ├── manychat.ts         # ManyChat API service
│   └── cloudinary.ts       # Cloudinary upload service
├── store/                  # Zustand state management stores
│   ├── authStore.ts
│   ├── customerStore.ts
│   ├── orderStore.ts
│   ├── paymentStore.ts
│   └── ...
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── ...
└── styles/                 # Global styles
```

### 1.3 Key Application Modules

#### Authentication
- Secure user login and registration
- Role-based access control
- Firebase Authentication integration

#### Customer Management
- Create, update, and track customer information
- Order and revenue tracking
- Communication logging

#### Order Processing
- Create and manage customer orders
- Track order status and financials
- Product and pricing management

#### Expense Tracking
- Record and categorize expenses
- Generate expense reports
- Financial analysis

#### Reporting
- Generate financial reports
- Export data to various formats
- Dashboard analytics

## 2. Advanced Features

### 2.1 State Management
- Centralized state management using Zustand
- Efficient state updates
- Middleware for logging and error tracking

### 2.2 Data Synchronization
- Real-time updates with Firestore
- Optimistic UI updates
- Conflict resolution strategies

### 2.3 Performance Optimization
- Lazy loading of components
- Memoization of complex calculations
- Efficient rendering techniques

## 3. External Integrations

### 3.1 Firebase
- Firestore for real-time database
- Authentication services
- Cloud Functions (potential future use)

### 3.2 Cloudinary
- Media storage and management
- Image optimization
- Responsive image delivery

### 3.3 ManyChat
- Customer messaging
- Contact management
- Automated communication workflows

## 4. Security Considerations
- Firebase Authentication
- Role-based access control
- Input validation and sanitization
- Secure API key management
- HTTPS-only communication
- Protection against common web vulnerabilities

## 5. Deployment Strategies
- Supports multiple hosting platforms
  - Netlify
  - Vercel
  - Firebase Hosting
- CI/CD integration
- Environment-specific configurations

## 6. Monitoring and Logging
- Firebase Performance Monitoring
- Error tracking
- User activity logging
- Performance metrics collection

## 7. Scalability Considerations
- Modular architecture
- Microservices-ready design
- Horizontal scaling support
- Efficient data fetching strategies

## 8. Accessibility and Internationalization
- WCAG compliance considerations
- Support for multiple languages
- Responsive design
- Screen reader compatibility

## 9. Testing Strategies
- Unit testing with Jest
- Component testing with React Testing Library
- End-to-end testing with Cypress
- Continuous integration testing

## 10. Future Roadmap
- Advanced reporting features
- Machine learning-powered insights
- Enhanced third-party integrations
- Improved mobile responsiveness
- Advanced analytics dashboard

## 11. Development Setup

### 11.1 Prerequisites
- Node.js (v16+)
- npm or Yarn
- Firebase Account
- Cloudinary Account
- ManyChat Account

### 11.2 Local Development
```bash
# Clone the repository
git clone https://github.com/your-org/mg-accountants.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
```

### 11.3 Environment Variables
- Firebase Configuration
- Cloudinary Credentials
- ManyChat API Keys
- Other service-specific configurations

## 12. Troubleshooting
- Comprehensive error logging
- Detailed console output
- Fallback mechanisms
- Graceful error handling

## 13. Reports and Analytics

### 13.1 Reports Page Overview
The Reports page (`/reports`) provides comprehensive financial and operational analytics through various interactive charts, tables, and statistics. The page features a unified time range selector that allows users to analyze data across different periods:

- Today
- Yesterday
- Last 7 days
- Last 30 days
- Last 3 months
- Last 12 months
- Custom date range

### 13.2 Key Components

#### 13.2.1 Stats Overview Cards
Four key metric cards at the top of the page:
- **Total Revenue**: Shows total revenue for selected period with percentage change
- **Total Expenses**: Displays total expenses with percentage change
- **Active Customers**: Shows active customer count with growth rate
- **Tasks**: Displays pending tasks count with completed tasks summary

#### 13.2.2 Profit & Loss Table
Component: `ProfitLossTable`
- Detailed breakdown of revenue and expenses
- Calculates gross and net profit
- Shows percentage changes
- Supports all time range filters
- Categories include:
  - Revenue by product/service
  - Direct costs
  - Operating expenses
  - Other income/expenses

#### 13.2.3 Revenue Analysis Charts
1. **Revenue by Product** (`RevenueByProductChart`)
   - Bar chart showing revenue distribution by product
   - Interactive tooltips with detailed breakdowns
   - Sortable by revenue amount
   - Individual time range filter

2. **Revenue by Category** (`RevenueByCategoryChart`)
   - Pie chart showing revenue distribution by category
   - Percentage breakdown
   - Legend with absolute values
   - Individual time range control

#### 13.2.4 Expense Analysis
1. **Expense Type Chart** (`ExpenseTypeChart`)
   - Toggle between pie and bar chart views
   - Categories include:
     - Office supplies
     - Utilities
     - Rent
     - Salaries
     - Marketing
     - Travel
     - Software/Hardware
     - Professional services
   - Interactive legend
   - Percentage and absolute value display

2. **Expenses Table** (`ExpensesTable`)
   - Detailed list of all expenses
   - Sortable columns
   - Category filtering
   - Search functionality
   - Export capability

#### 13.2.5 Payment Methods Analysis
Component: `PaymentMethodsTable`
- Breakdown of payments by method:
  - Bank transfer
  - Cash
  - EcoCash
  - InnBucks
  - Online payment
- Shows:
  - Transaction count
  - Total amount
  - Average transaction value
  - Percentage of total

#### 13.2.6 Task Summary
Component: `TaskSummaryCard`
- Overview of task completion metrics
- Status distribution
- Priority breakdown
- Completion rate trends
- Team performance metrics

### 13.3 Data Flow and State Management

#### 13.3.1 Time Range Handling
- Global time range state in Reports page
- Individual component time ranges
- Custom date range picker integration
- Consistent date formatting using date-fns

#### 13.3.2 Data Fetching
- Real-time updates from Firestore
- Optimized query patterns
- Data caching and memoization
- Error handling and loading states

#### 13.3.3 Store Integration
The Reports page integrates with multiple Zustand stores:
- `useOrderStore`: Revenue and order statistics
- `useExpenseStore`: Expense tracking and analysis
- `useCustomerStore`: Customer metrics
- `useTaskStore`: Task management data

### 13.4 Performance Optimization
- Lazy loading of chart components
- Memoized calculations for complex metrics
- Efficient date range filtering
- Debounced updates for real-time data
- SVG-based charts for better performance

### 13.5 Accessibility Features
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader-friendly data tables
- Color contrast compliance
- Alternative text for charts

### 13.6 Export Capabilities
- CSV export for all tables
- PDF report generation
- Custom date range selection for exports
- Formatted data output

### 13.7 Future Enhancements
- Advanced filtering capabilities
- Custom report builder
- Additional chart types
- Predictive analytics
- Automated reporting schedules

---

**Last Updated:** $(date)
**Version:** 1.1.0

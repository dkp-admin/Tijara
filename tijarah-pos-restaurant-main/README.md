# Tijarah POS Restaurant - Developer Guide

## Overview

Tijarah POS Restaurant is a React Native Expo application designed for restaurant point-of-sale operations. The app supports multiple platforms (Android/iOS) with offline-first capabilities, real-time synchronization, and comprehensive restaurant management features.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  React Native Components │ Navigation │ Context Providers   │
│  - Billing & Checkout    │ - Stack    │ - Auth Context      │
│  - Table Management      │ - Tab      │ - Device Context    │
│  - Order Management      │ - Modal    │ - Cart Context      │
│  - Reports & Analytics   │            │                     │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  Services & Hooks        │ Utils & Helpers                  │
│  - Payment Service       │ - API Client                     │
│  - Print Service         │ - Data Transformers              │
│  - Table Management      │ - Validation Helpers             │
│  - Sync Service          │ - Error Handlers                 │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Local Database (SQLite) │ Remote API                       │
│  - Repository Pattern    │ - REST Endpoints                 │
│  - Schema Definitions    │ - Real-time Sync                 │
│  - Migration System      │ - Offline Queue                  │
│  - Transaction Support   │                                  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                    External Integrations                    │
├─────────────────────────────────────────────────────────────┤
│  Payment Gateways        │ Hardware Integration             │
│  - Nearpay SDK          │ - Thermal Printers               │
│  - STC Pay              │ - Cash Drawers                   │
│  - Card Terminals       │ - Barcode Scanners               │
│                         │ - Customer Displays              │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
tijarah-pos-restaurant/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── billing/         # Billing & checkout components
│   │   ├── customer-display/# Customer-facing display
│   │   ├── more/            # Settings & management
│   │   ├── print/           # Printing components
│   │   ├── products/        # Product management
│   │   ├── reports/         # Analytics & reporting
│   │   └── transactions/    # Transaction handling
│   │
│   ├── context/             # React Context providers
│   │   ├── auth-context.tsx # Authentication state
│   │   ├── cart-context.tsx # Shopping cart state
│   │   └── device-context.tsx # Device configuration
│   │
│   ├── db/                  # Database layer
│   │   ├── migrations/      # Database migrations
│   │   ├── repository/      # Data access repositories
│   │   ├── schema/          # Database schema definitions
│   │   └── index.ts         # Database initialization
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── use-auth.ts      # Authentication logic
│   │   ├── use-cart.ts      # Cart management
│   │   ├── use-printer.ts   # Printer integration
│   │   └── use-sync.ts      # Data synchronization
│   │
│   ├── navigation/          # Navigation configuration
│   │   ├── auth-navigation.tsx    # Auth flow navigation
│   │   ├── bottom-navigator.tsx   # Main tab navigation
│   │   ├── other-screens.tsx      # Modal/overlay screens
│   │   └── root-navigator.tsx     # Root navigation
│   │
│   ├── screens/             # Screen components
│   │   ├── authentication/ # Login & device setup
│   │   ├── billing/         # POS billing interface
│   │   ├── more/            # Settings & management
│   │   ├── orders/          # Order management
│   │   └── table-management/# Table operations
│   │
│   ├── services/            # Business logic services
│   │   ├── payment-service.ts     # Payment processing
│   │   ├── print-service.ts       # Printing operations
│   │   ├── sync-service.ts        # Data synchronization
│   │   └── table-management-service.ts # Table operations
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── api-types.ts     # API response types
│   │   ├── database-types.ts# Database entity types
│   │   └── navigation-types.ts # Navigation param types
│   │
│   └── utils/               # Utility functions
│       ├── api-client.ts    # HTTP client configuration
│       ├── constants.ts     # Application constants
│       ├── helpers.ts       # Common helper functions
│       └── validation.ts    # Input validation
│
├── assets/                  # Static assets
│   ├── images/             # App icons, logos, images
│   ├── fonts/              # Custom fonts
│   └── sounds/             # Notification sounds
│
├── plugins/                # Expo config plugins
│   ├── withCustomGradle.js # Custom Gradle configuration
│   └── withQueries.js      # Android queries configuration
│
├── scripts/                # Build & utility scripts
│   ├── localization-script.js # Translation management
│   └── generate-migration.js  # Database migration generator
│
├── config.ts               # Environment configuration
├── app.config.js           # Expo app configuration
├── eas.json               # EAS Build configuration
├── package.json           # Dependencies & scripts
└── .gitlab-ci.yml         # CI/CD pipeline
```

## Key Technologies

- **Framework**: React Native with Expo SDK
- **Database**: SQLite with custom repository pattern
- **State Management**: React Context + Custom hooks
- **Navigation**: React Navigation v6
- **Styling**: React Native StyleSheet + Theme system
- **Internationalization**: i18next
- **Payment Integration**: Nearpay SDK, STC Pay
- **Printing**: Custom thermal printer integration
- **Build System**: EAS Build
- **CI/CD**: GitLab CI

## Environment Configuration

The app supports multiple environments with different configurations:

### Environment Variables
```typescript
// config.ts
const hosts = {
  production: "https://be.tijarah360.com",
  qa: "https://qa-k8s.tisostudio.com",
};

const env = process.env.EXPO_PUBLIC_APP_ENV as keyof typeof hosts;
export const HOST = hosts[env] || hosts.qa;
```

### Build Profiles (eas.json)
- **development**: Development client with hot reload
- **preview**: Internal testing builds
- **qa**: QA environment builds
- **production**: Production releases

## Development Setup

### Prerequisites
- Node.js 18+
- Yarn package manager
- Expo CLI
- EAS CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd tijarah-pos-restaurant

# Install dependencies
yarn install

# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login
```

### Development Commands
```bash
# Start development server
yarn start

# Start with development client
yarn start --dev-client

# Run on Android
yarn android

# Run on iOS  
yarn ios

# Run on web
yarn web

# Generate translations
yarn i18-scan
yarn translate

# Generate database migration
yarn generate-migration
```

## Build & Deployment

### Development Builds
```bash
# Build development client (Android)
yarn build:dev-client

# Build preview version
yarn build:dev-preview
```

### QA Builds
```bash
# Set environment and build for QA
yarn build:qa
```

### Production Builds
```bash
# Build production release
yarn build:prod

# Create release version
yarn create-release
```

### CI/CD Pipeline

The GitLab CI pipeline automatically builds the app for different environments:

```yaml
# .gitlab-ci.yml
stages:
  - eas-build

eas-build:
  script:
    - npm i --global eas-cli
    - yarn
    - eas build --profile $CI_COMMIT_BRANCH --platform android --no-wait --non-interactive
  only:
    - main      # Production builds
    - development # Development builds  
    - qa        # QA builds
```

## Database Architecture

### Repository Pattern
```typescript
// Base repository with transaction support
export abstract class BaseRepository<T> {
  protected async runInTransaction<R>(
    operation: (db: SQLiteDatabase) => Promise<R>
  ): Promise<R> {
    // Transaction implementation with retry logic
  }
}

// Specific repositories
export class OrderRepository extends BaseRepository<Order> {
  async findActiveOrdersByTable(tableId: string): Promise<Order[]> {
    // Implementation
  }
}
```

### Migration System
```bash
# Generate new migration
yarn generate-migration -d ./src/db/migrations

# Migrations are automatically applied on app startup
```

## Key Services

### Payment Service
Centralized payment processing supporting multiple payment methods:
- Cash payments
- Card payments (Nearpay)
- Digital wallets (STC Pay)
- Credit payments

### Print Service  
Unified printing system supporting:
- Thermal printers (USB, Bluetooth, Network)
- Receipt printing
- KOT (Kitchen Order Ticket) printing
- Multiple printer routing

### Table Management Service
Robust table management with:
- Optimistic locking
- State validation
- Business rule enforcement
- Audit trails

### Sync Service
Offline-first synchronization:
- Background sync
- Conflict resolution
- Queue management
- Real-time updates

## Testing Strategy

### Unit Testing
```bash
# Run unit tests
yarn test

# Run with coverage
yarn test:coverage
```

### Integration Testing
- API integration tests
- Database repository tests
- Payment gateway tests

### E2E Testing
- Critical user flows
- Payment processing
- Offline scenarios

## Performance Considerations

### Optimization Techniques
- Lazy loading of components
- Memoization of expensive calculations
- Virtual lists for large datasets
- Image optimization
- Bundle splitting

### Memory Management
- Proper cleanup of event listeners
- Database connection pooling
- Cache management
- Background task optimization

## Security

### Data Protection
- Local database encryption
- Secure token storage (MMKV)
- API request signing
- PCI compliance for payments

### Access Control
- Role-based permissions
- Device authentication
- Session management
- Audit logging

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Clear Expo cache: `expo start --clear`
   - Reset node modules: `rm -rf node_modules && yarn`

2. **Database Issues**
   - Check migration files
   - Verify schema definitions
   - Review transaction boundaries

3. **Printer Connection**
   - Verify printer configuration
   - Check network connectivity
   - Review printer driver compatibility

4. **Payment Integration**
   - Validate API credentials
   - Check network connectivity
   - Review payment gateway logs

### Debug Tools
- Flipper integration
- React Native Debugger
- Expo Dev Tools
- Custom logging with Axiom

## Contributing

### Code Standards
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits
- Code review required

### Pull Request Process
1. Create feature branch
2. Implement changes with tests
3. Update documentation
4. Submit pull request
5. Code review and approval
6. Merge to development branch

## Support

For technical support or questions:
- Internal documentation: [Link to internal docs]
- Team Slack: #pos-development
- Issue tracker: GitLab Issues

## License

Proprietary - Tijarah 360
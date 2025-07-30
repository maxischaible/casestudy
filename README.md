# Supplier Management Platform

A comprehensive supplier sourcing and management platform that streamlines the procurement process from component specification to supplier selection and RFI generation.

## Project Overview

This application helps procurement teams and sourcing professionals efficiently find, evaluate, and manage suppliers for their component needs. It combines intelligent supplier matching with detailed comparison tools and automated RFI generation.

## Core Features

- **AI-Powered Supplier Search**: Natural language search and intelligent matching algorithms
- **Component Inventory Management**: Track and manage your component portfolio
- **Supplier Comparison**: Side-by-side comparison with scoring and ranking system
- **BOM Import**: Upload and process Bill of Materials for bulk sourcing
- **RFI Generation**: Automated Request for Information creation and management
- **Supplier Profiles**: Detailed supplier information with certifications and capabilities

## User Journey

### 1. Component Discovery & Search
- **Search Interface**: Users start by searching for components using part numbers, descriptions, or natural language queries
- **AI Search**: Advanced AI search understands context and finds relevant suppliers even with partial information
- **Filtering**: Apply filters by region, certifications, processes, materials, and capabilities

### 2. Supplier Evaluation
- **Match Results**: View supplier matches with compatibility scores and key metrics
- **Detailed Profiles**: Access comprehensive supplier information including:
  - Location and contact details
  - Certifications (ISO, AS9100, TS16949, etc.)
  - Manufacturing processes and capabilities
  - Quality metrics (on-time delivery, defect rates)
  - Capacity and lead times

### 3. Shortlist Management
- **Add to Shortlist**: Build a curated list of potential suppliers
- **Compare Side-by-Side**: Detailed comparison table with key metrics
- **Scoring System**: Customizable weighted scoring based on:
  - Price competitiveness
  - Quality performance
  - Delivery reliability
  - Certifications
  - Production capacity

### 4. Decision Making
- **Ranking Results**: Suppliers ranked by total weighted score
- **Export Capabilities**: Generate PDF reports for stakeholder review
- **RFI Creation**: Auto-generate professional Request for Information documents

### 5. Ongoing Management
- **Item Tracking**: Monitor component status, criticality, and supplier relationships
- **Portfolio Overview**: View total spend, active items, and critical components
- **Supplier Performance**: Track supplier performance over time

## Typical Workflow

1. **Start with Search**: Enter component requirements or upload BOM
2. **Review Matches**: Evaluate supplier suggestions with compatibility scores
3. **Build Shortlist**: Add promising suppliers to comparison list
4. **Compare & Score**: Use weighted criteria to rank suppliers
5. **Generate RFI**: Create professional procurement documents
6. **Make Decision**: Select supplier based on comprehensive analysis

## Key Benefits

- **Time Savings**: Reduce supplier research time from days to hours
- **Better Decisions**: Data-driven supplier selection with objective scoring
- **Risk Mitigation**: Comprehensive supplier vetting and quality metrics
- **Process Standardization**: Consistent evaluation criteria across all sourcing activities
- **Audit Trail**: Complete documentation of supplier selection process

## Technology Stack

- **Frontend**: React with TypeScript
- **UI**: shadcn-ui components with Tailwind CSS
- **State Management**: React Context for filters and application state
- **Routing**: React Router for navigation
- **Data Processing**: Client-side filtering, sorting, and matching algorithms
- **Export**: PDF generation for reports and RFI documents

## Getting Started

### Prerequisites
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

**Use Lovable**: Visit the [Lovable Project](https://lovable.dev/projects/5b71f3c7-355d-45cb-a5e6-628053cd8c7a) for visual editing and AI-powered development.

**Local Development**: Changes made locally will sync with Lovable automatically.

## Deployment

Deploy instantly via [Lovable](https://lovable.dev/projects/5b71f3c7-355d-45cb-a5e6-628053cd8c7a):
1. Open project in Lovable
2. Click Share → Publish
3. Optional: Connect custom domain via Project → Settings → Domains

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── lib/                # Utility functions and business logic
├── types/              # TypeScript type definitions
├── data/               # Sample data and seed functions
└── contexts/           # React context providers
```

## Contributing

This project uses modern React patterns with TypeScript for type safety. All components follow the shadcn-ui design system for consistent styling and user experience.
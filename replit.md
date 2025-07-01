# Personal Finance Tracker

## Project Overview
A comprehensive personal finance tracking web application with dynamic expense forms, conditional logic, and detailed reporting capabilities. Built with React, Express, and PostgreSQL.

## Architecture
- **Frontend**: React with TypeScript, TailwindCSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (currently using in-memory storage due to connection issues)
- **State Management**: TanStack React Query
- **Routing**: Wouter for client-side routing

## Recent Changes
- **2025-01-01**: Fixed syntax error in Categories component (mismatched JSX braces)
- **2025-01-01**: Added missing deleteSupermarket method to MemoryStorage class
- **2025-01-01**: Fixed method name inconsistencies in storage interface (getSupermarket → getSupermarkets)
- **2025-01-01**: Resolved runtime errors for supermarket CRUD operations
- **2025-01-01**: Fixed method name error in routes.ts (`addSupermarket` → `createSupermarket`)
- **2025-01-01**: Implemented temporary in-memory storage to resolve database connection issues
- **2025-01-01**: Fixed sidebar nested anchor tag warning by replacing `<a>` with `<div>`
- **2025-01-01**: Complete expense tracking system with dynamic forms and conditional logic

## Core Features
1. **Dynamic Expense Forms**: 
   - Routine vs Occasional expense categorization
   - Category-specific conditional fields (supermarkets, restaurants, services, etc.)
   - Real-time form validation with Zod schemas

2. **Dashboard**: 
   - Financial statistics overview
   - Recent expenses display
   - Category breakdown charts

3. **Reporting Pages**:
   - Monthly view with category breakdowns
   - Annual statistics with trending data
   - Detailed expense filtering and grouping

4. **Category Management**:
   - Manage routine categories and their sub-items
   - Create and manage occasional groups
   - Toggle group status (open/closed)

## Database Schema
- `expenses`: Main expense records with category relationships
- `occasional_groups`: Special event expense groupings
- Category tables: `supermarkets`, `restaurants`, `service_types`, etc.
- Support for all expense types with appropriate relationships

## Current Status
- ✅ Full application functionality working
- ✅ Dynamic expense forms with conditional logic
- ✅ All pages and navigation working
- ⚠️ Database temporarily using in-memory storage (to be resolved)
- ✅ Pre-populated sample data for testing

## Next Steps
- Resolve PostgreSQL database connection issues
- Switch back to persistent database storage
- Add data visualization charts for trends
- Implement data export functionality
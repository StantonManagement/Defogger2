# Defogger2 Task Management System

## Overview

Defogger2 is a comprehensive developer task management system designed to streamline the workflow from ideas to decisions to developer assignments and GitHub issues. The system provides an interface for managing task allocation, team workload monitoring, decision approval processes, and integrations with external services like OneDrive and GitHub. Built as a modern web application, it features a clean dashboard interface inspired by Linear's design principles with support for both light and dark themes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing without the complexity of React Router
- **State Management**: TanStack Query (React Query) for server state management, caching, and data synchronization
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interface elements
- **Styling**: Tailwind CSS with custom design system implementing Linear-inspired color palette and spacing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript for end-to-end type safety
- **Session Management**: Express-session with configurable storage backends
- **Authentication**: Microsoft MSAL (Microsoft Authentication Library) for OneDrive integration
- **API Design**: RESTful endpoints with structured error handling and logging middleware

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless hosting for scalable cloud deployment
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema**: User management system with extensible structure for task and project data
- **Migrations**: Drizzle Kit for database schema versioning and deployment

### Authentication and Authorization
- **OneDrive Integration**: OAuth 2.0 flow using Azure AD with Microsoft Graph API access
- **Session Storage**: Server-side session management with configurable persistence
- **Token Management**: Secure storage and refresh of access tokens for external service integrations
- **GitHub Integration**: Personal access token based authentication for repository operations

### Design System Implementation
- **Color System**: Comprehensive light/dark mode support with CSS custom properties
- **Typography**: Inter font family with precise hierarchy and spacing
- **Component Library**: Modular UI components with consistent styling and behavior patterns
- **Responsive Design**: Mobile-first approach with adaptive layouts for different screen sizes
- **Theme Management**: Client-side theme switching with localStorage persistence

## External Dependencies

### Microsoft Services
- **Azure Active Directory**: User authentication and authorization for OneDrive access
- **Microsoft Graph API**: File operations and user profile management in OneDrive
- **OneDrive**: Document storage and retrieval for task management workflows

### GitHub Integration
- **GitHub API**: Repository access, issue creation, and project management
- **Personal Access Tokens**: Secure authentication for GitHub operations
- **Issue Management**: Automated task-to-issue conversion with proper labeling and assignment

### Development Tools
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Vite**: Modern build tooling with hot module replacement and optimized bundling
- **TypeScript**: Static typing across the entire application stack
- **ESLint/Prettier**: Code quality and formatting consistency

### UI/UX Libraries
- **Radix UI**: Headless, accessible component primitives
- **Lucide React**: Consistent icon library with extensive symbol coverage
- **Tailwind CSS**: Utility-first styling with custom design token system
- **shadcn/ui**: Pre-built component library following modern design patterns

### Monitoring and Development
- **TanStack Query DevTools**: Development-time debugging for data fetching and caching
- **Replit Integration**: Cloud development environment with deployment capabilities
- **Session Management**: Connect-pg-simple for PostgreSQL session storage in production
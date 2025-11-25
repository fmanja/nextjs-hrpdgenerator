# Architecture Documentation

This document provides a comprehensive overview of the HR Position Description Generator architecture, design decisions, and system components.

## Table of Contents

- [System Overview](#system-overview)
- [High-Level Architecture](#high-level-architecture)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Key Design Decisions](#key-design-decisions)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Future Considerations](#future-considerations)

## System Overview

The HR Position Description Generator is a Next.js application that uses AWS Bedrock and Claude 3.5 Sonnet to generate professional federal government job descriptions. The application follows a client-server architecture with clear separation between presentation, business logic, and external services.

### Core Functionality

1. **User Input Collection**: Multi-step form collecting job details (title, department, pay scale, job family, series)
2. **Input Validation**: Client-side and server-side validation using Zod schemas
3. **AI Generation**: Server-side API route invokes AWS Bedrock to generate job descriptions
4. **Response Handling**: Type-safe response handling with error management
5. **User Experience**: Step-by-step UI with progress indicators, dark mode, and responsive design

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  React Component (HRPositionDescriptionGenerator.tsx) │  │
│  │  - Form state management                              │  │
│  │  - Client-side validation (Zod)                      │  │
│  │  - UI rendering & user interaction                   │  │
│  └──────────────────┬──────────────────────────────────┘  │
└──────────────────────┼──────────────────────────────────────┘
                       │ HTTP POST /api/generate-description
                       │ JSON: { jobTitle, department, ... }
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server Layer                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Next.js API Route (route.ts)                        │  │
│  │  - Request parsing & validation                      │  │
│  │  - Server-side validation (Zod)                     │  │
│  │  - Error handling                                    │  │
│  └──────────────────┬──────────────────────────────────┘  │
│                     │ AWS SDK                               │
│                     ▼                                       │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Bedrock Client (lib/bedrock.ts)                     │  │
│  │  - Lazy initialization                               │  │
│  │  - Credential management                             │  │
│  │  - Environment validation                            │  │
│  └──────────────────┬──────────────────────────────────┘  │
└──────────────────────┼──────────────────────────────────────┘
                       │ InvokeModelCommand
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  AWS Bedrock                                          │  │
│  │  - Claude 3.5 Sonnet Model                           │  │
│  │  - Model invocation & response                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

#### 1. HRPositionDescriptionGenerator (Main Component)
- **Location**: `components/HRPositionDescriptionGenerator.tsx`
- **Type**: Client Component (`'use client'`)
- **Responsibilities**:
  - Form state management
  - Client-side validation using Zod
  - API communication
  - UI rendering (multi-step form)
  - Error handling and user feedback
- **State Management**:
  - `formData`: Form input values
  - `formErrors`: Field-level validation errors
  - `generatedDescription`: AI-generated content
  - `isLoading`: Loading state
  - `currentStep`: Multi-step navigation

#### 2. ThemeProvider
- **Location**: `components/providers/theme-provider.tsx`
- **Type**: Context Provider
- **Responsibilities**:
  - Theme state management (light/dark/system)
  - localStorage persistence
  - System preference detection
  - DOM class manipulation for theme

#### 3. UI Components
- **ThemeToggle**: Theme switching component
- **Footer**: Application footer

### Backend Components

#### 1. API Route Handler
- **Location**: `app/api/generate-description/route.ts`
- **Type**: Next.js API Route (Server Component)
- **Responsibilities**:
  - HTTP POST request handling
  - Request body parsing
  - Server-side validation (Zod)
  - AWS Bedrock invocation
  - Response formatting
  - Error handling and HTTP status codes

#### 2. Bedrock Client
- **Location**: `lib/bedrock.ts`
- **Type**: Module with lazy initialization
- **Responsibilities**:
  - AWS Bedrock client configuration
  - Environment variable validation
  - Support for IAM roles and access keys
  - Lazy initialization (build-time safe)
  - Proxy pattern for runtime initialization

#### 3. Validation Layer
- **Location**: `lib/validation.ts`
- **Type**: Zod schema definitions
- **Responsibilities**:
  - Form data validation schema
  - API request validation schema
  - Type inference for TypeScript
  - Custom validation rules (OPM data validation)

#### 4. OPM Data
- **Location**: `lib/opm-data.ts`
- **Type**: Static data module
- **Responsibilities**:
  - OPM occupational groups data
  - Job series data by group
  - Data accessor functions

## Data Flow

### Request Flow

1. **User Input** → Form fields in React component
2. **Client Validation** → Zod schema validation (`jobDescriptionFormSchema`)
3. **API Request** → HTTP POST to `/api/generate-description`
4. **Server Validation** → Zod schema validation (`generateDescriptionRequestSchema`)
5. **Prompt Construction** → System and user prompts for Claude
6. **Bedrock Invocation** → `InvokeModelCommand` via AWS SDK
7. **Response Parsing** → Extract generated text from Bedrock response
8. **Client Update** → Update UI with generated description

### Error Flow

1. **Validation Errors** → Field-level errors returned to client
2. **AWS Errors** → Specific error handling (ResourceNotFoundException, AccessDeniedException)
3. **Generic Errors** → Fallback error handling with user-friendly messages
4. **Error Display** → User-friendly error messages in UI

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod 3.25

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes
- **AWS SDK**: @aws-sdk/client-bedrock-runtime 3.921.0
- **Validation**: Zod (shared with frontend)

### Infrastructure
- **AI Service**: AWS Bedrock (Claude 3.5 Sonnet)
- **Deployment**: AWS EC2 (or Vercel/Docker)
- **Build System**: Next.js with Turbopack

## Key Design Decisions

### 1. Lazy Initialization of Bedrock Client

**Decision**: Use Proxy pattern for lazy Bedrock client initialization

**Rationale**:
- Allows build-time execution without requiring AWS credentials
- Environment variables validated at runtime, not build time
- Supports both development and production builds

**Implementation**:
```typescript
export const bedrockClient = new Proxy({} as BedrockRuntimeClient, {
  get(_target, prop, receiver) {
    const client = getBedrockClient();
    // ... proxy implementation
  },
});
```

### 2. Dual Validation (Client + Server)

**Decision**: Validate inputs on both client and server

**Rationale**:
- Client-side: Immediate user feedback, better UX
- Server-side: Security, prevents invalid API calls
- Shared Zod schemas ensure consistency

### 3. Type-Safe API Communication

**Decision**: Use TypeScript interfaces for all API communication

**Rationale**:
- Compile-time type checking
- Better IDE support
- Reduced runtime errors
- Self-documenting code

### 4. Server-Side Only Credentials

**Decision**: No `NEXT_PUBLIC_` prefix for sensitive variables

**Rationale**:
- Prevents client-side exposure of AWS credentials
- Follows Next.js security best practices
- All sensitive operations happen server-side

### 5. Standalone Build Output

**Decision**: Configure Next.js for standalone output

**Rationale**:
- Smaller Docker images
- Faster deployments
- Only includes necessary files
- Optimized for production

### 6. Multi-Step UI

**Decision**: Implement step-by-step form interface

**Rationale**:
- Better user experience for complex forms
- Clear progress indication
- Reduces cognitive load
- Professional appearance

## Security Architecture

### Credential Management

```
┌─────────────────────────────────────┐
│  Environment Variables (.env.local) │
│  - AWS_ACCESS_KEY_ID                │
│  - AWS_SECRET_ACCESS_KEY            │
│  - AWS_REGION                       │
│  - BEDROCK_MODEL_ID                 │
└──────────────┬──────────────────────┘
               │ (Server-side only)
               ▼
┌─────────────────────────────────────┐
│  Bedrock Client (lib/bedrock.ts)     │
│  - Validates env vars at runtime     │
│  - Supports IAM roles (optional)     │
│  - Lazy initialization               │
└──────────────┬──────────────────────┘
               │ AWS SDK
               ▼
┌─────────────────────────────────────┐
│  AWS Bedrock                        │
└─────────────────────────────────────┘
```

### Security Layers

1. **Input Validation**: Zod schemas on client and server
2. **Type Safety**: TypeScript prevents type-related vulnerabilities
3. **Environment Isolation**: Server-side only credential access
4. **Security Headers**: Configured in `next.config.ts`
5. **Error Handling**: No sensitive information in error messages

### Security Headers

Configured in `next.config.ts`:
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

## Deployment Architecture

### Production Deployment (AWS EC2)

```
┌─────────────────────────────────────┐
│  Internet                            │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│  EC2 Instance                       │
│  ┌───────────────────────────────┐  │
│  │  Next.js Application          │  │
│  │  - Standalone build            │  │
│  │  - PM2 process manager         │  │
│  │  - Port 3000                   │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  IAM Role (optional)           │  │
│  │  - Bedrock access permissions  │  │
│  └───────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │ AWS SDK
               ▼
┌─────────────────────────────────────┐
│  AWS Bedrock                        │
│  - Claude 3.5 Sonnet                │
└─────────────────────────────────────┘
```

### Alternative Deployments

- **Vercel**: Serverless deployment with environment variables
- **Docker**: Containerized deployment with standalone build
- **Other Platforms**: Any Node.js hosting platform

## Project Structure

```
nextjs-hrpdgenerator/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── generate-description/
│   │       └── route.ts          # Main API endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── HRPositionDescriptionGenerator.tsx  # Main component
│   ├── providers/
│   │   └── theme-provider.tsx    # Theme context
│   └── ui/                       # UI components
│       ├── footer.tsx
│       └── theme-toggle.tsx
├── lib/                          # Business logic
│   ├── bedrock.ts                # AWS Bedrock client
│   ├── opm-data.ts               # OPM data
│   └── validation.ts             # Zod schemas
├── types/                        # TypeScript types
│   └── index.ts                  # Type definitions
├── public/                       # Static assets
├── .env.local                    # Environment variables (gitignored)
├── .env.example                  # Environment template
├── next.config.ts                # Next.js configuration
├── tailwind.config.js            # Tailwind configuration
└── package.json                  # Dependencies
```

## Data Models

### JobDescriptionFormData
```typescript
{
  jobTitle: string;        // 3-100 characters
  department: string;       // 2-100 characters
  payScaleGrade: string;    // Valid OPM pay scale
  jobFamily: string;        // Valid OPM group code
  series: string;           // Valid series for job family
}
```

### GenerateDescriptionResponse
```typescript
{
  success: boolean;
  description?: string;     // Generated job description
  error?: string;          // Error message if failed
}
```

## Error Handling Strategy

1. **Validation Errors**: Field-level errors with specific messages
2. **AWS Errors**: Specific handling for Bedrock errors
   - `ResourceNotFoundException`: Model not found
   - `AccessDeniedException`: Permission issues
3. **Generic Errors**: Fallback with user-friendly messages
4. **Type Safety**: Proper type guards for error handling

## Performance Considerations

1. **Lazy Loading**: Bedrock client initialized only when needed
2. **Build Optimization**: Standalone build reduces bundle size
3. **Static Generation**: Home page is statically generated
4. **API Route**: Dynamic server-side rendering for API
5. **Client-Side Validation**: Reduces unnecessary API calls

## Future Considerations

### Potential Enhancements

1. **Caching**: Cache generated descriptions
2. **Rate Limiting**: Implement API rate limiting
3. **Authentication**: Optional user authentication
4. **History**: Save and retrieve previous descriptions
5. **Export**: PDF/DOCX export functionality
6. **Templates**: Multiple job description templates
7. **Multi-language**: Support for multiple languages
8. **Analytics**: Usage tracking and analytics

### Scalability

- Current architecture supports horizontal scaling
- Stateless API routes enable load balancing
- Consider Redis for caching at scale
- Database integration for history/authentication features

---

**Last Updated**: November 2025  
**Version**: 0.1.0


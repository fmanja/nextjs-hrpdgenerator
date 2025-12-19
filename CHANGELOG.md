# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-23

### Added
- Initial release of HR Position Description Generator
- AI-powered job description generation using AWS Bedrock with Claude 3.5 Sonnet
- Next.js 16 application with TypeScript support
- Comprehensive form validation using Zod schemas
- OPM (Office of Personnel Management) job family and series data integration
- Support for multiple federal pay scales (GS-1 through GS-15, SES, ES-1 through ES-6, SL, ST, GM, GG, AD)
- Dark mode support with theme toggle
- Step-by-step UI with progress indicators
- Copy to clipboard functionality
- Field-level validation with user-friendly error messages
- Responsive design with Tailwind CSS
- Server-side API routes for secure AWS Bedrock integration
- Environment variable validation and lazy initialization
- Support for both AWS access keys and IAM roles
- Comprehensive error handling for AWS Bedrock API
- Type-safe API request/response handling
- Security headers configuration in Next.js
- Production-ready build configuration with standalone output
- Comprehensive documentation:
  - README.md with setup instructions
  - DEPLOYMENT.md with AWS EC2 deployment guide
  - CONTRIBUTING.md with contribution guidelines
  - CODE_OF_CONDUCT.md with community standards
  - QUICKSTART.md for quick setup
  - MIGRATION_SUMMARY.md documenting React to Next.js migration
- Open source preparation:
  - Apache 2.0 license
  - NOTICE file with attribution
  - GitHub issue and PR templates
  - Security best practices documentation

### Security
- All AWS credentials kept server-side only (no NEXT_PUBLIC_ prefix)
- Environment variables properly gitignored
- No hardcoded credentials or API keys
- Secure API route implementation
- Input validation on both client and server side
- Type-safe error handling

### Technical Details
- Migrated from Create React App to Next.js 15 (App Router)
- Migrated from JavaScript to TypeScript
- Migrated from OpenAI GPT-3.5 to AWS Bedrock (Claude 3.5 Sonnet)
- Replaced Express.js backend with Next.js API Routes
- Implemented lazy initialization for Bedrock client to support build-time execution
- Added comprehensive TypeScript types for all data structures
- Implemented Zod validation schemas for form and API validation
- Added React strict mode and production optimizations
- Configured standalone build output for efficient deployment

### Fixed
- Resolved TypeScript linting errors (replaced `any` types with proper types)
- Fixed React hooks violations in theme provider
- Improved error handling with proper type guards
- Enhanced type safety throughout the application

---

## [Unreleased]

### Changed
- Updated Next.js from 16.0.7 to 16.0.10

### Planned
- Additional job description templates
- Export functionality (PDF, DOCX)
- Job description history/saving
- User authentication (optional)
- Multi-language support
- Enhanced customization options

---

[0.1.0]: https://github.com/fmanja/nextjs-hrpdgenerator/releases/tag/v0.1.0


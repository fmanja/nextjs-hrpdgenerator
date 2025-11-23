# Contributing to HR Position Description Generator

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

- **Clear title and description** of the bug
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Environment details** (OS, Node.js version, etc.)
- **Screenshots** if applicable

### Suggesting Features

We welcome feature suggestions! Please open an issue with:

- **Clear description** of the feature
- **Use case** - why this feature would be useful
- **Possible implementation** approach (if you have ideas)

### Pull Requests

1. **Fork the repository** and clone your fork
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Test your changes**:
   ```bash
   npm run build
   npm run lint
   ```
5. **Commit your changes** with clear commit messages:
   ```bash
   git commit -m "Add: description of your change"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** on GitHub

### Commit Message Guidelines

We follow conventional commit format:

- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for updates to existing features
- `Docs:` for documentation changes
- `Refactor:` for code refactoring
- `Test:` for adding or updating tests

Example:
```
Add: support for additional pay scale grades
Fix: validation error in job family selection
Docs: update deployment instructions
```

## Development Setup

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/fmanja/nextjs-hrpdgenerator.git
   cd nextjs-hrpdgenerator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env.local`** (see `.env.example`):
   ```bash
   cp .env.example .env.local
   # Add your AWS credentials
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Run linting**:
   ```bash
   npm run lint
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow existing code style and patterns
- Add proper type annotations
- Avoid `any` types when possible

### Code Style

- Use 2 spaces for indentation
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small
- Follow existing file structure

### Testing

- Test your changes locally before submitting
- Ensure the build passes: `npm run build`
- Test with different input scenarios
- Verify error handling works correctly

## Project Structure

```
nextjs-hrpdgenerator/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── page.tsx           # Main page
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── bedrock.ts        # AWS Bedrock client
│   ├── opm-data.ts       # OPM job data
│   └── validation.ts     # Zod schemas
├── types/                 # TypeScript types
└── public/                # Static assets
```

## Areas for Contribution

We welcome contributions in these areas:

- **Bug fixes** - Fix any issues you encounter
- **Documentation** - Improve README, add examples, fix typos
- **Features** - Add new functionality (please discuss in issues first)
- **Performance** - Optimize code, reduce bundle size
- **Accessibility** - Improve a11y features
- **Testing** - Add tests or improve test coverage
- **UI/UX** - Improve user interface and experience

## Questions?

If you have questions about contributing:

1. Check existing [Issues](https://github.com/fmanja/nextjs-hrpdgenerator/issues) (replace YOUR_USERNAME with the actual repository owner)
2. Open a new issue with the `question` label
3. Review the [README.md](./README.md) for project overview

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing! 🎉


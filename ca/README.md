# Civic Complaints Management System

A comprehensive monorepo for managing civic complaints with separate admin and citizen portals.

## Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (see ENV_SETUP.md for details)
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   cd packages/db
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## Documentation

- [Environment Setup Guide](./ENV_SETUP.md) - Detailed environment variables configuration
- [Role Definitions](./ROLE_DEFINITIONS.md) - User roles and permissions
- [Setup Guide](./SETUP_GUIDE.md) - Comprehensive setup instructions
- [Completion Summary](./COMPLETION_SUMMARY.md) - Feature implementation status

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button"
```

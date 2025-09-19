# @workspace/db

Database package for the Civic Platform using Prisma ORM.

## Features

- PostgreSQL database with Prisma ORM
- Type-safe database operations
- Models for Users, Complaints, and Assignments
- Full TypeScript support

## Models

- **User**: Citizens, admins, and officers
- **Complaint**: Citizen complaints with status tracking
- **Assignment**: Officer assignments to complaints

## Usage

```typescript
import { prisma, User, Complaint } from '@workspace/db';

// Create a new user
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'citizen',
  },
});

// Find complaints
const complaints = await prisma.complaint.findMany({
  include: {
    user: true,
    assignments: {
      include: {
        officer: true,
      },
    },
  },
});
```

## Scripts

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio

## Environment Variables

Add to your `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/civic_db"
```

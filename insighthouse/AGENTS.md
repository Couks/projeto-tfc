# InsightHouse - Agent Instructions

## Project Overview

InsightHouse is a web analytics and event tracking platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL. The application allows users to track website interactions, analyze user behavior, and generate insights from collected data.

### Core Functionality
- **User Authentication**: Custom session-based authentication with secure password hashing
- **Site Management**: Multi-site tracking with domain management
- **Event Tracking**: Client-side SDK for capturing user interactions
- **Analytics Dashboard**: Real-time insights on user behavior, cities, prices, types, and more
- **Settings Management**: Configurable site settings and preferences

## Architecture

### Technology Stack
- **Framework**: Next.js 15.1+ with App Router (React Server Components)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS + Radix UI components
- **Validation**: Zod for runtime validation
- **Package Manager**: pnpm workspaces

### Project Structure
```
insighthouse/
  src/
    app/
      (admin)/        # Protected admin routes
        admin/
          dashboard/  # Analytics dashboards
          sites/      # Site management
          install/    # SDK installation guide
      api/            # API routes
        auth/         # Authentication endpoints
        insights/     # Analytics data endpoints
        sites/        # Site CRUD operations
        sdk/          # SDK loader and configuration
      login/          # Public login page
      register/       # Public registration page
    lib/
      components/     # Shared UI components
        ui/           # Radix UI components
      hooks/          # Custom React hooks
      auth.ts         # Authentication utilities
      db.ts           # Prisma client singleton
      site.ts         # Site utilities
    middleware.ts     # Route protection middleware
    utils/            # Pure utility functions
  prisma/
    schema.prisma     # Database schema
    migrations/       # Database migrations
  public/
    static/           # PostHog SDK files
  .cursor/
    rules/            # Cursor AI project rules
```

## Key Design Decisions

### 1. Authentication Strategy
- Custom session-based authentication using signed cookies
- HMAC-SHA256 for session signing
- Scrypt for password hashing (better than bcrypt for modern threats)
- No external auth providers (NextAuth, etc.) for simplicity

### 2. Server Components First
- Default to React Server Components for better performance
- Use Client Components only when necessary (interactivity, hooks)
- Data fetching happens in Server Components
- No prop drilling through client boundaries

### 3. API Route Organization
- RESTful conventions for resource routes
- Consistent error responses
- Zod validation for all inputs
- Authentication and authorization checks
- Proper HTTP status codes

### 4. Database Access
- Single Prisma client instance (singleton pattern)
- Always use `select` to limit returned fields
- Filter by `userId` for authorization
- Transactions for related operations
- Indexes on frequently queried fields

### 5. Type Safety
- Strict TypeScript configuration
- Zod for runtime validation
- No `any` types (use `unknown` if needed)
- Proper type inference from Prisma

## Working with This Project

### Adding a New Feature

1. **Define the Data Model** (if needed)
   - Update `prisma/schema.prisma`
   - Run `pnpm prisma migrate dev --name feature_name`

2. **Create API Routes**
   - Follow REST conventions
   - Use Zod for validation
   - Check authentication/authorization
   - See `@template-api-route` for examples

3. **Build UI Components**
   - Start with Server Components
   - Use Client Components for interactivity
   - Follow Tailwind organization patterns
   - See `@template-component` for examples

4. **Add to Dashboard**
   - Create page in `app/(admin)/admin/feature/`
   - Use existing UI components
   - Implement proper loading/error states

### Code Style Guidelines

**Naming Conventions**:
- Files: `ComponentName.tsx`, `route.ts`, `utils.ts`
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

**Import Order**:
1. React/Next.js
2. Third-party libraries
3. Internal components (`@ui/`, `@/lib/`)
4. Types
5. Relative imports

**Component Structure**:
1. Imports
2. Type definitions
3. Constants
4. Component function
5. Display name (Client Components)
6. Exports

### Common Patterns

**Fetching Data in Server Components**:
```typescript
export default async function Page() {
  const session = await getSession();
  const data = await prisma.model.findMany({
    where: { userId: session?.userId },
  });
  return <div>{/* render */}</div>;
}
```

**Protected API Route**:
```typescript
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  // ... rest of logic
}
```

**Form Validation**:
```typescript
const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
});

const parsed = schema.safeParse(data);
if (!parsed.success) {
  // Handle errors
}
```

## Security Considerations

### Authentication
- Always verify session in protected routes
- Use constant-time comparison for tokens
- Set proper cookie flags (`httpOnly`, `sameSite`)
- Never expose password hashes

### Authorization
- Filter database queries by `userId`
- Verify resource ownership before mutations
- Return 403 for unauthorized access (not 404)

### Input Validation
- Validate all user input with Zod
- Sanitize strings (trim, toLowerCase for emails)
- Limit file sizes and types
- Check for SQL injection in raw queries

### Data Exposure
- Use `select` to exclude sensitive fields
- Don't return full objects in API responses
- Sanitize error messages (no internal details)
- Log security events

## Performance Optimization

### Database
- Use indexes on frequently queried fields
- Implement pagination for large datasets
- Use `_count` instead of fetching all records
- Batch operations when possible

### Caching
- Use `cache: 'no-store'` for dynamic data
- Set `revalidate` for semi-static data
- Configure proper HTTP caching headers

### UI
- Lazy load heavy components
- Use Suspense for loading states
- Optimize images with Next.js Image
- Minimize client-side JavaScript

## Testing Strategy

### Unit Tests
- Test utility functions
- Test validation logic
- Test data transformations

### Integration Tests
- Test API routes
- Test component interactions
- Test authentication flows

### E2E Tests
- Test critical user journeys
- Test form submissions
- Test error handling

## Environment Variables

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection (for migrations)
- `NEXTAUTH_SECRET` - Secret for session signing (generate with `openssl rand -base64 32`)
- `SITE_URL` - Base URL of the application

## Development Workflow

1. **Start development server**: `pnpm dev`
2. **Make changes**: Follow project rules and patterns
3. **Test locally**: Verify functionality works
4. **Check types**: TypeScript should have no errors
5. **Run migrations**: `pnpm prisma migrate dev` (if schema changed)
6. **Commit**: Write clear commit messages

## Troubleshooting

### Common Issues

**Prisma Client Not Generated**:
```bash
pnpm prisma generate
```

**Database Connection Issues**:
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running
- Check network/firewall settings

**Type Errors**:
- Run `pnpm prisma generate` after schema changes
- Clear `.next` folder: `rm -rf .next`
- Restart TypeScript server

**Session Issues**:
- Verify `NEXTAUTH_SECRET` is set
- Check cookie settings in browser
- Clear browser cookies

## Getting Help

1. Check existing rules in `.cursor/rules/`
2. Review similar implementations in the codebase
3. Consult the documentation links in rules
4. Ask specific questions with context

## Rules Overview

The project includes comprehensive rules for:
- **Architecture**: Overall project structure and standards
- **React Components**: Component patterns and best practices
- **API Routes**: API endpoint conventions
- **Database/Prisma**: Database schema and query patterns
- **Authentication**: Security and auth patterns
- **TypeScript**: Type safety and utilities
- **Testing**: Test patterns and strategies
- **Documentation**: Code and API documentation
- **Templates**: Reusable templates for common patterns

These rules are automatically applied by Cursor AI based on file context.


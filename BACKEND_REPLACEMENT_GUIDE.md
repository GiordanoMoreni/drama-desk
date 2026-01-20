# Backend Replacement Guide

This guide explains how to replace Supabase with any other database/backend system while maintaining the clean architecture and multi-tenancy features of this application.

## Architecture Overview

The application follows Clean Architecture principles:

```
├── Domain Layer (Business Logic)
│   ├── entities/          # Domain models and business rules
│   └── repositories/      # Repository interfaces (contracts)
├── Application Layer (Use Cases)
│   ├── services/          # Application services
│   └── use-cases/         # Complex business operations
├── Infrastructure Layer (External Concerns)
│   ├── db/supabase/       # Current Supabase implementation
│   └── auth/             # Authentication infrastructure
└── Presentation Layer (UI)
    ├── app/              # Next.js pages and API routes
    └── components/       # React components
```

## Key Principles

1. **Dependency Inversion**: UI and Application layers depend only on abstractions (interfaces), not concrete implementations
2. **Infrastructure Isolation**: Database concerns are completely isolated in the infrastructure layer
3. **Multi-tenancy**: All domain entities include `organizationId` for tenant isolation
4. **Repository Pattern**: All data access goes through repository interfaces

## Replacing Supabase

### Step 1: Create New Infrastructure Implementation

1. Create a new directory in `src/infrastructure/db/` (e.g., `postgresql/`, `mongodb/`, `mysql/`)

2. Implement repository interfaces for your chosen database:

```typescript
// src/infrastructure/db/postgresql/student-repository.ts
import { StudentRepository } from '../../../domain/repositories';
import { Student, CreateStudentData, UpdateStudentData, StudentFilters } from '../../../domain/entities';

export class PostgreSQLStudentRepository implements StudentRepository {
  constructor(private db: DatabaseConnection) {}

  async findById(id: string, organizationId: string): Promise<Student | null> {
    // Your PostgreSQL implementation
  }

  async findAll(organizationId: string, filters?: StudentFilters): Promise<PaginatedResult<Student>> {
    // Your PostgreSQL implementation
  }

  // ... implement all other methods
}
```

### Step 2: Update Dependency Injection

Modify `src/lib/di.ts` to use your new implementations:

```typescript
// Before (Supabase)
import { SupabaseStudentRepository } from '../infrastructure/db/supabase/student-repository';

// After (PostgreSQL)
import { PostgreSQLStudentRepository } from '../infrastructure/db/postgresql/student-repository';
import { createDatabaseConnection } from '../infrastructure/db/postgresql/connection';

export class Container {
  // ... existing code ...

  getRepositories(): Repositories {
    const dbConnection = createDatabaseConnection();

    return {
      studentRepository: new PostgreSQLStudentRepository(dbConnection),
      // ... other repositories
    };
  }
}
```

### Step 3: Update Authentication System

Replace Supabase Auth with your chosen authentication system:

1. Update `src/lib/auth.ts` to work with your auth provider
2. Implement the same interface: `getCurrentUser()`, `getUserOrganizations()`, etc.
3. Update middleware to handle your auth tokens

### Step 4: Database Schema Migration

1. Convert the SQL schema in `database/schema.sql` to your target database
2. Implement Row Level Security equivalent in your database
3. Create migration scripts to transfer existing data

### Step 5: Update Environment Variables

Replace Supabase environment variables with your new backend's configuration:

```env
# Replace these:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# With your new backend variables:
DATABASE_URL=...
AUTH_JWT_SECRET=...
# etc.
```

## Multi-Tenancy Implementation

### Database Level (Recommended)

Implement tenant isolation at the database level:

**PostgreSQL with RLS:**
```sql
-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy for tenant isolation
CREATE POLICY "tenant_isolation" ON students
  FOR ALL USING (organization_id = current_tenant_id());
```

**MongoDB:**
```javascript
// Collection-level security
db.students.find({
  organizationId: session.organizationId
});
```

### Application Level (Fallback)

If database-level isolation isn't available:

```typescript
// In your repository implementation
async findAll(organizationId: string): Promise<Student[]> {
  const allStudents = await this.db.students.findAll();
  return allStudents.filter(s => s.organizationId === organizationId);
}
```

## Repository Interface Contracts

All repository implementations must adhere to these interfaces:

### StudentRepository
- `findById(id, organizationId)` - Get single student
- `findAll(organizationId, filters, pagination)` - Get paginated list
- `create(data, organizationId)` - Create new student
- `update(id, data, organizationId)` - Update existing student
- `delete(id, organizationId)` - Delete student
- `findByEmail(organizationId, email)` - Find by email within org

### OrganizationRepository
- `findById(id)` - Get organization
- `addMember(orgId, userId, role)` - Add user to organization
- `getMembers(orgId)` - Get organization members
- `getUserRole(orgId, userId)` - Get user's role in org

### ClassRepository & ClassEnrollmentRepository
- Similar patterns for classes and enrollments
- Include relationships between classes and students

### ShowRepository, RoleRepository, CastingRepository
- Complex relationships for theatre productions
- Role assignments and casting management

## Data Transformation

Handle database-specific data types in your repository implementations:

```typescript
// Supabase returns dates as strings
private mapRowToEntity(row: StudentRow): Student {
  return {
    ...row,
    dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Your database might return Date objects directly
private mapRowToEntity(row: StudentRow): Student {
  return {
    ...row,
    dateOfBirth: row.dateOfBirth, // Already a Date
    createdAt: row.createdAt,     // Already a Date
    updatedAt: row.updatedAt,     // Already a Date
  };
}
```

## Testing Your Implementation

1. **Unit Tests**: Test repository implementations in isolation
2. **Integration Tests**: Test with real database
3. **E2E Tests**: Test complete user workflows

Example test:
```typescript
describe('StudentRepository', () => {
  let repository: StudentRepository;

  beforeEach(() => {
    repository = new YourDatabaseStudentRepository(dbConnection);
  });

  it('should create and retrieve a student', async () => {
    const student = await repository.create(testData, organizationId);
    const retrieved = await repository.findById(student.id, organizationId);

    expect(retrieved).toEqual(student);
  });

  it('should enforce tenant isolation', async () => {
    await repository.create(testData, orgA);
    const result = await repository.findById(studentId, orgB);

    expect(result).toBeNull();
  });
});
```

## Migration Strategy

### Big Bang Migration
1. Implement new backend completely
2. Test thoroughly
3. Switch over during maintenance window
4. Migrate data in batches

### Phased Migration
1. Implement new repositories alongside existing ones
2. Use feature flags to route traffic
3. Migrate organizations one at a time
4. Gradually phase out old system

### Hybrid Approach
1. Keep Supabase for auth and some data
2. Migrate core entities to new backend
3. Maintain dual writes during transition
4. Switch auth system last

## Performance Considerations

1. **Indexing**: Ensure proper indexes on `organization_id` columns
2. **Connection Pooling**: Implement proper connection management
3. **Caching**: Consider Redis for frequently accessed data
4. **Pagination**: Implement cursor-based pagination for large datasets

## Security Considerations

1. **Input Validation**: Validate all inputs at application layer
2. **SQL Injection**: Use parameterized queries
3. **Authentication**: Implement proper JWT validation
4. **Authorization**: Enforce tenant isolation at all levels
5. **Audit Logging**: Log all data access and modifications

## Monitoring and Observability

1. **Database Metrics**: Monitor query performance and connection pools
2. **Error Tracking**: Implement comprehensive error logging
3. **Performance Monitoring**: Track response times and throughput
4. **Tenant Usage**: Monitor resource usage per organization

## Support and Maintenance

1. **Documentation**: Keep API documentation updated
2. **Versioning**: Implement API versioning strategy
3. **Backups**: Regular database backups and testing
4. **Disaster Recovery**: Plan for data recovery scenarios

This architecture ensures that your theatre management system remains maintainable, testable, and scalable regardless of the underlying database technology.
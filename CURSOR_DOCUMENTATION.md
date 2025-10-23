# Rwanda Cancer Relief - Cursor IDE Documentation

## Project Overview
This is a healthcare platform for Rwanda Cancer Relief that provides different user experiences for patients, counselors, and administrators. The platform uses a **simple single-app architecture** with role-based access control.

## Architecture Philosophy
- **Single Next.js App**: One codebase, one deployment, one database
- **Role-Based Access**: Different views based on user roles (patient, counselor, admin)
- **Simple & Scalable**: Easy to maintain and deploy, can scale up when needed
- **Healthcare-Focused**: HIPAA-compliant, secure, and user-friendly

## Project Structure
```
frontend/apps/web/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx             # Single login page
│   ├── dashboard/
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   ├── page.tsx               # Role-based dashboard home
│   │   ├── patient/page.tsx       # Patient dashboard
│   │   ├── counselor/page.tsx     # Counselor dashboard
│   │   └── admin/page.tsx         # Admin dashboard
│   └── api/                       # Backend API routes
├── components/
│   ├── dashboard/                 # Dashboard-specific components
│   ├── auth/                     # Authentication components
│   ├── ui/                       # Reusable UI components
│   └── forms/                    # Form components
├── lib/
│   ├── auth.ts                   # NextAuth configuration
│   ├── roles.ts                  # User roles and permissions
│   ├── db.ts                     # Database connection
│   └── utils.ts                  # Utility functions
└── types/
    └── index.ts                  # TypeScript type definitions
```

## User Roles & Permissions

### Patient Role
- **Access**: `/dashboard/patient/*`
- **Features**: View appointments, access resources, message counselors
- **Restrictions**: Cannot access counselor or admin areas

### Counselor Role
- **Access**: `/dashboard/counselor/*`
- **Features**: Manage patients, view appointments, access resources
- **Restrictions**: Cannot access admin areas

### Admin Role
- **Access**: `/dashboard/admin/*` (full access)
- **Features**: User management, analytics, system configuration
- **Restrictions**: None

## Key Implementation Guidelines

### 1. Authentication & Authorization
```typescript
// Always check user role before rendering components
const { data: session } = useSession();
const userRole = session?.user?.role;

// Use role-based access control
if (userRole === 'patient' && pathname.startsWith('/dashboard/admin')) {
  redirect('/dashboard/patient');
}
```

### 2. Dashboard Layout
- **Sidebar Navigation**: Show different menu items based on user role
- **Header**: User info, notifications, logout
- **Main Content**: Role-specific dashboard content
- **Responsive**: Mobile-friendly design

### 3. Component Structure
```typescript
// Example dashboard component
export default function PatientDashboard() {
  const { data: session } = useSession();
  
  if (session?.user?.role !== 'patient') {
    return <Unauthorized />;
  }
  
  return (
    <div>
      <h1>Patient Dashboard</h1>
      {/* Patient-specific content */}
    </div>
  );
}
```

### 4. API Routes
```typescript
// app/api/example/route.ts
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Role-based data access
  if (session.user.role === 'patient') {
    // Return patient-specific data
  }
  
  return Response.json({ data: 'success' });
}
```

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **UI Components**: Custom components + shadcn/ui
- **Deployment**: Vercel (recommended) or Railway

## Development Guidelines

### 1. File Naming Conventions
- **Pages**: `page.tsx` (Next.js App Router)
- **Layouts**: `layout.tsx`
- **Components**: PascalCase (e.g., `PatientDashboard.tsx`)
- **Utilities**: camelCase (e.g., `authUtils.ts`)

### 2. Import Organization
```typescript
// 1. React imports
import React from 'react';
import { useState, useEffect } from 'react';

// 2. Next.js imports
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// 3. Third-party imports
import { Button } from '@/components/ui/button';

// 4. Local imports
import { PatientCard } from '@/components/dashboard/PatientCard';
import { authOptions } from '@/lib/auth';
```

### 3. TypeScript Usage
```typescript
// Always define types for user data
interface User {
  id: string;
  email: string;
  role: 'patient' | 'counselor' | 'admin';
  name: string;
  createdAt: Date;
}

// Use proper typing for API responses
interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}
```

### 4. Error Handling
```typescript
// Always handle errors gracefully
try {
  const response = await fetch('/api/patients');
  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly error message
}
```

## Security Considerations

### 1. Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **HTTPS**: Force HTTPS in production
- **Input Validation**: Validate all user inputs
- **SQL Injection**: Use parameterized queries

### 2. Access Control
- **Role Verification**: Always verify user role on server-side
- **Route Protection**: Use middleware for route protection
- **Data Filtering**: Return only data user is authorized to see

### 3. Healthcare Compliance
- **Audit Logs**: Log all data access
- **Data Retention**: Implement data retention policies
- **Consent Management**: Track user consent

## Deployment Configuration

### 1. Environment Variables
```bash
# Required environment variables
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### 2. Build Configuration
```javascript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['your-domain.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

## Common Patterns

### 1. Role-Based Component Rendering
```typescript
function DashboardContent() {
  const { data: session } = useSession();
  
  switch (session?.user?.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'counselor':
      return <CounselorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <LoginPrompt />;
  }
}
```

### 2. Protected API Routes
```typescript
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Role-specific logic
  const data = await getDataForRole(session.user.role);
  return Response.json({ data });
}
```

### 3. Form Handling
```typescript
function PatientForm() {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        // Success handling
      }
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}
```

## Testing Strategy

### 1. Unit Tests
- Test individual components
- Test utility functions
- Test API routes

### 2. Integration Tests
- Test user flows
- Test role-based access
- Test API endpoints

### 3. E2E Tests
- Test complete user journeys
- Test cross-browser compatibility
- Test mobile responsiveness

## Performance Optimization

### 1. Code Splitting
- Use dynamic imports for large components
- Implement lazy loading for dashboard sections

### 2. Caching
- Implement Redis for session storage
- Use Next.js built-in caching for static data

### 3. Database Optimization
- Use proper indexing
- Implement connection pooling
- Use prepared statements

## Monitoring & Analytics

### 1. Error Tracking
- Implement error boundaries
- Use Sentry for error monitoring
- Log all errors with context

### 2. Performance Monitoring
- Track Core Web Vitals
- Monitor API response times
- Track user engagement

### 3. Business Metrics
- Track user registrations
- Monitor feature usage
- Track conversion rates

## Maintenance Guidelines

### 1. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update Next.js regularly

### 2. Code Quality
- Use ESLint and Prettier
- Implement pre-commit hooks
- Regular code reviews

### 3. Documentation
- Keep this documentation updated
- Document new features
- Maintain API documentation

## Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up environment variables**
4. **Run database migrations**
5. **Start development server**: `npm run dev`

## Support & Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **NextAuth.js Documentation**: https://next-auth.js.org
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs

---

**Note**: This documentation should be updated as the project evolves. Always refer to this document when making architectural decisions or implementing new features.

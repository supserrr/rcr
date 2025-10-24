# Rwanda Cancer Relief - Role-Based Dashboard Interface

A comprehensive role-based dashboard interface built with Next.js, React, Tailwind CSS, and shadcn/ui components.

## Features

### 🎯 Role-Based Access
- **Patient Dashboard**: Module progress, counselor directory, resources, sessions, chat, AI assistant
- **Counselor Dashboard**: Patient management, session scheduling, resource library, professional AI assistant
- **Admin Dashboard**: User management, support tickets, system monitoring, platform settings

### 🎨 Modern UI/UX
- Responsive design that works on all devices
- Clean, accessible interface following shadcn/ui best practices
- Dark/light theme support
- Intuitive navigation with role-specific menus

### 🔧 Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Icons**: Lucide React
- **State Management**: React hooks and context
- **Routing**: Next.js App Router

## Project Structure

```
app/
├── dashboard-demo/          # Main demo page
├── dashboard/               # Role-based dashboard routes
│   ├── patient/            # Patient dashboard pages
│   ├── counselor/          # Counselor dashboard pages
│   └── admin/              # Admin dashboard pages
└── components/
    └── dashboard/          # Dashboard-specific components
        ├── layouts/        # Role-based layout components
        └── shared/         # Shared dashboard components
```

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start Development Server**
   ```bash
   pnpm dev
   ```

3. **Access the Dashboard**
   - Visit `http://localhost:3000/dashboard-demo` to see the role selection interface
   - Or directly access:
     - Patient: `http://localhost:3000/dashboard/patient`
     - Counselor: `http://localhost:3000/dashboard/counselor`
     - Admin: `http://localhost:3000/dashboard/admin`

## Dashboard Features

### Patient Dashboard
- **Dashboard**: Progress overview, upcoming sessions, recent messages, recommended resources
- **Counselors**: Browse and book sessions with available counselors
- **Resources**: Access educational materials, meditations, and articles
- **Sessions**: View and manage counseling sessions
- **Chat**: Real-time messaging with counselors
- **AI Chat**: 24/7 AI assistant for support and guidance
- **Settings**: Profile management and preferences

### Counselor Dashboard
- **Dashboard**: Patient overview, upcoming sessions, recent activity
- **Patients**: Manage assigned patients and track progress
- **Resources**: View and upload educational materials
- **Sessions**: Schedule and manage counseling sessions
- **Chat**: Communicate with patients
- **AI Chat**: Professional assistant for treatment guidance

### Admin Dashboard
- **Dashboard**: Platform statistics and system health
- **User Management**: Manage all users, patients, counselors, and admins
- **Support**: Handle support tickets and user issues
- **Settings**: Configure platform settings and preferences

## Components

### Shared Components
- `StatCard`: Display key metrics and statistics
- `PageHeader`: Consistent page headers with actions
- `ProfileCard`: User profile display with actions
- `ResourceCard`: Educational resource display
- `SessionCard`: Session information and management
- `TopBar`: Navigation bar with user menu
- `Sidebar`: Role-based navigation sidebar

### Layout Components
- `DashboardLayout`: Base dashboard layout
- `PatientLayout`: Patient-specific layout
- `CounselorLayout`: Counselor-specific layout
- `AdminLayout`: Admin-specific layout

## Data Structure

The dashboard uses TypeScript interfaces for type safety:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'counselor' | 'admin';
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

interface Session {
  id: string;
  patientId: string;
  counselorId: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  type: 'individual' | 'group';
}
```

## Customization

### Adding New Pages
1. Create a new page component in the appropriate role directory
2. Add the route to the sidebar navigation in `Sidebar.tsx`
3. Update the layout component if needed

### Styling
- Uses Tailwind CSS for styling
- Follows shadcn/ui design system
- Customizable through CSS variables and Tailwind config

### Adding New Components
1. Create component in `components/dashboard/shared/`
2. Export from the appropriate index file
3. Import and use in your pages

## Dummy Data

The dashboard includes comprehensive dummy data for testing:
- Sample users (patients, counselors, admins)
- Mock sessions and messages
- Educational resources
- Support tickets
- Dashboard statistics

## Future Enhancements

- Real-time notifications
- Video calling integration
- Advanced analytics and reporting
- Mobile app development
- Multi-language support
- Advanced AI features

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for type safety
3. Follow the shadcn/ui component patterns
4. Ensure responsive design
5. Add proper error handling and loading states

## License

This project is part of the Rwanda Cancer Relief platform.

export type UserRole = 'patient' | 'counselor' | 'admin' | 'guest';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
  badge?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Patient extends User {
  role: 'patient';
  diagnosis?: string;
  treatmentStage?: string;
  assignedCounselor?: string;
  currentModule?: string;
  moduleProgress?: {
    [moduleId: string]: number;
  };
  phoneNumber?: string;
  emergencyContact?: string;
  dateOfBirth?: Date;
  medicalHistory?: string;
  language?: string;
  timezone?: string;
  languages?: string[];
}

export interface Counselor extends User {
  role: 'counselor';
  specialty: string;
  experience: number;
  availability: 'available' | 'busy' | 'offline';
  patients?: string[];
  phoneNumber?: string;
  bio?: string;
  credentials?: string;
  languages?: string[];
  timezone?: string;
  profileImage?: string;
  location?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'audio' | 'pdf' | 'video' | 'article';
  url: string;
  thumbnail?: string;
  duration?: number;
  tags: string[];
  createdAt: Date;
  isPublic: boolean;
  publisher: string; // Added publisher field
  isYouTube?: boolean;
  youtubeUrl?: string;
  content?: string;
}

export interface Session {
  id: string;
  patientId: string;
  counselorId: string;
  date: Date;
  time: string;
  duration: number;
  type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  isRead?: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  duration?: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalSessions: number;
  totalResources: number;
  totalSupportTickets: number;
  supportTickets: number;
  activeUsers: number;
  activeSessions: number;
  completedSessions: number;
  pendingSessions: number;
  openTickets: number;
  moduleCompletions: number;
  patientCount: number;
  counselorCount: number;
  upcomingSessions: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface TopBarProps {
  user: User;
  onLogout: () => void;
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
}

export interface ProfileCardProps {
  counselor: Counselor;
  onBookSession?: (counselor: Counselor) => void;
  onViewProfile?: (counselor: Counselor) => void;
}

export interface ResourceCardProps {
  resource: Resource;
  onView?: (resource: Resource) => void;
  onDownload?: (resource: Resource) => void;
  showActions?: boolean;
  delay?: number;
}

export interface SessionCardProps {
  session: Session;
  counselor?: Counselor;
  patient?: Patient;
  onJoin?: (session: Session) => void;
  onReschedule?: (session: Session) => void;
  onCancel?: (session: Session) => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
}

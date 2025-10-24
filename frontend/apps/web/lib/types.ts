export type UserRole = 'patient' | 'counselor' | 'admin';

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
  dateOfBirth: Date;
  phoneNumber: string;
  emergencyContact: string;
  medicalHistory?: string;
  currentModule?: string;
  moduleProgress: number;
}

export interface Counselor extends User {
  role: 'counselor';
  specialty: string;
  experience: number;
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  bio: string;
  patients: string[];
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Session {
  id: string;
  patientId: string;
  counselorId: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  type: 'individual' | 'group';
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
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress: number;
  isCompleted: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'reading' | 'video' | 'exercise' | 'quiz';
  duration: number;
  isCompleted: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  moduleCompletions: number;
  supportTickets: number;
  patientCount: number;
  counselorCount: number;
  upcomingSessions: number;
  recentMessages: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
  badge?: number;
}

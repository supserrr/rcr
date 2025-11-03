/**
 * Shared TypeScript types
 * 
 * Common types used across the application
 */

export type UserRole = 'patient' | 'counselor' | 'admin' | 'guest';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient extends User {
  role: 'patient';
  diagnosis?: string;
  treatmentStage?: string;
  assignedCounselor?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
}

export interface Counselor extends User {
  role: 'counselor';
  specialty: string;
  experience: number;
  availability: 'available' | 'busy' | 'offline';
  languages?: string[];
  bio?: string;
  credentials?: string;
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

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'audio' | 'pdf' | 'video' | 'article';
  url: string;
  thumbnail?: string;
  tags: string[];
  isPublic: boolean;
  publisher: string;
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


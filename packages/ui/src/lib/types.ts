export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'counselor' | 'admin';
  avatar?: string;
  createdAt: Date;
}

export interface Patient extends User {
  role: 'patient';
  diagnosis?: string;
  treatmentStage?: string;
  assignedCounselor?: string;
  moduleProgress?: {
    [moduleId: string]: number;
  };
}

export interface Counselor extends User {
  role: 'counselor';
  specialty: string;
  experience: number;
  availability: 'available' | 'busy' | 'offline';
  patients?: string[];
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
  content?: string; // Added content field for articles
  isYouTube?: boolean; // Added YouTube flag
  youtubeUrl?: string; // Added YouTube URL field
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

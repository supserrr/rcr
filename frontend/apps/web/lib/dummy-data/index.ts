import { 
  User, 
  Patient, 
  Counselor, 
  Admin, 
  Session, 
  Resource, 
  Message, 
  Chat, 
  SupportTicket, 
  Module,
  DashboardStats 
} from '../types';

// Sample Users
export const dummyUsers: User[] = [
  {
    id: '1',
    name: 'Jean Baptiste',
    email: 'jean@example.com',
    role: 'patient',
    avatar: '/avatars/patient1.jpg',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'Dr. Marie Claire',
    email: 'marie@example.com',
    role: 'counselor',
    avatar: '/avatars/counselor1.jpg',
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: '/avatars/admin1.jpg',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date('2024-01-20')
  }
];

// Sample Patients
export const dummyPatients: Patient[] = [
  {
    id: '1',
    name: 'Jean Baptiste',
    email: 'jean@example.com',
    role: 'patient',
    avatar: '/avatars/patient1.jpg',
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-20'),
    dateOfBirth: new Date('1985-03-15'),
    phoneNumber: '+250 788 123 456',
    emergencyContact: '+250 788 654 321',
    medicalHistory: 'Breast cancer survivor, currently in remission',
    currentModule: 'Coping with Anxiety',
    moduleProgress: 65
  },
  {
    id: '4',
    name: 'Grace Mukamana',
    email: 'grace@example.com',
    role: 'patient',
    avatar: '/avatars/patient2.jpg',
    createdAt: new Date('2024-01-18'),
    lastLogin: new Date('2024-01-19'),
    dateOfBirth: new Date('1990-07-22'),
    phoneNumber: '+250 788 234 567',
    emergencyContact: '+250 788 765 432',
    medicalHistory: 'Recently diagnosed with cervical cancer',
    currentModule: 'Understanding Your Diagnosis',
    moduleProgress: 30
  },
  {
    id: '5',
    name: 'Paul Nkurunziza',
    email: 'paul@example.com',
    role: 'patient',
    avatar: '/avatars/patient3.jpg',
    createdAt: new Date('2024-01-12'),
    lastLogin: new Date('2024-01-20'),
    dateOfBirth: new Date('1978-11-08'),
    phoneNumber: '+250 788 345 678',
    emergencyContact: '+250 788 876 543',
    medicalHistory: 'Prostate cancer, undergoing treatment',
    currentModule: 'Managing Treatment Side Effects',
    moduleProgress: 80
  }
];

// Sample Counselors
export const dummyCounselors: Counselor[] = [
  {
    id: '2',
    name: 'Dr. Marie Claire',
    email: 'marie@example.com',
    role: 'counselor',
    avatar: '/avatars/counselor1.jpg',
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date('2024-01-20'),
    specialty: 'Oncology Psychology',
    experience: 8,
    languages: ['English', 'French', 'Kinyarwanda'],
    availability: 'available',
    rating: 4.8,
    bio: 'Specialized in helping cancer patients and their families cope with diagnosis and treatment.',
    patients: ['1', '4']
  },
  {
    id: '6',
    name: 'Dr. Jean Paul',
    email: 'jeanpaul@example.com',
    role: 'counselor',
    avatar: '/avatars/counselor2.jpg',
    createdAt: new Date('2024-01-08'),
    lastLogin: new Date('2024-01-19'),
    specialty: 'Grief Counseling',
    experience: 12,
    languages: ['English', 'Kinyarwanda'],
    availability: 'busy',
    rating: 4.9,
    bio: 'Experienced in grief counseling and end-of-life support for cancer patients.',
    patients: ['5']
  },
  {
    id: '7',
    name: 'Dr. Immaculee',
    email: 'immaculee@example.com',
    role: 'counselor',
    avatar: '/avatars/counselor3.jpg',
    createdAt: new Date('2024-01-05'),
    lastLogin: new Date('2024-01-18'),
    specialty: 'Family Therapy',
    experience: 6,
    languages: ['English', 'French', 'Kinyarwanda'],
    availability: 'available',
    rating: 4.7,
    bio: 'Focuses on family dynamics and support systems during cancer treatment.',
    patients: []
  }
];

// Sample Sessions
export const dummySessions: Session[] = [
  {
    id: '1',
    patientId: '1',
    counselorId: '2',
    scheduledAt: new Date('2024-01-22T10:00:00'),
    duration: 60,
    status: 'scheduled',
    type: 'individual',
    notes: 'Follow-up session to discuss anxiety management techniques'
  },
  {
    id: '2',
    patientId: '4',
    counselorId: '2',
    scheduledAt: new Date('2024-01-23T14:00:00'),
    duration: 45,
    status: 'scheduled',
    type: 'individual',
    notes: 'Initial consultation for newly diagnosed patient'
  },
  {
    id: '3',
    patientId: '5',
    counselorId: '6',
    scheduledAt: new Date('2024-01-21T09:00:00'),
    duration: 60,
    status: 'completed',
    type: 'individual',
    notes: 'Discussed treatment side effects and coping strategies'
  }
];

// Sample Resources
export const dummyResources: Resource[] = [
  {
    id: '1',
    title: 'Mindfulness Meditation for Cancer Patients',
    description: 'A guided meditation session to help reduce anxiety and stress during treatment.',
    type: 'audio',
    url: '/resources/mindfulness-meditation.mp3',
    thumbnail: '/thumbnails/meditation.jpg',
    duration: 15,
    tags: ['meditation', 'anxiety', 'stress-relief'],
    createdAt: new Date('2024-01-15'),
    isPublic: true,
    publisher: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    title: 'Understanding Your Cancer Diagnosis',
    description: 'A comprehensive guide to understanding different types of cancer and treatment options.',
    type: 'pdf',
    url: '/resources/cancer-diagnosis-guide.pdf',
    thumbnail: '/thumbnails/diagnosis-guide.jpg',
    tags: ['education', 'diagnosis', 'treatment'],
    createdAt: new Date('2024-01-10'),
    isPublic: true,
    publisher: 'Dr. Michael Chen'
  },
  {
    id: '3',
    title: 'Nutrition During Cancer Treatment',
    description: 'Video guide on maintaining proper nutrition during chemotherapy and radiation.',
    type: 'video',
    url: '/resources/nutrition-guide.mp4',
    thumbnail: '/thumbnails/nutrition.jpg',
    duration: 25,
    tags: ['nutrition', 'treatment', 'wellness'],
    createdAt: new Date('2024-01-12'),
    isPublic: true,
    publisher: 'Dr. Emily Rodriguez'
  },
  {
    id: '4',
    title: 'Coping with Chemotherapy Side Effects',
    description: 'Article covering common side effects and practical coping strategies.',
    type: 'article',
    url: '/resources/chemotherapy-side-effects.html',
    thumbnail: '/thumbnails/chemotherapy.jpg',
    tags: ['chemotherapy', 'side-effects', 'coping'],
    createdAt: new Date('2024-01-08'),
    isPublic: true,
    publisher: 'Dr. James Wilson'
  }
];

// Sample Messages
export const dummyMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: '2',
    content: 'Thank you for the session today. The breathing exercises really helped.',
    timestamp: new Date('2024-01-20T15:30:00'),
    isRead: true,
    type: 'text'
  },
  {
    id: '2',
    senderId: '2',
    receiverId: '1',
    content: 'I\'m glad they helped! Remember to practice them daily. See you next week.',
    timestamp: new Date('2024-01-20T15:35:00'),
    isRead: true,
    type: 'text'
  },
  {
    id: '3',
    senderId: '4',
    receiverId: '2',
    content: 'I have a question about my upcoming session.',
    timestamp: new Date('2024-01-20T16:00:00'),
    isRead: false,
    type: 'text'
  }
];

// Sample Chats
export const dummyChats: Chat[] = [
  {
    id: '1',
    participants: ['1', '2'],
    lastMessage: dummyMessages[1],
    unreadCount: 0,
    isActive: true
  },
  {
    id: '2',
    participants: ['4', '2'],
    lastMessage: dummyMessages[2],
    unreadCount: 1,
    isActive: false
  }
];

// Sample Support Tickets
export const dummySupportTickets: SupportTicket[] = [
  {
    id: '1',
    userId: '1',
    subject: 'Unable to access video resources',
    description: 'I\'m having trouble playing the meditation videos on my phone.',
    status: 'open',
    priority: 'medium',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '2',
    userId: '4',
    subject: 'Session scheduling issue',
    description: 'The calendar is not showing available time slots for next week.',
    status: 'in-progress',
    priority: 'high',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-20'),
    assignedTo: '3'
  }
];

// Sample Modules
export const dummyModules: Module[] = [
  {
    id: '1',
    title: 'Understanding Your Diagnosis',
    description: 'Learn about your cancer diagnosis and what it means for your treatment journey.',
    progress: 30,
    isCompleted: false,
    lessons: [
      {
        id: '1-1',
        title: 'What is Cancer?',
        content: 'Introduction to cancer and how it develops in the body.',
        type: 'reading',
        duration: 10,
        isCompleted: true
      },
      {
        id: '1-2',
        title: 'Types of Cancer',
        content: 'Overview of different cancer types and their characteristics.',
        type: 'video',
        duration: 15,
        isCompleted: true
      },
      {
        id: '1-3',
        title: 'Understanding Your Specific Diagnosis',
        content: 'Personalized information about your specific cancer type.',
        type: 'reading',
        duration: 20,
        isCompleted: false
      }
    ]
  },
  {
    id: '2',
    title: 'Coping with Anxiety',
    description: 'Techniques and strategies to manage anxiety during your cancer journey.',
    progress: 65,
    isCompleted: false,
    lessons: [
      {
        id: '2-1',
        title: 'Recognizing Anxiety Symptoms',
        content: 'Learn to identify when you\'re experiencing anxiety.',
        type: 'reading',
        duration: 10,
        isCompleted: true
      },
      {
        id: '2-2',
        title: 'Breathing Exercises',
        content: 'Simple breathing techniques to calm your mind and body.',
        type: 'video',
        duration: 12,
        isCompleted: true
      },
      {
        id: '2-3',
        title: 'Mindfulness Practice',
        content: 'Introduction to mindfulness meditation for cancer patients.',
        type: 'exercise',
        duration: 20,
        isCompleted: true
      },
      {
        id: '2-4',
        title: 'Building a Support Network',
        content: 'How to identify and strengthen your support system.',
        type: 'reading',
        duration: 15,
        isCompleted: false
      }
    ]
  }
];

// Dashboard Statistics
export const dummyDashboardStats: DashboardStats = {
  totalUsers: 156,
  activeSessions: 12,
  moduleCompletions: 89,
  supportTickets: 5,
  patientCount: 142,
  counselorCount: 8,
  upcomingSessions: 15,
  recentMessages: 23
};

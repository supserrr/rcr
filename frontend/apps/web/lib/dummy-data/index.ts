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
  DashboardStats,
  SystemHealth,
  MaintenanceLog,
  TrainingResource
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
    moduleProgress: {
      'coping-anxiety': 65,
      'stress-management': 40,
      'mindfulness': 20
    }
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
    moduleProgress: {
      'understanding-diagnosis': 30,
      'treatment-options': 10,
      'emotional-support': 5
    }
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
    moduleProgress: {
      'managing-side-effects': 80,
      'nutrition-guidance': 60,
      'exercise-therapy': 40
    }
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
    bio: 'Specialized in helping cancer patients and their families cope with diagnosis and treatment.',
    credentials: 'PhD in Clinical Psychology, Licensed Clinical Psychologist',
    location: 'Kigali, Rwanda',
    phoneNumber: '+250 788 111 222',
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
    bio: 'Experienced in grief counseling and end-of-life support for cancer patients.',
    credentials: 'MSW in Social Work, Licensed Clinical Social Worker',
    location: 'Butare, Rwanda',
    phoneNumber: '+250 788 333 444',
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
    bio: 'Focuses on family dynamics and support systems during cancer treatment.',
    credentials: 'MA in Marriage and Family Therapy, Licensed Marriage and Family Therapist',
    location: 'Gisenyi, Rwanda',
    phoneNumber: '+250 788 555 666',
    patients: []
  }
];

// Sample Sessions
export const dummySessions: Session[] = [
  {
    id: 'session-1',
    patientId: '1',
    counselorId: '2',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    time: '10:00 AM',
    duration: 60,
    status: 'scheduled',
    type: 'video',
    notes: 'Follow-up session to discuss anxiety management techniques'
  },
  {
    id: 'session-2',
    patientId: '4',
    counselorId: '2',
    date: new Date('2024-01-23T14:00:00'),
    time: '2:00 PM',
    duration: 45,
    status: 'scheduled',
    type: 'audio',
    notes: 'Initial consultation for newly diagnosed patient'
  },
  {
    id: 'session-3',
    patientId: '5',
    counselorId: '6',
    date: new Date('2024-01-21T09:00:00'),
    time: '9:00 AM',
    duration: 60,
    status: 'completed',
    type: 'video',
    notes: 'Discussed treatment side effects and coping strategies'
  }
];

// Sample Resources
export const dummyResources: Resource[] = [
  {
    id: 'resource-1',
    title: 'Mindfulness Meditation for Cancer Patients',
    description: 'A guided meditation session to help reduce anxiety and stress during treatment.',
    type: 'audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    duration: 15,
    tags: ['meditation', 'anxiety', 'stress-relief'],
    createdAt: new Date('2024-01-15'),
    isPublic: true,
    publisher: 'Dr. Sarah Johnson'
  },
  {
    id: 'resource-2',
    title: 'Cancer Treatment Options Guide',
    description: 'Detailed information about various cancer treatment options including surgery, chemotherapy, radiation therapy, and immunotherapy.',
    type: 'pdf',
    url: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    tags: ['treatment', 'options', 'medical-guide'],
    createdAt: new Date('2024-01-16'),
    isPublic: true,
    publisher: 'Dr. Lisa Thompson'
  },
  {
    id: 'resource-3',
    title: 'Nutrition During Cancer Treatment',
    description: 'Video guide on maintaining proper nutrition during chemotherapy and radiation.',
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
    duration: 25,
    tags: ['nutrition', 'treatment', 'wellness'],
    createdAt: new Date('2024-01-12'),
    isPublic: true,
    publisher: 'Dr. Emily Rodriguez'
  },
  {
    id: 'resource-4',
    title: 'Exercise and Cancer Recovery',
    description: 'A comprehensive YouTube video about safe exercises during cancer treatment and recovery.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    duration: 30,
    tags: ['exercise', 'recovery', 'wellness'],
    createdAt: new Date('2024-01-14'),
    isPublic: true,
    publisher: 'Dr. Sarah Johnson',
    isYouTube: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 'resource-5',
    title: 'Coping with Chemotherapy Side Effects',
    description: 'Article covering common side effects and practical coping strategies.',
    type: 'article',
    url: '/resources/chemotherapy-side-effects.html',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    tags: ['chemotherapy', 'side-effects', 'coping'],
    createdAt: new Date('2024-01-08'),
    isPublic: true,
    publisher: 'Dr. James Wilson',
    content: `
      <h2>Understanding Chemotherapy Side Effects</h2>
      <p>Chemotherapy is a powerful treatment that can effectively target cancer cells, but it may also affect healthy cells in your body. Understanding the potential side effects and how to manage them can help you feel more prepared and in control during your treatment journey.</p>
      
      <h3>Common Side Effects</h3>
      <p>While everyone's experience with chemotherapy is unique, there are several common side effects that many patients experience:</p>
      
      <h4>Fatigue</h4>
      <p>Feeling tired or exhausted is one of the most common side effects of chemotherapy. This fatigue can be different from normal tiredness and may persist even after rest.</p>
      <ul>
        <li>Plan your day around your energy levels</li>
        <li>Take short naps when needed</li>
        <li>Ask for help with daily tasks</li>
        <li>Engage in light exercise when possible</li>
      </ul>
      
      <h4>Nausea and Vomiting</h4>
      <p>Many chemotherapy drugs can cause nausea and vomiting. Your healthcare team will provide medications to help prevent and manage these symptoms.</p>
      <ul>
        <li>Take anti-nausea medications as prescribed</li>
        <li>Eat small, frequent meals</li>
        <li>Avoid strong smells and spicy foods</li>
        <li>Stay hydrated with clear liquids</li>
      </ul>
      
      <h4>Hair Loss</h4>
      <p>Some chemotherapy drugs can cause hair loss, which may affect your scalp, eyebrows, eyelashes, and body hair.</p>
      <ul>
        <li>Consider cutting your hair short before treatment begins</li>
        <li>Use gentle hair care products</li>
        <li>Protect your scalp from sun exposure</li>
        <li>Consider wigs, scarves, or hats for comfort</li>
      </ul>
      
      <h3>Coping Strategies</h3>
      <p>Managing chemotherapy side effects requires a combination of medical support and self-care strategies:</p>
      
      <h4>Communication</h4>
      <p>Keep open communication with your healthcare team about any side effects you experience. They can adjust your treatment plan or provide additional support.</p>
      
      <h4>Nutrition</h4>
      <p>Maintaining good nutrition during chemotherapy is crucial for your recovery and overall well-being:</p>
      <ul>
        <li>Work with a dietitian to create a meal plan</li>
        <li>Focus on nutrient-dense foods</li>
        <li>Stay hydrated throughout the day</li>
        <li>Consider nutritional supplements if recommended</li>
      </ul>
      
      <h4>Emotional Support</h4>
      <p>Chemotherapy can be emotionally challenging. Don't hesitate to seek support:</p>
      <ul>
        <li>Join support groups for cancer patients</li>
        <li>Consider counseling or therapy</li>
        <li>Stay connected with family and friends</li>
        <li>Practice relaxation techniques like meditation or deep breathing</li>
      </ul>
      
      <h3>When to Contact Your Healthcare Team</h3>
      <p>Contact your healthcare team immediately if you experience:</p>
      <ul>
        <li>Fever above 100.4°F (38°C)</li>
        <li>Severe nausea or vomiting that prevents eating or drinking</li>
        <li>Signs of infection (redness, swelling, warmth)</li>
        <li>Difficulty breathing or chest pain</li>
        <li>Unusual bleeding or bruising</li>
        <li>Severe fatigue that doesn't improve with rest</li>
      </ul>
      
      <h3>Remember</h3>
      <p>Every person's experience with chemotherapy is different. While side effects can be challenging, they are often temporary and manageable with the right support and care. Focus on taking things one day at a time and remember that you're not alone in this journey.</p>
      
      <p><strong>Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. Always consult with your healthcare team about your specific situation and treatment plan.</p>
    `
  }
];

// Sample Messages
export const dummyMessages: Message[] = [
  {
    id: 'message-1',
    senderId: '1',
    receiverId: '2',
    content: 'Thank you for the session today. The breathing exercises really helped.',
    timestamp: new Date('2024-01-20T15:30:00'),
    isRead: true,
    type: 'text'
  },
  {
    id: 'message-2',
    senderId: '2',
    receiverId: '1',
    content: 'I\'m glad they helped! Remember to practice them daily. See you next week.',
    timestamp: new Date('2024-01-20T15:35:00'),
    isRead: true,
    type: 'text'
  },
  {
    id: 'message-3',
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
    id: 'chat-1',
    participants: ['1', '2'],
    messages: [dummyMessages[0]!, dummyMessages[1]!],
    lastMessage: dummyMessages[1]!,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-21'),
    unreadCount: 0
  },
  {
    id: 'chat-2',
    participants: ['4', '2'],
    messages: [dummyMessages[2]!],
    lastMessage: dummyMessages[2]!,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-22'),
    unreadCount: 1
  }
];

// Sample Support Tickets
export const dummySupportTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    userId: '1',
    title: 'Video Resource Access Issue',
    subject: 'Unable to access video resources',
    description: 'I\'m having trouble playing the meditation videos on my phone.',
    status: 'open',
    priority: 'medium',
    category: 'Technical',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'ticket-2',
    userId: '4',
    title: 'Calendar Scheduling Problem',
    subject: 'Session scheduling issue',
    description: 'The calendar is not showing available time slots for next week.',
    status: 'in_progress',
    priority: 'high',
    category: 'Scheduling',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-20'),
    assignedTo: '3'
  }
];

// Sample Modules
export const dummyModules: Module[] = [
  {
    id: 'module-1',
    title: 'Understanding Your Diagnosis',
    description: 'Learn about your cancer diagnosis and what it means for your treatment journey.',
    content: 'This module covers the basics of cancer diagnosis, including what your diagnosis means, treatment options, and how to cope with the news.',
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'module-2',
    title: 'Coping with Anxiety',
    description: 'Practical techniques for managing anxiety and stress during your cancer journey.',
    content: 'Learn breathing exercises, mindfulness techniques, and other strategies to help manage anxiety and stress.',
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-11')
  },
  {
    id: 'module-3',
    title: 'Managing Treatment Side Effects',
    description: 'Understanding and managing common side effects of cancer treatment.',
    content: 'Comprehensive guide to managing nausea, fatigue, pain, and other treatment-related side effects.',
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
];

// Sample Pending Counselor Applications
export const dummyPendingCounselors: any[] = [
  {
    id: 'pending-1',
    name: 'Dr. Sarah Mukamana',
    email: 'sarah.mukamana@example.com',
    role: 'counselor',
    avatar: '/avatars/pending1.jpg',
    createdAt: new Date('2024-01-22'),
    specialty: 'Trauma Therapy',
    experience: 5,
    languages: ['English', 'Kinyarwanda', 'French'],
    availability: 'available',
    bio: 'Specialized in trauma therapy for cancer patients and their families. Experienced in working with survivors of various types of cancer.',
    credentials: 'PhD in Clinical Psychology, Licensed Clinical Psychologist, Certified Trauma Specialist',
    location: 'Musanze, Rwanda',
    phoneNumber: '+250 788 777 888',
    patients: [],
    // Professional License
    licenseNumber: 'RMC-2023-0456',
    licenseExpiry: '2025-12-31',
    issuingAuthority: 'Rwanda Medical Council',
    // Education
    highestDegree: 'PhD',
    university: 'University of Rwanda',
    graduationYear: '2018',
    additionalCertifications: ['Licensed Clinical Psychologist', 'Certified Trauma Specialist', 'Oncology Social Work Specialist'],
    // Specializations & Consultation Types
    specializations: ['Trauma Therapy', 'Grief Counseling', 'Palliative Care'],
    consultationTypes: ['video', 'chat', 'phone'],
    // Experience
    previousEmployers: 'Rwanda Military Hospital (2019-2023) - Senior Counselor\nButaro Cancer Center (2017-2019) - Trauma Specialist\nKigali Mental Health Clinic (2015-2017) - Clinical Psychologist',
    // Additional Information
    motivation: 'I am deeply committed to supporting cancer patients and their families through their journey. Having witnessed the emotional toll of cancer diagnosis and treatment, I want to provide compassionate counseling services through Rwanda Cancer Relief to help individuals and families cope with the challenges they face.',
    references: 'Dr. Jean Paul Mutabazi, Head of Psychiatry, Rwanda Military Hospital\nEmail: jpmutabazi@rmh.rw | Phone: +250 788 555 666\n\nDr. Marie Claire Mukankusi, Director, Butaro Cancer Center\nEmail: mcmukankusi@bcc.rw | Phone: +250 788 444 555',
    emergencyContact: 'Jean Baptiste Mukamana (Spouse) - +250 788 777 889',
    // Document Uploads - Using public PDF URLs
    resumeFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    licenseFile: 'https://www.africau.edu/images/default/sample.pdf',
    certificationsFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'pending-2',
    name: 'Dr. Emmanuel Nkurunziza',
    email: 'emmanuel.nkurunziza@example.com',
    role: 'counselor',
    avatar: '/avatars/pending2.jpg',
    createdAt: new Date('2024-01-21'),
    specialty: 'Family Counseling',
    experience: 7,
    languages: ['English', 'Kinyarwanda'],
    availability: 'available',
    bio: 'Focused on family dynamics and support systems for cancer patients. Helps families navigate the emotional challenges of cancer treatment.',
    credentials: 'MSW in Social Work, Licensed Clinical Social Worker, Family Therapy Certification',
    location: 'Gisenyi, Rwanda',
    phoneNumber: '+250 788 999 000',
    patients: [],
    // Professional License
    licenseNumber: 'RMC-2022-0321',
    licenseExpiry: '2024-11-30',
    issuingAuthority: 'Rwanda Medical Council',
    // Education
    highestDegree: 'Master\'s Degree',
    university: 'National University of Rwanda',
    graduationYear: '2016',
    additionalCertifications: ['Licensed Clinical Social Worker', 'Family Therapy Certification'],
    // Specializations & Consultation Types
    specializations: ['Family Therapy', 'Cancer Support', 'Couples Counseling'],
    consultationTypes: ['video', 'phone'],
    // Experience
    previousEmployers: 'Gisenyi District Hospital (2020-2023) - Family Counselor\nRwanda Red Cross Society (2017-2020) - Social Worker\nCommunity Health Center Kigali (2015-2017) - Counselor',
    // Additional Information
    motivation: 'Family support is crucial when facing cancer. I want to help families understand, communicate, and support each other through this difficult journey. Rwanda Cancer Relief provides the platform to reach more families across Rwanda.',
    references: 'Dr. Francois Habimana, Medical Director, Gisenyi District Hospital\nEmail: fhabimana@gdh.rw | Phone: +250 788 333 444\n\nUwimana Jeanne, Program Coordinator, Rwanda Red Cross\nEmail: ujeanne@redcross.rw | Phone: +250 788 222 333',
    emergencyContact: 'Clementine Nkurunziza (Sister) - +250 788 999 001',
    // Document Uploads - Using public PDF URLs
    resumeFile: 'https://www.africau.edu/images/default/sample.pdf',
    licenseFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    certificationsFile: 'https://www.africau.edu/images/default/sample.pdf'
  },
  {
    id: 'pending-3',
    name: 'Dr. Grace Uwimana',
    email: 'grace.uwimana@example.com',
    role: 'counselor',
    avatar: '/avatars/pending3.jpg',
    createdAt: new Date('2024-01-20'),
    specialty: 'Child and Adolescent Psychology',
    experience: 6,
    languages: ['English', 'Kinyarwanda', 'French'],
    availability: 'available',
    bio: 'Specialized in working with children and adolescents affected by cancer, both as patients and family members.',
    credentials: 'PhD in Child Psychology, Licensed Clinical Psychologist, Pediatric Oncology Certification',
    location: 'Kigali, Rwanda',
    phoneNumber: '+250 788 111 333',
    patients: [],
    // Professional License
    licenseNumber: 'RMC-2023-0789',
    licenseExpiry: '2026-06-30',
    issuingAuthority: 'Rwanda Medical Council',
    // Education
    highestDegree: 'PhD',
    university: 'University of Kigali',
    graduationYear: '2017',
    additionalCertifications: ['Licensed Clinical Psychologist', 'Pediatric Oncology Certification', 'Child & Adolescent Therapy'],
    // Specializations & Consultation Types
    specializations: ['Child & Adolescent Therapy', 'Cancer Support', 'Anxiety Management'],
    consultationTypes: ['video', 'chat'],
    // Experience
    previousEmployers: 'King Faisal Hospital (2019-2023) - Pediatric Psychologist\nRwanda Children\'s Cancer Foundation (2017-2019) - Child Counselor\nKigali Youth Center (2015-2017) - Adolescent Counselor',
    // Additional Information
    motivation: 'Children and teenagers facing cancer need specialized support. I am passionate about helping young patients and their siblings understand and cope with cancer in an age-appropriate way. Through Rwanda Cancer Relief, I can extend my services to more families.',
    references: 'Dr. Paul Rusingiza, Head of Pediatrics, King Faisal Hospital\nEmail: prusingiza@kfh.rw | Phone: +250 788 666 777\n\nDr. Alice Mukamana, Executive Director, Rwanda Children\'s Cancer Foundation\nEmail: amukamana@rccf.rw | Phone: +250 788 555 444',
    emergencyContact: 'Patrick Uwimana (Brother) - +250 788 111 334',
    // Document Uploads - Using public PDF URLs
    resumeFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    licenseFile: 'https://www.africau.edu/images/default/sample.pdf',
    certificationsFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

// Sample Training Resources for Counselors
export const dummyTrainingResources: TrainingResource[] = [
  {
    id: 'training-1',
    title: 'Cancer Psychology Fundamentals',
    description: 'Comprehensive guide to understanding the psychological impact of cancer diagnosis and treatment on patients and families.',
    type: 'course',
    category: 'Psychology',
    duration: '4 hours',
    difficulty: 'Beginner',
    fileUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    thumbnailUrl: '/training/thumbnails/psychology-fundamentals.jpg',
    tags: ['psychology', 'fundamentals', 'cancer', 'diagnosis'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isActive: true,
    downloads: 45,
    rating: 4.8,
    instructor: 'Dr. Sarah Johnson',
    learningObjectives: [
      'Understand the psychological stages of cancer diagnosis',
      'Learn effective communication techniques with patients',
      'Identify common psychological challenges in cancer care',
      'Develop strategies for family support'
    ]
  },
  {
    id: 'training-6',
    title: 'Effective Patient Communication',
    description: 'Article covering best practices for empathetic, clear, and culturally competent communication with patients and families.',
    type: 'document',
    category: 'Counseling',
    duration: '25 minutes',
    difficulty: 'Beginner',
    fileUrl: '/training/patient-communication.html',
    thumbnailUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=300&fit=crop',
    tags: ['communication', 'empathy', 'cultural-competency'],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    isActive: true,
    downloads: 12,
    rating: 4.5,
    instructor: 'Dr. Aisha Patel',
    learningObjectives: [
      'Apply empathetic listening techniques',
      'Structure conversations with clarity and sensitivity',
      'Adapt messaging for diverse cultural contexts'
    ]
  },
  {
    id: 'training-2',
    title: 'Grief Counseling Techniques',
    description: 'Advanced techniques for supporting patients and families through grief and loss in cancer care.',
    type: 'workshop',
    category: 'Counseling',
    duration: '6 hours',
    difficulty: 'Intermediate',
    fileUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
    thumbnailUrl: '/training/thumbnails/grief-counseling.jpg',
    tags: ['grief', 'counseling', 'loss', 'family-support'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    isActive: true,
    downloads: 32,
    rating: 4.9,
    instructor: 'Dr. Michael Chen',
    learningObjectives: [
      'Master grief counseling methodologies',
      'Understand different types of loss in cancer care',
      'Learn to support families through bereavement',
      'Develop coping strategies for counselors'
    ]
  },
  {
    id: 'training-3',
    title: 'Trauma-Informed Care in Oncology',
    description: 'Understanding and applying trauma-informed care principles when working with cancer patients.',
    type: 'course',
    category: 'Trauma Care',
    duration: '5 hours',
    difficulty: 'Advanced',
    fileUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: '/training/thumbnails/trauma-care.jpg',
    tags: ['trauma', 'oncology', 'care', 'advanced'],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-18'),
    isActive: true,
    downloads: 28,
    rating: 4.7,
    instructor: 'Dr. Lisa Rodriguez',
    learningObjectives: [
      'Understand trauma responses in cancer patients',
      'Learn trauma-informed assessment techniques',
      'Develop safe therapeutic approaches',
      'Create trauma-sensitive environments'
    ]
  },
  {
    id: 'training-4',
    title: 'Cultural Competency in Cancer Care',
    description: 'Building cultural awareness and competency when providing counseling services to diverse populations.',
    type: 'workshop',
    category: 'Cultural Competency',
    duration: '3 hours',
    difficulty: 'Beginner',
    fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnailUrl: '/training/thumbnails/cultural-competency.jpg',
    tags: ['cultural', 'diversity', 'competency', 'inclusive-care'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
    isActive: true,
    downloads: 38,
    rating: 4.6,
    instructor: 'Dr. Aisha Patel',
    learningObjectives: [
      'Understand cultural influences on cancer experience',
      'Learn culturally sensitive communication',
      'Develop inclusive counseling approaches',
      'Address cultural barriers in care'
    ]
  },
  {
    id: 'training-5',
    title: 'Self-Care for Healthcare Providers',
    description: 'Essential self-care strategies and burnout prevention for counselors working in cancer care.',
    type: 'course',
    category: 'Self-Care',
    duration: '2 hours',
    difficulty: 'Beginner',
    fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: '/training/thumbnails/self-care.jpg',
    tags: ['self-care', 'burnout', 'wellness', 'mental-health'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22'),
    isActive: true,
    downloads: 52,
    rating: 4.9,
    instructor: 'Dr. James Wilson',
    learningObjectives: [
      'Recognize signs of burnout and compassion fatigue',
      'Develop personal self-care strategies',
      'Learn stress management techniques',
      'Build resilience in healthcare work'
    ]
  }
];

// Sample System Health Data
export const dummySystemHealth: SystemHealth[] = [
  {
    id: 'health-1',
    component: 'Database Server',
    type: 'database',
    status: 'healthy',
    responseTime: 45,
    description: 'Primary PostgreSQL database running optimally',
    lastChecked: new Date('2024-01-20T10:30:00'),
    uptime: 99.9,
    errorCount: 0,
    warningCount: 0
  },
  {
    id: 'health-2',
    component: 'API Gateway',
    type: 'api',
    status: 'healthy',
    responseTime: 120,
    description: 'Main API gateway handling requests normally',
    lastChecked: new Date('2024-01-20T10:30:00'),
    uptime: 99.8,
    errorCount: 2,
    warningCount: 1
  },
  {
    id: 'health-3',
    component: 'File Storage',
    type: 'storage',
    status: 'warning',
    responseTime: 850,
    description: 'Storage system showing increased latency',
    lastChecked: new Date('2024-01-20T10:30:00'),
    uptime: 98.5,
    errorCount: 5,
    warningCount: 12
  },
  {
    id: 'health-4',
    component: 'CDN Network',
    type: 'network',
    status: 'healthy',
    responseTime: 200,
    description: 'Content delivery network operating normally',
    lastChecked: new Date('2024-01-20T10:30:00'),
    uptime: 99.7,
    errorCount: 1,
    warningCount: 3
  },
  {
    id: 'health-5',
    component: 'Security Scanner',
    type: 'security',
    status: 'critical',
    responseTime: 0,
    description: 'Security scanner service is offline',
    lastChecked: new Date('2024-01-20T10:30:00'),
    uptime: 0,
    errorCount: 15,
    warningCount: 0
  },
  {
    id: 'health-6',
    component: 'Redis Cache',
    type: 'database',
    status: 'healthy',
    responseTime: 25,
    description: 'Redis cache layer performing well',
    lastChecked: new Date('2024-01-20T10:30:00'),
    uptime: 99.9,
    errorCount: 0,
    warningCount: 0
  },
  {
    id: 'health-7',
    component: 'Email Service',
    type: 'api',
    status: 'warning',
    responseTime: 1200,
    description: 'Email service experiencing delays',
    lastChecked: new Date('2024-01-20T10:30:00'),
    uptime: 97.2,
    errorCount: 8,
    warningCount: 15
  },
  {
    id: 'health-8',
    component: 'Load Balancer',
    type: 'network',
    status: 'healthy',
    responseTime: 50,
    description: 'Load balancer distributing traffic efficiently',
    lastChecked: new Date('2024-01-20T10:30:00'),
    uptime: 99.8,
    errorCount: 1,
    warningCount: 2
  }
];

// Sample Maintenance Logs
export const dummyMaintenanceLogs: MaintenanceLog[] = [
  {
    id: 'maintenance-1',
    title: 'Database Backup',
    description: 'Automated daily backup of all database tables and user data',
    type: 'backup',
    status: 'completed',
    duration: '15 minutes',
    riskLevel: 'low',
    frequency: 'Daily at 2:00 AM',
    lastRun: new Date('2024-01-20T02:00:00'),
    nextRun: new Date('2024-01-21T02:00:00'),
    steps: [
      {
        title: 'Create backup snapshot',
        description: 'Generate point-in-time snapshot of all databases'
      },
      {
        title: 'Compress backup files',
        description: 'Compress backup data to reduce storage requirements'
      },
      {
        title: 'Upload to cloud storage',
        description: 'Transfer compressed backup to secure cloud storage'
      },
      {
        title: 'Verify backup integrity',
        description: 'Validate backup files and test restoration process'
      }
    ],
    logs: [
      {
        timestamp: new Date('2024-01-20T02:00:00'),
        level: 'info',
        message: 'Starting database backup process'
      },
      {
        timestamp: new Date('2024-01-20T02:05:00'),
        level: 'info',
        message: 'Database snapshot created successfully'
      },
      {
        timestamp: new Date('2024-01-20T02:10:00'),
        level: 'info',
        message: 'Backup files compressed and uploaded'
      },
      {
        timestamp: new Date('2024-01-20T02:15:00'),
        level: 'success',
        message: 'Backup completed successfully'
      }
    ],
    createdBy: 'system',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20T02:15:00')
  },
  {
    id: 'maintenance-2',
    title: 'Security Updates',
    description: 'Apply critical security patches to all system components',
    type: 'security',
    status: 'scheduled',
    duration: '2 hours',
    riskLevel: 'high',
    frequency: 'Weekly on Sundays at 1:00 AM',
    lastRun: new Date('2024-01-14T01:00:00'),
    nextRun: new Date('2024-01-21T01:00:00'),
    steps: [
      {
        title: 'Download security patches',
        description: 'Fetch latest security updates from vendor repositories'
      },
      {
        title: 'Test patches in staging',
        description: 'Apply patches to staging environment and run tests'
      },
      {
        title: 'Schedule maintenance window',
        description: 'Notify users of planned maintenance downtime'
      },
      {
        title: 'Apply patches to production',
        description: 'Deploy security patches to production systems'
      },
      {
        title: 'Verify system functionality',
        description: 'Run comprehensive tests to ensure system stability'
      }
    ],
    createdBy: 'admin',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-14T03:00:00')
  },
  {
    id: 'maintenance-3',
    title: 'Log Cleanup',
    description: 'Remove old log files and optimize storage space',
    type: 'cleanup',
    status: 'running',
    duration: '30 minutes',
    riskLevel: 'low',
    frequency: 'Weekly on Saturdays at 3:00 AM',
    lastRun: new Date('2024-01-20T03:00:00'),
    nextRun: new Date('2024-01-27T03:00:00'),
    steps: [
      {
        title: 'Identify old log files',
        description: 'Scan system for log files older than 30 days'
      },
      {
        title: 'Archive important logs',
        description: 'Move critical logs to long-term storage'
      },
      {
        title: 'Delete old logs',
        description: 'Remove non-essential log files to free space'
      },
      {
        title: 'Update log rotation settings',
        description: 'Adjust log rotation policies if needed'
      }
    ],
    logs: [
      {
        timestamp: new Date('2024-01-20T03:00:00'),
        level: 'info',
        message: 'Starting log cleanup process'
      },
      {
        timestamp: new Date('2024-01-20T03:05:00'),
        level: 'info',
        message: 'Found 1,247 log files to process'
      },
      {
        timestamp: new Date('2024-01-20T03:10:00'),
        level: 'info',
        message: 'Archiving critical logs to cold storage'
      },
      {
        timestamp: new Date('2024-01-20T03:15:00'),
        level: 'info',
        message: 'Deleting 1,200 old log files'
      }
    ],
    createdBy: 'system',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20T03:15:00')
  },
  {
    id: 'maintenance-4',
    title: 'Performance Optimization',
    description: 'Optimize database queries and clear application caches',
    type: 'optimization',
    status: 'completed',
    duration: '45 minutes',
    riskLevel: 'medium',
    frequency: 'Monthly on the first Sunday at 4:00 AM',
    lastRun: new Date('2024-01-07T04:00:00'),
    nextRun: new Date('2024-02-04T04:00:00'),
    steps: [
      {
        title: 'Analyze slow queries',
        description: 'Identify and analyze database queries with poor performance'
      },
      {
        title: 'Update query indexes',
        description: 'Add or modify database indexes to improve query speed'
      },
      {
        title: 'Clear application caches',
        description: 'Clear Redis and application-level caches'
      },
      {
        title: 'Rebuild cache layers',
        description: 'Warm up caches with frequently accessed data'
      },
      {
        title: 'Monitor performance metrics',
        description: 'Verify performance improvements and monitor system health'
      }
    ],
    logs: [
      {
        timestamp: new Date('2024-01-07T04:00:00'),
        level: 'info',
        message: 'Starting performance optimization'
      },
      {
        timestamp: new Date('2024-01-07T04:10:00'),
        level: 'info',
        message: 'Analyzed 156 slow queries, identified 12 for optimization'
      },
      {
        timestamp: new Date('2024-01-07T04:20:00'),
        level: 'info',
        message: 'Updated database indexes successfully'
      },
      {
        timestamp: new Date('2024-01-07T04:30:00'),
        level: 'info',
        message: 'Cleared and rebuilt application caches'
      },
      {
        timestamp: new Date('2024-01-07T04:45:00'),
        level: 'success',
        message: 'Performance optimization completed - 23% improvement in query speed'
      }
    ],
    createdBy: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-07T04:45:00')
  },
  {
    id: 'maintenance-5',
    title: 'System Monitoring Check',
    description: 'Verify all monitoring systems and alert configurations',
    type: 'monitoring',
    status: 'failed',
    duration: '20 minutes',
    riskLevel: 'medium',
    frequency: 'Daily at 6:00 AM',
    lastRun: new Date('2024-01-20T06:00:00'),
    nextRun: new Date('2024-01-21T06:00:00'),
    steps: [
      {
        title: 'Check monitoring services',
        description: 'Verify all monitoring services are running properly'
      },
      {
        title: 'Test alert channels',
        description: 'Test email and SMS alert notifications'
      },
      {
        title: 'Validate metrics collection',
        description: 'Ensure all system metrics are being collected'
      },
      {
        title: 'Update monitoring rules',
        description: 'Review and update alert thresholds if needed'
      }
    ],
    logs: [
      {
        timestamp: new Date('2024-01-20T06:00:00'),
        level: 'info',
        message: 'Starting monitoring system check'
      },
      {
        timestamp: new Date('2024-01-20T06:05:00'),
        level: 'warning',
        message: 'Email alert service not responding'
      },
      {
        timestamp: new Date('2024-01-20T06:10:00'),
        level: 'error',
        message: 'Failed to connect to monitoring database'
      },
      {
        timestamp: new Date('2024-01-20T06:15:00'),
        level: 'error',
        message: 'Monitoring check failed - manual intervention required'
      }
    ],
    createdBy: 'system',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20T06:15:00')
  }
];

// Dashboard Statistics
export const dummyDashboardStats: DashboardStats = {
  totalUsers: 156,
  totalSessions: 89,
  totalResources: 45,
  totalSupportTickets: 5,
  supportTickets: 5,
  activeUsers: 142,
  activeSessions: 12,
  completedSessions: 77,
  pendingSessions: 12,
  openTickets: 3,
  moduleCompletions: 89,
  patientCount: 142,
  counselorCount: 8,
  upcomingSessions: 15
};

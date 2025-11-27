# Jitsi Video Conferencing Integration

## Overview

The Rwanda Cancer Relief platform now includes a complete video conferencing system using Jitsi Meet for counseling sessions between patients and counselors.

## Features

### Session Types

The platform supports two session types:

1. **Video Sessions**
   - Full video and audio
   - Face-to-face interaction
   - Better for building therapeutic relationships
   - Ideal for initial consultations and complex therapy

2. **Audio-Only Sessions**
   - Voice call only
   - Lower bandwidth requirements
   - Better for limited connectivity
   - Provides more privacy when needed

### Components

#### 1. JitsiMeeting Component
**Location**: `components/session/JitsiMeeting.tsx`

A reusable React component that embeds Jitsi Meet.

**Features**:
- Dynamic room creation
- Session type support (video/audio)
- Loading states
- Error handling
- Event listeners (participant join/leave)
- Auto-configuration for audio-only mode
- Privacy-focused settings

**Props**:
- `roomName`: Unique identifier for the meeting
- `displayName`: Participant's display name
- `email`: Optional email for identification
- `sessionType`: 'video' or 'audio'
- `onMeetingEnd`: Callback when meeting ends
- `onParticipantJoined`: Callback when someone joins
- `onParticipantLeft`: Callback when someone leaves
- `config`: Additional Jitsi configuration

#### 2. SessionBookingModal Component
**Location**: `components/session/SessionBookingModal.tsx`

A multi-step booking flow for scheduling sessions.

**Step 1: Date & Time**
- Date picker (future dates only)
- Time slot selection
- Duration options (30/45/60/90 minutes)

**Step 2: Session Type**
- Visual selection between video and audio
- Helpful descriptions for each type
- Optional notes field

**Step 3: Confirmation**
- Complete booking summary
- Review all details
- Confirmation notice

#### 3. CounselorSelectionModal Component
**Location**: `components/session/CounselorSelectionModal.tsx`

Allows patients to choose a counselor before booking.

**Features**:
- Search by name or specialty
- Filter by specialty
- Counselor cards with:
  - Avatar and name
  - Specialty
  - Availability status
  - Bio
  - Experience years
  - Rating
  - Languages

### Pages

#### 1. Session Room Page
**Location**: `app/session/[sessionId]/page.tsx`

The main video conferencing interface.

**Three Stages**:

**Pre-Session Lobby**:
- Session information display
- Participant details
- Pre-session checklist
- Privacy notice
- Join button

**Active Session**:
- Full-screen Jitsi interface
- All Jitsi controls available
- Secure, encrypted connection

**Post-Session**:
- Session completion confirmation
- Session summary
- Notes field (counselors only)
- Navigation back to dashboard

#### 2. Updated Sessions Pages

**Patient Sessions** (`app/dashboard/patient/sessions/page.tsx`):
- "Book a Session" button opens counselor selection
- Join session navigates to video room
- Session cards show video/audio type

**Counselor Sessions** (`app/dashboard/counselor/sessions/page.tsx`):
- Join session navigates to video room
- Session cards show video/audio type

**Counselors Page** (`app/dashboard/patient/counselors/page.tsx`):
- "Book a Session" button opens booking flow with selected counselor

## Data Model

### Updated Session Type

```typescript
export interface Session {
  id: string;
  patientId: string;
  counselorId: string;
  date: Date;
  time: string;
  duration: number;
  type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'in-progress';
  notes?: string;
  sessionType?: 'video' | 'audio';
  meetingLink?: string;
  roomName?: string;
}
```

**New Fields**:
- `sessionType`: Explicit type (video/audio)
- `meetingLink`: Optional external meeting URL
- `roomName`: Jitsi room identifier
- `in-progress`: New status for active sessions

## User Flow

### For Patients

1. **Booking a Session**:
   - Click "Book a Session" (from sessions page or counselors page)
   - Select a counselor (if not already selected)
   - Choose date, time, and duration
   - Select session type (video or audio)
   - Add optional notes
   - Confirm booking

2. **Joining a Session**:
   - Navigate to Sessions page
   - Find upcoming session
   - Click "Join Session" button
   - Review session details in lobby
   - Complete pre-session checklist
   - Click "Join Session"
   - Participate in video/audio call
   - End call when finished
   - Add feedback (optional)

### For Counselors

1. **Viewing Sessions**:
   - Navigate to Sessions page
   - See all scheduled, past, and upcoming sessions
   - View session type (video/audio) on each card

2. **Joining a Session**:
   - Click "Join Session" button
   - Review patient information
   - Complete pre-session checklist
   - Join the call
   - Add session notes after completion
   - Save notes to patient record

## Technical Details

### Jitsi Configuration

**Domain**: Using 8x8.vc (Jitsi as a Service)

**Features Enabled**:
- Prejoin page (device checks)
- Noise detection
- Screen sharing
- Chat
- Recording (optional)
- Virtual backgrounds
- Closed captions

**Features Disabled**:
- Jitsi watermarks
- Mobile app promotion
- Guest invitations
- Room storage

**Security**:
- Unique room names per session
- End-to-end encryption
- No room data storage
- Privacy-focused defaults

### Future Enhancements

1. **Self-Hosted Jitsi**:
   - Deploy own Jitsi server
   - Full HIPAA compliance
   - Complete data control
   - Custom branding

2. **Advanced Features**:
   - Session recording (with consent)
   - Waiting rooms
   - Breakout rooms for family sessions
   - Real-time transcription
   - AI-powered session summaries

3. **Accessibility**:
   - Sign language interpretation
   - Live captions
   - Screen reader support
   - Keyboard navigation

4. **Analytics**:
   - Session duration tracking
   - Connection quality monitoring
   - Participant engagement metrics
   - Technical issue detection

## Dependencies

- `@jitsi/react-sdk`: ^1.4.4
- Jitsi Meet External API (loaded dynamically)

## Documentation

For detailed setup and configuration guides, see:

- **[Setup Guide](jitsi/SETUP.md)** - Basic configuration and deployment options
- **[Keys Setup Guide](jitsi/KEYS_SETUP.md)** - How to configure Jitsi JaaS keys
- **[Production Deployment](../deployment/JITSI_PRODUCTION.md)** - Production deployment guide
- **[Environment Variables](../deployment/ENV_EXAMPLE.md)** - Complete environment variable reference

## Environment Variables

For production deployment, see the [Environment Variables documentation](../deployment/ENV_EXAMPLE.md) for complete setup instructions.

## Testing

Test the implementation:

1. Navigate to patient dashboard
2. Go to Counselors page
3. Click "Book a Session"
4. Complete booking flow
5. Go to Sessions page
6. Click "Join Session"
7. Test video/audio controls
8. End session
9. Verify post-session flow

For detailed testing instructions, see the [Jitsi Testing Guide](jitsi/TESTING.md).

## Notes

- Currently using 8x8.vc free tier (public Jitsi instance)
- For production, consider self-hosting for HIPAA compliance
- Room names are generated as `session-{sessionId}`
- Session links expire after meeting ends
- All sessions are private and require authentication


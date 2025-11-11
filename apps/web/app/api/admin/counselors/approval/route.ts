import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

type CounselorApprovalStatus =
  | 'approved'
  | 'pending'
  | 'needs_more_info'
  | 'rejected'
  | 'suspended';

interface ApprovalRequestBody {
  counselorId?: unknown;
  approvalStatus?: unknown;
  approvalNotes?: unknown;
  visibilitySettings?: unknown;
}

const APPROVAL_STATUSES: CounselorApprovalStatus[] = [
  'approved',
  'pending',
  'needs_more_info',
  'rejected',
  'suspended',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validatePayload(body: ApprovalRequestBody) {
  if (!body || typeof body !== 'object') {
    return { success: false, error: 'Invalid request payload.' } as const;
  }

  const counselorId = typeof body.counselorId === 'string' ? body.counselorId.trim() : '';
  if (!counselorId) {
    return { success: false, error: 'counselorId is required.' } as const;
  }

  const approvalStatus =
    typeof body.approvalStatus === 'string' && APPROVAL_STATUSES.includes(body.approvalStatus as CounselorApprovalStatus)
      ? (body.approvalStatus as CounselorApprovalStatus)
      : null;

  if (!approvalStatus) {
    return { success: false, error: 'approvalStatus is invalid.' } as const;
  }

  const approvalNotes = typeof body.approvalNotes === 'string' ? body.approvalNotes : undefined;

  let visibilitySettings: Record<string, unknown> | undefined;
  if (isRecord(body.visibilitySettings)) {
    visibilitySettings = body.visibilitySettings;
  }

  const data: {
    counselorId: string;
    approvalStatus: CounselorApprovalStatus;
    approvalNotes?: string;
    visibilitySettings?: Record<string, unknown>;
  } = {
    counselorId,
    approvalStatus,
    approvalNotes,
  };

  if (visibilitySettings) {
    data.visibilitySettings = visibilitySettings;
  }

  return {
    success: true,
    data,
  } as const;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    const validation = validatePayload(payload);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    console.debug(
      '[api/admin/counselors/approval] Validated payload visibilitySettings present:',
      Object.prototype.hasOwnProperty.call(validation.data, 'visibilitySettings'),
    );

    const supabase = await createClient();
    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json(
        { error: 'Account administration not configured. Please set SUPABASE_SERVICE_ROLE_KEY on the server.' },
        { status: 500 },
      );
    }

    let adminUserId: string | null = null;

    if (supabase) {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[api/admin/counselors/approval] Failed to load session:', sessionError);
      }

      adminUserId = session?.user?.id ?? null;
    } else {
      console.warn(
        '[api/admin/counselors/approval] Supabase server client not configured; falling back to bearer token verification.',
      );
    }

    if (!adminUserId) {
      const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
      console.debug(
        '[api/admin/counselors/approval] Authorization header present:',
        Boolean(authHeader),
      );
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

      if (bearerToken) {
        try {
          const { data, error } = await serviceClient.auth.getUser(bearerToken);
          if (error) {
            console.error('[api/admin/counselors/approval] Bearer token verification failed:', error);
          } else if (data?.user?.id) {
            adminUserId = data.user.id;
          }
        } catch (tokenError) {
          console.error('[api/admin/counselors/approval] Failed to verify bearer token:', tokenError);
        }
      }
    }

    if (!adminUserId) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const { data: adminProfile, error: adminError } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', adminUserId)
      .maybeSingle();

    if (adminError) {
      console.error('[api/admin/counselors/approval] Failed to verify admin role:', adminError);
      return NextResponse.json({ error: 'Unable to verify admin privileges.' }, { status: 500 });
    }

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Administrator role required.' }, { status: 403 });
    }

    const { counselorId, approvalStatus, approvalNotes, visibilitySettings } = validation.data;
    const now = new Date().toISOString();

    const updateValues: Record<string, unknown> = {
      approval_status: approvalStatus,
      approval_notes: approvalNotes ?? null,
      approval_reviewed_at: now,
      approval_reviewed_by: adminUserId,
    };

    if (visibilitySettings !== undefined) {
      updateValues.visibility_settings = visibilitySettings;
    }

    const { data: updatedProfile, error: updateError } = await serviceClient
      .from('profiles')
      .update(updateValues)
      .eq('id', counselorId)
      .select(
        'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,' +
          'created_at,updated_at,visibility_settings,approval_status,approval_submitted_at,approval_reviewed_at,' +
          'approval_notes,counselor_profiles(*)',
      )
      .maybeSingle();

    if (updateError) {
      console.error('[api/admin/counselors/approval] Failed to update profile:', updateError);
      return NextResponse.json(
        { error: updateError.message ?? 'Failed to update counselor approval status.' },
        { status: 500 },
      );
    }

    if (!updatedProfile) {
      return NextResponse.json({ error: 'Counselor profile not found.' }, { status: 404 });
    }

    const { data: documents, error: documentsError } = await serviceClient
      .from('counselor_documents')
      .select('*')
      .eq('profile_id', counselorId);

    if (documentsError) {
      console.warn('[api/admin/counselors/approval] Failed to load counselor documents:', documentsError);
    }

    return NextResponse.json({
      success: true,
      data: Object.assign({}, updatedProfile, {
        counselor_documents: documents ?? [],
      }),
    });
  } catch (error) {
    console.error('[api/admin/counselors/approval] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to update counselor approval status.' }, { status: 500 });
  }
}


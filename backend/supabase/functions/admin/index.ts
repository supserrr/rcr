/**
 * Edge function handler for privileged admin operations.
 *
 * Provides a secure API surface mirroring the AdminApi helper functions in
 * the frontend. Every request must be authenticated as an admin prior to
 * executing the requested action. The function uses the Supabase service role
 * key to bypass RLS after verifying the caller.
 */
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1';

type AdminAction =
  | 'listUsers'
  | 'getUser'
  | 'updateUserRole'
  | 'deleteUser'
  | 'updateCounselorApproval'
  | 'assignPatientToCounselor';

interface BaseAdminRequest {
  action: AdminAction;
}

interface ListUsersRequest extends BaseAdminRequest {
  action: 'listUsers';
  limit?: number;
  offset?: number;
  role?: 'patient' | 'counselor' | 'admin';
  isVerified?: boolean;
  search?: string;
}

interface GetUserRequest extends BaseAdminRequest {
  action: 'getUser';
  userId: string;
}

interface UpdateUserRoleRequest extends BaseAdminRequest {
  action: 'updateUserRole';
  userId: string;
  role: 'patient' | 'counselor' | 'admin';
}

interface UpdateCounselorApprovalRequest extends BaseAdminRequest {
  action: 'updateCounselorApproval';
  counselorId: string;
  approvalStatus: string;
  approvalNotes?: string | null;
  visibilitySettings?: Record<string, unknown> | null;
}

interface DeleteUserRequest extends BaseAdminRequest {
  action: 'deleteUser';
  userId: string;
}

interface AssignPatientToCounselorRequest extends BaseAdminRequest {
  action: 'assignPatientToCounselor';
  patientId: string;
  counselorId: string | null;
}

type AdminRequestBody =
  | ListUsersRequest
  | GetUserRequest
  | UpdateUserRoleRequest
  | DeleteUserRequest
  | UpdateCounselorApprovalRequest
  | AssignPatientToCounselorRequest;

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for admin edge function.');
}

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Create a Supabase client bound to the service role key.
 *
 * @returns Supabase client authenticated with service role key.
 */
const createServiceClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};

/**
 * Ensure the current caller is an admin.
 *
 * @param serviceClient Supabase service client.
 * @param userId Authenticated user identifier.
 */
const assertIsAdmin = async (serviceClient: SupabaseClient, userId: string): Promise<void> => {
  const { data: profile, error } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw Object.assign(new Error('Failed to verify admin role.'), { cause: error });
  }

  if (!profile || profile.role !== 'admin') {
    const err = new Error('Forbidden: admin access required.');
    err.name = 'ForbiddenError';
    throw err;
  }
};

/**
 * Ensure the current caller is an admin or counselor.
 *
 * @param serviceClient Supabase service client.
 * @param userId Authenticated user identifier.
 */
const assertIsAdminOrCounselor = async (serviceClient: SupabaseClient, userId: string): Promise<void> => {
  const { data: profile, error } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw Object.assign(new Error('Failed to verify user role.'), { cause: error });
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'counselor')) {
    const err = new Error('Forbidden: admin or counselor access required.');
    err.name = 'ForbiddenError';
    throw err;
  }
};

/**
 * Normalise numeric inputs while enforcing optional range constraints.
 *
 * @param value Raw numeric value.
 * @param fallback Default value when the input is invalid.
 * @param options Range constraints.
 * @returns Sanitised number.
 */
const normaliseNumber = (value: unknown, fallback: number, options?: { min?: number; max?: number }): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  let result = value;

  if (options?.min !== undefined) {
    result = Math.max(options.min, result);
  }

  if (options?.max !== undefined) {
    result = Math.min(options.max, result);
  }

  return Math.trunc(result);
};

/**
 * Retrieve auth user metadata for the provided profile identifiers.
 *
 * @param serviceClient Supabase service client.
 * @param userIds Profile identifiers.
 */
const fetchAuthUsers = async (
  serviceClient: SupabaseClient,
  userIds: string[],
): Promise<Map<string, { email: string | null; created_at: string | null; last_login: string | null }>> => {
  const results = new Map<string, { email: string | null; created_at: string | null; last_login: string | null }>();

  if (userIds.length === 0) {
    return results;
  }

  await Promise.all(
    userIds.map(async (id) => {
      try {
        const { data } = await serviceClient.auth.admin.getUserById(id);
        if (data.user) {
          results.set(id, {
            email: data.user.email ?? null,
            created_at: data.user.created_at ?? null,
            last_login: data.user.last_sign_in_at ?? null,
          });
        }
      } catch (_err) {
        // Ignore missing auth users; they may have been removed.
      }
    }),
  );

  return results;
};

/**
 * Handle the list users admin action.
 *
 * @param serviceClient Supabase service client.
 * @param payload Request payload.
 */
const handleListUsers = async (
  serviceClient: SupabaseClient,
  payload: ListUsersRequest,
): Promise<Response> => {
  const limit = normaliseNumber(payload.limit, 50, { min: 1, max: 200 });
  const offset = normaliseNumber(payload.offset, 0, { min: 0 });

  let query = serviceClient
    .from('profiles')
    .select(
      'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,' +
        'created_at,updated_at,visibility_settings,approval_status,approval_submitted_at,approval_reviewed_at,' +
        'approval_notes',
      { count: 'exact' },
    );

  if (payload.role) {
    query = query.eq('role', payload.role);
  }

  if (payload.isVerified !== undefined) {
    query = query.eq('is_verified', payload.isVerified);
  }

  if (payload.search && payload.search.trim().length > 0) {
    const term = payload.search.trim();
    query = query.or(
      `full_name.ilike.%${term}%,metadata->>email.ilike.%${term}%,metadata->>contact_email.ilike.%${term}%`,
    );
  }

  const orderColumn = payload.role === 'counselor' ? 'full_name' : 'created_at';
  query = query.order(orderColumn, { ascending: true }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message ?? 'Failed to list users.' }),
      { status: 500, headers: corsHeaders },
    );
  }

  const ids = (data ?? []).map((row) => row.id);
  const authUsersMap = await fetchAuthUsers(serviceClient, ids);

  const documentsByProfile = new Map<string, any[]>();
  const counselorProfilesByProfile = new Map<string, any[]>();
  const sessionStatsByProfile = new Map<string, any>();
  if (ids.length > 0) {
    const { data: documents } = await serviceClient
      .from('counselor_documents')
      .select('*')
      .in('profile_id', ids);
    (documents ?? []).forEach((doc) => {
      const profileId = doc.profile_id as string | undefined;
      if (profileId) {
        const existing = documentsByProfile.get(profileId) ?? [];
        existing.push(doc);
        documentsByProfile.set(profileId, existing);
      }
    });

    const { data: counselorProfiles } = await serviceClient
      .from('counselor_profiles')
      .select('*')
      .in('profile_id', ids);
    (counselorProfiles ?? []).forEach((profile) => {
      const profileId = profile.profile_id as string | undefined;
      if (profileId) {
        const existing = counselorProfilesByProfile.get(profileId) ?? [];
        existing.push(profile);
        counselorProfilesByProfile.set(profileId, existing);
      }
    });

    const { data: sessionStats } = await serviceClient
      .from('counselor_session_stats')
      .select(
        'user_id,total_sessions,total_scheduled,upcoming_sessions,completed_sessions,cancelled_sessions,next_session_at,last_completed_session_at',
      )
      .in('user_id', ids);

    (sessionStats ?? []).forEach((stat) => {
      if (stat && typeof stat === 'object' && 'user_id' in stat) {
        sessionStatsByProfile.set(stat.user_id as string, stat);
      }
    });
  }

  const combined = (data ?? []).map((row) => {
    const authUser = authUsersMap.get(row.id);
    return {
      ...row,
      email: authUser?.email ?? row.metadata?.email ?? null,
      lastLogin: authUser?.last_login ?? row.updated_at,
      createdAt: authUser?.created_at ?? row.created_at,
      counselor_documents: documentsByProfile.get(row.id) ?? [],
      counselor_profiles: counselorProfilesByProfile.get(row.id) ?? [],
      session_stats: sessionStatsByProfile.get(row.id) ?? null,
    };
  });

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        users: combined,
        total: count ?? combined.length,
        limit,
        offset,
      },
    }),
    { status: 200, headers: corsHeaders },
  );
};

/**
 * Handle fetching a single user profile.
 *
 * @param serviceClient Supabase service client.
 * @param payload Request payload.
 */
const handleGetUser = async (
  serviceClient: SupabaseClient,
  payload: GetUserRequest,
): Promise<Response> => {
  const { data, error } = await serviceClient
    .from('profiles')
    .select(
      'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,' +
        'created_at,updated_at,visibility_settings,approval_status,approval_submitted_at,approval_reviewed_at,' +
        'approval_notes',
    )
    .eq('id', payload.userId)
    .maybeSingle();

  if (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message ?? 'Failed to load user.' }),
      { status: 500, headers: corsHeaders },
    );
  }

  if (!data) {
    return new Response(JSON.stringify({ success: false, error: 'User not found.' }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  const authUser = await fetchAuthUsers(serviceClient, [payload.userId]);
  const authData = authUser.get(payload.userId);

  const { data: documents } = await serviceClient
    .from('counselor_documents')
    .select('*')
    .eq('profile_id', payload.userId);

  const { data: counselorProfiles } = await serviceClient
    .from('counselor_profiles')
    .select('*')
    .eq('profile_id', payload.userId);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        ...data,
        email: authData?.email ?? data.metadata?.email ?? null,
        lastLogin: authData?.last_login ?? data.updated_at,
        createdAt: authData?.created_at ?? data.created_at,
        counselor_documents: documents ?? [],
        counselor_profiles: counselorProfiles ?? [],
      },
    }),
    { status: 200, headers: corsHeaders },
  );
};

/**
 * Handle updating a user's role.
 *
 * @param serviceClient Supabase service client.
 * @param payload Request payload.
 */
const handleUpdateUserRole = async (
  serviceClient: SupabaseClient,
  payload: UpdateUserRoleRequest,
): Promise<Response> => {
  const allowedRoles: UpdateUserRoleRequest['role'][] = ['patient', 'counselor', 'admin'];
  if (!allowedRoles.includes(payload.role)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid role specified.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { data: existingProfile, error: profileError } = await serviceClient
    .from('profiles')
    .select('metadata')
    .eq('id', payload.userId)
    .maybeSingle();

  if (profileError) {
    return new Response(
      JSON.stringify({ success: false, error: profileError.message ?? 'Failed to load profile metadata.' }),
      { status: 500, headers: corsHeaders },
    );
  }

  if (!existingProfile) {
    return new Response(JSON.stringify({ success: false, error: 'User not found.' }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  const mergedMetadata = {
    ...(existingProfile.metadata ?? {}),
    role: payload.role,
    updatedByAdmin: true,
    updatedAt: new Date().toISOString(),
  };

  const { data: updatedProfile, error: updateError } = await serviceClient
    .from('profiles')
    .update({
      role: payload.role,
      metadata: mergedMetadata,
    })
    .eq('id', payload.userId)
    .select(
      'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,' +
        'created_at,updated_at,visibility_settings,approval_status,approval_submitted_at,approval_reviewed_at,' +
        'approval_notes',
    )
    .maybeSingle();

  if (updateError) {
    return new Response(
      JSON.stringify({ success: false, error: updateError.message ?? 'Failed to update profile role.' }),
      { status: 500, headers: corsHeaders },
    );
  }

  try {
    const { data } = await serviceClient.auth.admin.getUserById(payload.userId);
    const mergedUserMetadata = {
      ...(data.user?.user_metadata ?? {}),
      role: payload.role,
    };

    await serviceClient.auth.admin.updateUserById(payload.userId, {
      user_metadata: mergedUserMetadata,
    });
  } catch (authError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: authError instanceof Error ? authError.message : 'Failed to sync auth metadata.',
      }),
      { status: 500, headers: corsHeaders },
    );
  }

  const authUser = await fetchAuthUsers(serviceClient, [payload.userId]);
  const authData = authUser.get(payload.userId);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        ...updatedProfile,
        email: authData?.email ?? updatedProfile?.metadata?.email ?? null,
        lastLogin: authData?.last_login ?? updatedProfile?.updated_at,
        createdAt: authData?.created_at ?? updatedProfile?.created_at,
      },
    }),
    { status: 200, headers: corsHeaders },
  );
};

const handleUpdateCounselorApproval = async (
  serviceClient: SupabaseClient,
  payload: UpdateCounselorApprovalRequest,
  reviewerId: string,
): Promise<Response> => {
  if (!payload.counselorId || !payload.approvalStatus) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid approval payload.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const updatePayload: Record<string, unknown> = {
    approval_status: payload.approvalStatus,
    approval_reviewed_at: new Date().toISOString(),
    approval_reviewed_by: reviewerId,
    approval_notes: payload.approvalNotes ?? null,
  };

  if (payload.visibilitySettings !== undefined) {
    updatePayload.visibility_settings = payload.visibilitySettings;
  }

  const { data: updatedProfile, error: updateError } = await serviceClient
    .from('profiles')
    .update(updatePayload)
    .eq('id', payload.counselorId)
    .select(
      'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,' +
        'created_at,updated_at,visibility_settings,approval_status,approval_submitted_at,approval_reviewed_at,' +
        'approval_notes',
    )
    .maybeSingle();

  if (updateError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: updateError.message ?? 'Failed to update counselor approval status.',
      }),
      { status: 500, headers: corsHeaders },
    );
  }

  if (!updatedProfile) {
    return new Response(JSON.stringify({ success: false, error: 'Counselor not found.' }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  const authUser = await fetchAuthUsers(serviceClient, [payload.counselorId]);
  const authData = authUser.get(payload.counselorId);

  const { data: documents } = await serviceClient
    .from('counselor_documents')
    .select('*')
    .eq('profile_id', payload.counselorId);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        ...updatedProfile,
        email: authData?.email ?? updatedProfile.metadata?.email ?? null,
        lastLogin: authData?.last_login ?? updatedProfile.updated_at,
        createdAt: authData?.created_at ?? updatedProfile.created_at,
        counselor_documents: documents ?? [],
      },
    }),
    { status: 200, headers: corsHeaders },
  );
};

/**
 * Handle deleting a user account.
 *
 * @param serviceClient Supabase service client.
 * @param payload Request payload.
 */
const handleDeleteUser = async (
  serviceClient: SupabaseClient,
  payload: DeleteUserRequest,
): Promise<Response> => {
  try {
    await serviceClient.auth.admin.deleteUser(payload.userId);
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user.',
      }),
      { status: 500, headers: corsHeaders },
    );
  }

  return new Response(JSON.stringify({ success: true, data: null }), {
    status: 200,
    headers: corsHeaders,
  });
};

/**
 * Handle assigning a patient to a counselor.
 *
 * @param serviceClient Supabase service client.
 * @param payload Request payload.
 */
const handleAssignPatientToCounselor = async (
  serviceClient: SupabaseClient,
  payload: AssignPatientToCounselorRequest,
): Promise<Response> => {
  // Verify the patient exists and is a patient
  // First try without role filter in case role is stored differently
  let { data: patientProfile, error: patientError } = await serviceClient
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', payload.patientId)
    .maybeSingle();

  // If not found or error, try with role filter
  if (patientError || !patientProfile) {
    const { data, error } = await serviceClient
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', payload.patientId)
      .eq('role', 'patient')
      .maybeSingle();
    
    if (!error && data) {
      patientProfile = data;
      patientError = null;
    } else if (error) {
      patientError = error;
    }
  }

  // Check if patient exists and has correct role
  if (patientError) {
    console.error('[handleAssignPatientToCounselor] Patient query error:', patientError);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Failed to verify patient: ${patientError.message || 'Unknown error'}` 
      }),
      { status: 500, headers: corsHeaders },
    );
  }

  if (!patientProfile) {
    return new Response(
      JSON.stringify({ success: false, error: 'Patient not found.' }),
      { status: 404, headers: corsHeaders },
    );
  }

  if (patientProfile.role !== 'patient') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `User is not a patient. Current role: ${patientProfile.role}` 
      }),
      { status: 400, headers: corsHeaders },
    );
  }

  // If assigning to a counselor, verify the counselor exists
  if (payload.counselorId) {
    const { data: counselorProfile, error: counselorError } = await serviceClient
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', payload.counselorId)
      .eq('role', 'counselor')
      .single();

    if (counselorError || !counselorProfile) {
      return new Response(
        JSON.stringify({ success: false, error: 'Counselor not found or invalid.' }),
        { status: 404, headers: corsHeaders },
      );
    }
  }

  // Update the assigned_counselor_id
  const { data: updatedProfile, error: updateError } = await serviceClient
    .from('profiles')
    .update({ assigned_counselor_id: payload.counselorId })
    .eq('id', payload.patientId)
    .select(
      'id,full_name,role,is_verified,metadata,specialty,experience_years,availability,avatar_url,assigned_counselor_id,' +
        'created_at,updated_at,visibility_settings,approval_status,approval_submitted_at,approval_reviewed_at,' +
        'approval_notes',
    )
    .single();

  if (updateError || !updatedProfile) {
    return new Response(
      JSON.stringify({
        success: false,
        error: updateError?.message ?? 'Failed to assign patient to counselor.',
      }),
      { status: 500, headers: corsHeaders },
    );
  }

  const authUser = await fetchAuthUsers(serviceClient, [payload.patientId]);
  const authData = authUser.get(payload.patientId);

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        ...updatedProfile,
        email: authData?.email ?? updatedProfile.metadata?.email ?? null,
        lastLogin: authData?.last_login ?? updatedProfile.updated_at,
        createdAt: authData?.created_at ?? updatedProfile.created_at,
      },
    }),
    { status: 200, headers: corsHeaders },
  );
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ success: false, error: 'Missing authorization header.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  let payload: AdminRequestBody;
  try {
    payload = (await req.json()) as AdminRequestBody;
  } catch (_err) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  if (!payload?.action) {
    return new Response(JSON.stringify({ success: false, error: 'Missing action in payload.' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!bearerToken || bearerToken.trim().length === 0) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid authorization header.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const serviceClient = createServiceClient();

  const {
    data: { user },
    error: authError,
  } = await serviceClient.auth.getUser(bearerToken);

  if (authError || !user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  // Check authorization based on action
  // Some actions require admin, others allow counselors
  try {
    if (payload.action === 'assignPatientToCounselor') {
      // Allow counselors to assign patients
      await assertIsAdminOrCounselor(serviceClient, user.id);
    } else if (payload.action === 'getUser') {
      // Allow counselors to get user info for patients they're assigned to or have sessions with
      const getUserPayload = payload as GetUserRequest;
      const { data: userProfile } = await serviceClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      
      // If user is admin, allow
      if (userProfile?.role === 'admin') {
        // Admin can access any user
      } else if (userProfile?.role === 'counselor') {
        // Counselor can only access patients they're assigned to or have sessions with
        const { data: targetProfile } = await serviceClient
          .from('profiles')
          .select('role, assigned_counselor_id')
          .eq('id', getUserPayload.userId)
          .maybeSingle();
        
        if (targetProfile?.role === 'patient') {
          // Check if patient is assigned to this counselor
          if (targetProfile.assigned_counselor_id === user.id) {
            // Allowed - patient is assigned to this counselor
          } else {
            // Check if they have a session together
            const { data: session } = await serviceClient
              .from('sessions')
              .select('id')
              .eq('patient_id', getUserPayload.userId)
              .eq('counselor_id', user.id)
              .limit(1)
              .maybeSingle();
            
            if (!session) {
              const err = new Error('Forbidden: You can only view profiles of patients assigned to you or patients you have sessions with.');
              err.name = 'ForbiddenError';
              throw err;
            }
          }
        } else {
          // Counselor trying to access non-patient - not allowed
          const err = new Error('Forbidden: You can only view patient profiles.');
          err.name = 'ForbiddenError';
          throw err;
        }
      } else {
        // Not admin or counselor
        await assertIsAdmin(serviceClient, user.id);
      }
    } else {
      // All other actions require admin
    await assertIsAdmin(serviceClient, user.id);
    }
  } catch (error) {
    const status = error instanceof Error && error.name === 'ForbiddenError' ? 403 : 500;
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Authorization check failed.',
      }),
      { status, headers: corsHeaders },
    );
  }

  switch (payload.action) {
    case 'listUsers':
      return handleListUsers(serviceClient, payload);
    case 'getUser':
      return handleGetUser(serviceClient, payload);
    case 'updateUserRole':
      return handleUpdateUserRole(serviceClient, payload);
    case 'deleteUser':
      return handleDeleteUser(serviceClient, payload);
    case 'updateCounselorApproval':
      return handleUpdateCounselorApproval(serviceClient, payload, user.id);
    case 'assignPatientToCounselor':
      return handleAssignPatientToCounselor(serviceClient, payload);
    default:
      return new Response(JSON.stringify({ success: false, error: 'Unsupported admin action.' }), {
        status: 400,
        headers: corsHeaders,
      });
  }
});


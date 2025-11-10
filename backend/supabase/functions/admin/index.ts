/**
 * Edge function handler for privileged admin operations.
 *
 * Provides a secure API surface mirroring the AdminApi helper functions in
 * the frontend. Every request must be authenticated as an admin prior to
 * executing the requested action. The function uses the Supabase service role
 * key to bypass RLS after verifying the caller.
 */
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1';

type AdminAction = 'listUsers' | 'getUser' | 'updateUserRole' | 'deleteUser';

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

interface DeleteUserRequest extends BaseAdminRequest {
  action: 'deleteUser';
  userId: string;
}

type AdminRequestBody = ListUsersRequest | GetUserRequest | UpdateUserRoleRequest | DeleteUserRequest;

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
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
 * Create a Supabase client that uses the caller's JWT via the Authorization header.
 *
 * @param authHeader Authorization header from the request.
 * @returns Supabase client scoped to the caller's JWT.
 */
const createAuthedClient = (authHeader: string): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
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
        'approval_notes,counselor_profiles(*)',
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

  const combined = (data ?? []).map((row) => {
    const authUser = authUsersMap.get(row.id);
    return {
      ...row,
      email: authUser?.email ?? row.metadata?.email ?? null,
      lastLogin: authUser?.last_login ?? row.updated_at,
      createdAt: authUser?.created_at ?? row.created_at,
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
        'approval_notes,counselor_profiles(*)',
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

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        ...data,
        email: authData?.email ?? data.metadata?.email ?? null,
        lastLogin: authData?.last_login ?? data.updated_at,
        createdAt: authData?.created_at ?? data.created_at,
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
        'approval_notes,counselor_profiles(*)',
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

  const serviceClient = createServiceClient();
  const authedClient = createAuthedClient(authHeader);

  const {
    data: { user },
    error: authError,
  } = await authedClient.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    await assertIsAdmin(serviceClient, user.id);
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
    default:
      return new Response(JSON.stringify({ success: false, error: 'Unsupported admin action.' }), {
        status: 400,
        headers: corsHeaders,
      });
  }
});

